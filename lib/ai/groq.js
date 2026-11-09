import Groq from 'groq-sdk';
import { powerOf, tempOf, humidityOf, luxOf, isOccupied } from '@/lib/engine/utils.js';

const SYSTEM_PROMPT = `You are an energy optimisation assistant for one room. Using only the data given, write 1-5 practical, specific optimisations in simple British English. Never invent facts. Do not repeat recent alerts unless the evidence is new. Currency is ₹, no emojis.

Output one line per optimisation, separated by a blank line. No headings, numbering or Markdown. EXACTLY this format:
CATEGORY|SEVERITY|Title|Text|Saving|Date/time

CATEGORY: GENERAL, LIGHTING, HUMIDITY, HVAC, POWER or TRENDS
SEVERITY: CRITICAL, WARNING or INFO
Title: max 4 words, plain, no punctuation
Text: 50-250 characters, tell the user what to do
Saving: estimated ₹ as a plain number, or 0
Date/time: UTC time of the reading it is based on, copied exactly from the data (e.g. 5 Oct 13:40)

Example:
LIGHTING|WARNING|Lights left on|The room was empty for 3 hours with lights drawing 226 W. Switch them off when leaving to save about ₹40 a day.|41.07|5 Oct 13:40
/no_think`;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DATE_RE = /^(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?,?\s+(?:(\d{4}),?\s+)?(\d{1,2}):(\d{2})$/;

const GROUP_LABEL = {
  GENERAL:  'General',
  LIGHTING: 'Lighting',
  HUMIDITY: 'Humidity',
  HVAC:     'HVAC',
  POWER:    'Power',
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

function formatReadings(readings) {
  const rows = [...readings]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(-READING_ROWS)
    .map(r => [
      formatPromptTime(r.timestamp),
      Math.round(powerOf(r)),
      tempOf(r).toFixed(1),
      Math.round(humidityOf(r)),
      Math.round(luxOf(r)),
      isOccupied(r) ? 1 : 0,
    ].join(','));
  return ['time,W,°C,%,lux,occ', ...rows].join('\n');
}

const sum = (events, key) => events.reduce((s, e) => s + parseFloat(e[key] || 0), 0);

function describeFindings({ analysis, environmental }) {
  const lines = [];
  const add = (label, count, extra = '') => {
    if (count) lines.push(`${label}: ${count}${extra}`);
  };

  if (Number(environmental?.periodDays) > 0) {
    lines.push(`Energy over ${environmental.periodDays} days: ${environmental.actualKwh} kWh (BEE benchmark ${environmental.baselineKwh})`);
  }

  if (analysis?.lighting) {
    const { l1Events, l2Events, idleBaseline } = analysis.lighting;
    lines.push(`Idle baseline: ${idleBaseline.toFixed(0)} W`);
    add('Load on in empty room', l1Events.length, `, ₹${sum(l1Events, 'waste').toFixed(0)} wasted`);
    add('Lights on in daylight', l2Events.length);
  }

  if (analysis?.hvac) {
    const { t1Events, t2Events, t3Events } = analysis.hvac;
    add('HVAC on in empty room', t1Events.length);
    add('Ventilation chances', t2Events.length);
    add('Humidity out of range', t3Events.length);
  }

  if (analysis?.power) {
    const { p1Events, p2Events, p3Events, avgPower, maxPower } = analysis.power;
    lines.push(`Power avg ${avgPower.toFixed(0)} W, peak ${maxPower.toFixed(0)} W`);
    add('Power spikes', p1Events.length);
    add('Phantom load', p2Events.length, `, ₹${sum(p2Events, 'intervalCost').toFixed(0)} wasted`);
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

  const parsed = parseAIResponse(content);
  console.log('[Atmos AI] parsed count:', parsed.length);
  return parsed;
}
