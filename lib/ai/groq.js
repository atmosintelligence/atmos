import Groq from 'groq-sdk';
import { powerOf, tempOf, humidityOf, luxOf, isOccupied, intervalHours } from '@/lib/engine/utils.js';
import { ASSUMED_LOADS, LIKELIHOODS } from '@/lib/engine/constants.js';

const SYSTEM_PROMPT = `You are an energy optimisation assistant for one room in India. Using only the data given, write 1-5 practical, specific optimisations in simple British English. Never invent facts. Do not repeat recent alerts unless the evidence is new. Currency is ₹, no emojis.

Every ₹ figure is an estimate, so say "about" when you quote one.

HOW TO WORK OUT THE SAVING (follow exactly)
Saving ₹ = Watts ÷ 1000 × Hours × Likelihood × Tariff
- Watts: the extra load that switching off (or changing the setting) removes. If the data gives measured power, use the measured watts above the idle baseline. Otherwise use the room's assumed loads, never more:
  lights = the lights load; AC = the AC load (already an average for a cycling compressor); idle devices = the standby load.
  AC set point raised by D °C: Watts = AC load × 0.06 × D (BEE: about 6% less energy per 1 °C, use 24 °C or higher).
  Other appliances only if the data supports them: ceiling fan 50-75 W (BLDC fan 30 W).
- Hours: how long the waste actually lasted in the readings: (number of rows showing it) × (minutes between rows) ÷ 60. Count only rows that show the problem. Never more than the hours the readings cover. Never project into the future or multiply by days.
- Likelihood: how sure the readings are that the appliance was really on.
  1 = direct evidence (e.g. after dark, room empty, light still over 120 lux, or measured power clearly above the idle baseline).
  0.5 = strong sign (e.g. empty room in the day held at 24 °C or below while it is warmer outside, so the AC is probably on).
  0.25 = only possible (e.g. bright daylight while occupied: lamps may or may not be on; room warm and occupied: AC may not be on).
- Tariff: the ₹/kWh given in the data.
The Saving field is the cost of this one stretch of waste only. You may add in the Text what it would cost if it happens every working day (multiply by 22 for a month).
If there is no avoidable load (humidity advice, trends, comfort tips), Watts, Hours, Likelihood and Saving are 0.
Check each saving against the "Engine estimate" in the data. If yours is more than double or less than half of it, recheck your hours and likelihood.

Output one line per optimisation, separated by a blank line. No headings, numbering or Markdown. EXACTLY this format, 9 fields:
CATEGORY|SEVERITY|Title|Text|Watts|Hours|Likelihood|Saving|Date/time

CATEGORY: GENERAL, LIGHTING, HUMIDITY, HVAC, POWER or TRENDS
SEVERITY: CRITICAL, WARNING or INFO
Title: max 4 words, plain, no punctuation
Text: 50-250 characters, tell the user what to do
Watts, Hours, Likelihood, Saving: plain numbers, no units
Date/time: the time of the one row in Readings that best shows the problem (the latest such row for ongoing problems). Copy it exactly from that row's time column. Never invent a time.

Worked examples (numbers only illustrate the method; the last field is a placeholder, always use a real row time):
Lights 120 W, 6 rows of 30 min after dark, empty, 300 lux, tariff ₹10: 120 ÷ 1000 × 3 × 1 × 10 = 3.60
LIGHTING|WARNING|Lights left on|The room was empty for 3 hours after dark with the lights on. Switching them off when leaving saves about ₹3.60 each time, about ₹79 a month.|120|3|1|3.60|<row time>
AC 1200 W, 4 rows of 30 min, empty, 23.8 °C, 31 °C outside, tariff ₹8: 1200 ÷ 1000 × 2 × 0.5 × 8 = 9.60
HVAC|WARNING|AC on empty room|The room has been empty for 2 hours but is held at 23.8 °C on a 31 °C day, so the AC is probably on. Switch it off when leaving.|1200|2|0.5|9.60|<row time>
/no_think`;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DATE_RE = /^(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?,?\s+(?:(\d{4}),?\s+)?(\d{1,2}):(\d{2})$/;
const NUMBER_RE = /^[\d.,₹\s-]+$/;

const GROUP_LABEL = {
  GENERAL:  'General',
  LIGHTING: 'Lighting',
  HUMIDITY: 'Humidity',
  HVAC:     'HVAC',
  POWER:    'Power',
  TRENDS:   'Trends',
};
const LOAD_KEY = {
  Lighting: 'lights',
  HVAC:     'ac',
  General:  'ac',
  Humidity: 'ac',
  Power:    'standby',
};
const VALID_SEVERITIES = new Set(['CRITICAL', 'WARNING', 'INFO']);
const READING_ROWS = 24;

const sum = (events, key) => events.reduce((s, e) => s + parseFloat(e[key] || 0), 0);
const toNumber = text => parseFloat(String(text).replace(/[^\d.]/g, ''));

function formatPromptTime(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

function parseReadingTime(text) {
  const m = DATE_RE.exec(text.trim());
  if (!m) return null;
  const month = MONTHS.findIndex(name => name.toLowerCase() === m[2].toLowerCase());
  if (month < 0) return null;

  const now  = Date.now();
  const year = m[3] ? +m[3] : new Date(now).getUTCFullYear();
  let time   = Date.UTC(year, month, +m[1], +m[4], +m[5]);
  if (!m[3] && time > now + 86_400_000) time = Date.UTC(year - 1, month, +m[1], +m[4], +m[5]);

  if (Number.isNaN(time) || time > now + 86_400_000 || time < now - 31 * 86_400_000) return null;
  return new Date(time).toISOString();
}

async function getCountry(lat, lon) {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return 'Unknown';
    const data = await res.json();
    return data.countryName ?? 'Unknown';
  } catch {
    return 'Unknown';
  }
}

function recentWindow(readings, idleBaseline) {
  const rows    = [...readings]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(-READING_ROWS);
  const hours   = intervalHours(rows);
  const ordered = [...hours].sort((a, b) => a - b);
  const powers  = rows.map(powerOf);
  const peak    = powers.length ? Math.max(...powers) : 0;

  return {
    rows,
    coveredHours: hours.reduce((a, b) => a + b, 0),
    gapMinutes:   Math.round((ordered[Math.floor(ordered.length / 2)] ?? 0) * 60),
    peak,
    idleBaseline,
    measuredExtra: peak > 0 ? Math.max(0, peak - idleBaseline) : 0,
  };
}

function formatReadings(rows) {
  const lines = rows.map(r => [
    formatPromptTime(r.timestamp),
    tempOf(r).toFixed(1),
    Math.round(humidityOf(r)),
    Math.round(luxOf(r)),
    Math.round(powerOf(r)),
    isOccupied(r) ? 1 : 0,
  ].join(','));
  return ['time,°C,%,lux,W,occ', ...lines].join('\n');
}

function describeFindings({ analysis, environmental }) {
  const lines = [];
  const add = (label, count) => {
    if (count) lines.push(`${label}: ${count} readings in the full history`);
  };

  if (Number(environmental?.periodDays) > 0) {
    const monthly = (Number(environmental.actualKwh) / Number(environmental.periodDays)) * 30;
    const bench   = (Number(environmental.baselineKwh) / Number(environmental.periodDays)) * 30;
    lines.push(`Monthly use about ${monthly.toFixed(0)} kWh (BEE benchmark for this room ${bench.toFixed(0)} kWh)`);
  }

  if (analysis?.lighting) {
    add('Load on in empty room', analysis.lighting.l1Events.length);
    add('Lights on in daylight', analysis.lighting.l2Events.length);
  }

  if (analysis?.hvac) {
    add('HVAC on in empty room', analysis.hvac.t1Events.length);
    add('Ventilation chances', analysis.hvac.t2Events.length);
    add('Humidity out of range', analysis.hvac.t3Events.length);
  }

  if (analysis?.power) {
    const { p1Events, p2Events, p3Events, avgPower, maxPower } = analysis.power;
    lines.push(`Power avg ${avgPower.toFixed(0)} W, peak ${maxPower.toFixed(0)} W`);
    add('Power spikes', p1Events.length);
    add('Phantom load', p2Events.length);
    add('Voltage faults', p3Events.length);
  }

  if (analysis?.trends) {
    const { trend1, trend2, avgPowerThisWeek, avgPowerLastWeek } = analysis.trends;
    if (avgPowerLastWeek > 0) {
      lines.push(`Weekly avg power: ${avgPowerThisWeek.toFixed(0)} W vs ${avgPowerLastWeek.toFixed(0)} W last week`);
    }
    if (trend1) lines.push(`Week-on-week energy: ${trend1.changePct}%`);
    if (trend2) lines.push(`Rising occupied power: ${trend2.slope} W/day`);
  }

  return lines;
}

function buildUserPrompt({ tariff, window, engineResult, priorAlerts, country }) {
  const zone = country === 'India' ? '; India local time is UTC+5:30, so after dark is about 12:30 UTC onwards' : '';
  const { lights, ac, standby } = ASSUMED_LOADS;
  const { outdoorWeather } = engineResult;

  const findings = [
    `Room's assumed loads (estimates, not measured): lights ${lights} W, AC ${ac} W, standby ${standby} W`,
    `Tariff: ₹${tariff}/kWh`,
  ];
  if (window.peak > 0) {
    findings.push(`Measured power in these rows: peak ${window.peak.toFixed(0)} W, idle baseline ${window.idleBaseline.toFixed(0)} W`);
  }
  if (outdoorWeather) {
    findings.push(`Outside now: ${outdoorWeather.temp} °C, humidity ${outdoorWeather.humidity}%, ${outdoorWeather.condition}`);
  }
  findings.push(...describeFindings(engineResult));

  const sections = [
    `${country} | ₹${tariff}/kWh`,
    `Readings (UTC${zone}). One row every ${window.gapMinutes} minutes; the rows cover about ${window.coveredHours.toFixed(1)} hours:\n${formatReadings(window.rows)}`,
    `Engine findings:\n${findings.join('\n')}`,
  ];

  const flagged = engineResult.optimizations ?? [];
  if (flagged.length) {
    const list = flagged
      .map(o => {
        const when     = o.timestamp ? ` (${formatPromptTime(o.timestamp)})` : '';
        const estimate = o.saving?.inr ? ` Engine estimate: ₹${o.saving.inr}.` : '';
        return `- [${o.severity}] ${o.group}: ${o.message}${estimate}${when}`;
      })
      .join('\n');
    sections.push(`Rule alerts (strong signals, rephrase them):\n${list}`);
  }

  const titles = [...new Set((priorAlerts ?? []).map(a => a.title))].slice(0, 8);
  if (titles.length) sections.push(`Recent alerts (avoid repeating): ${titles.join('; ')}`);

  return sections.join('\n\n');
}

function snapLikelihood(value) {
  return LIKELIHOODS.reduce((best, p) => (Math.abs(p - value) < Math.abs(best - value) ? p : best), 0);
}

function loadCap(group, window) {
  if (group === 'Trends') return 0;
  return window.measuredExtra > 0 ? window.measuredExtra : ASSUMED_LOADS[LOAD_KEY[group]];
}

function verifySaving(group, claimed, window, tariff) {
  const watts      = Math.min(Math.max(claimed.watts, 0), loadCap(group, window));
  const hours      = Math.min(Math.max(claimed.hours, 0), window.coveredHours);
  const likelihood = snapLikelihood(claimed.likelihood);
  const saving     = Number(((watts / 1000) * hours * likelihood * tariff).toFixed(2));
  const off        = Math.abs(saving - claimed.saving);

  if (off > 0.5 || off > saving * 0.1) {
    console.warn(`[Atmos AI] saving corrected for ${group}: AI said ₹${claimed.saving}, computed ₹${saving}`);
  }

  return {
    saving_inr:   saving > 0 ? saving : null,
    saving_basis: { watts: Math.round(watts), hours: Number(hours.toFixed(2)), likelihood },
  };
}

function parseAIResponse(content, window, tariff) {
  return content
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/```[a-z]*/gi, '')
    .split(/\r?\n/)
    .map(s => s.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter(s => s.split('|').length >= 4)
    .map(s => {
      const parts    = s.split('|').map(p => p.trim());
      const group    = parts[0].toUpperCase();
      const severity = parts[1].toUpperCase();
      const rawTitle = parts[2].slice(0, 60);
      const title    = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1).toLowerCase();

      let end = parts.length;
      const hasDate   = end >= 5 && DATE_RE.test(parts[end - 1]);
      const timestamp = hasDate ? parseReadingTime(parts[end - 1]) : null;
      if (hasDate) end -= 1;

      const tail       = parts.slice(Math.max(4, end - 4), end);
      const hasWorking = end >= 8 && tail.length === 4 && tail.every(p => NUMBER_RE.test(p));
      let claimed = null;
      if (hasWorking) {
        const [watts, hours, likelihood, saving] = tail.map(toNumber);
        if ([watts, hours, likelihood, saving].every(Number.isFinite)) {
          claimed = { watts, hours, likelihood, saving };
          end -= 4;
        }
      } else if (end >= 5 && NUMBER_RE.test(parts[end - 1])) {
        end -= 1;
      }

      const text = parts.slice(3, end).join(' ').trim();

      if (!GROUP_LABEL[group])             return null;
      if (!VALID_SEVERITIES.has(severity)) return null;
      if (!title || text.length < 20)      return null;

      const label  = GROUP_LABEL[group];
      const result = claimed
        ? verifySaving(label, claimed, window, tariff)
        : { saving_inr: null, saving_basis: null };

      return {
        group:     label,
        severity:  severity.toLowerCase(),
        title,
        message:   text.slice(0, 250),
        timestamp,
        ...result,
      };
    })
    .filter(Boolean);
}

export async function generateAIOptimizations({ profile, readings, engineResult, priorAlerts }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const tariff  = profile.tariff_rate ?? 10;
  const groq    = new Groq({ apiKey });
  const country = await getCountry(profile.latitude, profile.longitude);
  const window  = recentWindow(readings, engineResult.analysis?.lighting?.idleBaseline ?? 0);

  const completion = await groq.chat.completions.create({
    model:    'qwen/qwen3.8-27b',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: buildUserPrompt({ tariff, window, engineResult, priorAlerts, country }) },
    ],
    temperature:           0.2,
    max_completion_tokens: 800,
    reasoning_effort:      'none',
    top_p:                 1,
    stream:                false,
    stop:                  null,
  });

  const choice  = completion.choices[0]?.message;
  const content = choice?.content?.trim() || choice?.reasoning?.trim() || '';
  if (!content) throw new Error('Empty response from model');

  const parsed = parseAIResponse(content, window, tariff);
  console.log('[Atmos AI] parsed count:', parsed.length);
  return parsed;
}
