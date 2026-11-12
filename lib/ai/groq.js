import Groq from 'groq-sdk';
import { tempOf, humidityOf, luxOf, isOccupied } from '@/lib/engine/utils.js';

const SYSTEM_PROMPT = `You are an energy optimisation assistant for one room. Using only the data given, write 1-5 practical, specific optimisations in simple British English. Never invent facts. Do not repeat recent alerts unless the evidence is new. Currency is ₹, no emojis.

The sensor reports temperature, humidity, light and occupancy only. It does not measure power, so never state a measured wattage. Energy and ₹ figures are estimates from assumed appliance loads; say "about" or "around" when you quote them.

Output one line per optimisation, separated by a blank line. No headings, numbering or Markdown. EXACTLY this format:
CATEGORY|SEVERITY|Title|Text|Saving|Date/time

CATEGORY: GENERAL, LIGHTING, HUMIDITY, HVAC, STANDBY or TRENDS
SEVERITY: CRITICAL, WARNING or INFO
Title: max 4 words, plain, no punctuation
Text: 50-250 characters, tell the user what to do
Saving: estimated ₹ as a plain number, or 0
Date/time: the time of the one row in Readings that best shows the problem (the latest such row for ongoing problems). Copy it exactly from that row's time column. Never invent a time.

Example (the last field is a placeholder, always use a real row time):
LIGHTING|WARNING|Lights left on|The room was empty for 3 hours after dark but the light sensor still read 280 lux. Switch the lights off when leaving to save about ₹40 a day.|41.07|<row time>
/no_think`;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DATE_RE = /^(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?,?\s+(?:(\d{4}),?\s+)?(\d{1,2}):(\d{2})$/;

const GROUP_LABEL = {
  GENERAL:  'General',
  LIGHTING: 'Lighting',
  HUMIDITY: 'Humidity',
  HVAC:     'HVAC',
  STANDBY:  'Standby',
  POWER:    'Standby',
  TRENDS:   'Trends',
};
const VALID_SEVERITIES = new Set(['CRITICAL', 'WARNING', 'INFO']);
const READING_ROWS = 24;

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

// Only the country is needed, so the coordinates are rounded to about 11 km before they
// leave the server.
async function getCountry(lat, lon) {
  if (lat == null || lon == null) return 'India';
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${Number(lat).toFixed(1)}&longitude=${Number(lon).toFixed(1)}&localityLanguage=en`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return 'Unknown';
    const data = await res.json();
    return data.countryName ?? 'Unknown';
  } catch {
    return 'Unknown';
  }
}

function recentReadings(readings) {
  return [...readings]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(-READING_ROWS);
}

function snapToReading(iso, rows) {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  let best = null;
  let gap = Infinity;
  for (const r of rows) {
    const d = Math.abs(new Date(r.timestamp).getTime() - target);
    if (d < gap) {
      gap = d;
      best = r;
    }
  }
  return best && gap <= 90_000 ? new Date(best.timestamp).toISOString() : null;
}

function formatReadings(readings) {
  const rows = recentReadings(readings).map(r => [
    formatPromptTime(r.timestamp),
    tempOf(r).toFixed(1),
    Math.round(humidityOf(r)),
    Math.round(luxOf(r)),
    isOccupied(r) ? 1 : 0,
  ].join(','));
  return ['time,°C,%,lux,occ', ...rows].join('\n');
}

const sum = (events, key) => events.reduce((s, e) => s + parseFloat(e[key] || 0), 0);

function describeFindings({ analysis, environmental, loads }) {
  const lines = [];
  const add = (label, count, extra = '') => {
    if (count) lines.push(`${label}: ${count} readings${extra}`);
  };

  if (loads) {
    lines.push(`Assumed loads (estimates, not measured): lights ${Math.round(loads.lighting)} W, AC ${Math.round(loads.ac)} W, standby ${Math.round(loads.standby)} W`);
  }
  if (environmental) {
    const source = environmental.monthlyKwhKnown ? 'entered by the owner' : 'assumed from the BEE benchmark';
    lines.push(`Monthly use ${environmental.monthlyKwh} kWh (${source}); BEE benchmark for this room ${environmental.benchmarkMonthlyKwh} kWh`);
  }

  if (analysis?.lighting) {
    const { l1Events, l2Events } = analysis.lighting;
    add('Lights on in empty room after dark', l1Events.length, `, about ₹${sum(l1Events, 'waste').toFixed(0)} wasted`);
    add('Bright daylight while occupied', l2Events.length);
  }

  if (analysis?.hvac) {
    const { t1Events, t2Events, t3Events } = analysis.hvac;
    add('AC apparently running in empty room', t1Events.length, `, about ₹${sum(t1Events, 'waste').toFixed(0)} wasted`);
    add('Ventilation chances', t2Events.length);
    add('Humidity out of range', t3Events.length);
  }

  if (analysis?.standby) {
    const { s1Events } = analysis.standby;
    add('Room empty for hours in daytime (standby)', s1Events.length);
  }

  if (analysis?.trends) {
    const { trend1, trend2 } = analysis.trends;
    if (trend1) lines.push(`Avoidable energy this week ${trend1.thisKwh} kWh vs ${trend1.lastKwh} kWh last week`);
    if (trend2) lines.push(`${trend2.share}% of waste happens around ${trend2.hour}:00 local time`);
  }

  return lines.join('\n');
}

function buildUserPrompt({ profile, readings, engineResult, priorAlerts, country }) {
  const sections = [
    `${country} | ₹${profile.tariff_rate ?? 10}/kWh`,
    `Readings (UTC):\n${formatReadings(readings)}`,
  ];

  const findings = describeFindings(engineResult);
  if (findings) sections.push(`Engine findings:\n${findings}`);

  const flagged = engineResult.optimizations ?? [];
  if (flagged.length) {
    const list = flagged
      .map(o => `- [${o.severity}] ${o.group}: ${o.message}${o.timestamp ? ` (${formatPromptTime(o.timestamp)})` : ''}`)
      .join('\n');
    sections.push(`Rule alerts (strong signals, rephrase them):\n${list}`);
  }

  const titles = [...new Set((priorAlerts ?? []).map(a => a.title))].slice(0, 8);
  if (titles.length) sections.push(`Recent alerts (avoid repeating): ${titles.join('; ')}`);

  return sections.join('\n\n');
}

function parseAIResponse(content) {
  return content
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/```[a-z]*/gi, '')
    .replace(/\n[ \t]*(\d+(?:\.\d+)?)[ \t]*(?=\n|$)/g, '|$1')
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

      const hasSaving = end >= 5 && /^[\d.,₹\s-]+$/.test(parts[end - 1]);
      const savingNum = hasSaving ? parseFloat(parts[end - 1].replace(/[^\d.]/g, '')) : NaN;
      if (hasSaving) end -= 1;

      const text = parts.slice(3, end).join(' ').trim();

      if (!GROUP_LABEL[group])             return null;
      if (!VALID_SEVERITIES.has(severity)) return null;
      if (!title || text.length < 20)      return null;

      return {
        group:      GROUP_LABEL[group],
        severity:   severity.toLowerCase(),
        title,
        message:    text.slice(0, 250),
        saving_inr: isNaN(savingNum) || savingNum === 0 ? null : savingNum,
        timestamp,
      };
    })
    .filter(Boolean);
}

export async function generateAIOptimizations({ profile, readings, engineResult, priorAlerts }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const groq    = new Groq({ apiKey });
  const country = await getCountry(profile.latitude, profile.longitude);

  const completion = await groq.chat.completions.create({
    model:    'qwen/qwen3.8-27b',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: buildUserPrompt({ profile, readings, engineResult, priorAlerts, country }) },
    ],
    temperature:           0.4,
    max_completion_tokens: 600,
    reasoning_effort:      'none',
    top_p:                 1,
    stream:                false,
    stop:                  null,
  });

  const choice  = completion.choices[0]?.message;
  const content = choice?.content?.trim() || choice?.reasoning?.trim() || '';
  if (!content) throw new Error('Empty response from model');

  const rows   = recentReadings(readings);
  const parsed = parseAIResponse(content).map(o => ({
    ...o,
    timestamp: snapToReading(o.timestamp, rows),
  }));
  console.log('[Atmos AI] parsed count:', parsed.length);
  return parsed;
}
