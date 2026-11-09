import Groq from 'groq-sdk';

const SYSTEM_PROMPT = `You are Atmos Intelligence, an energy optimisation assistant. Generate practical, context-specific room energy optimisations using the supplied sensor data, historical patterns, JavaScript inferences, approximate location, country, subscription plan, and recent recommendations.

Rules:
- Return 1-10 optimisations based on information available to you
- Each optimisation must be 50-250 characters (the text part only), including spaces
- Use simple, direct, understandable British English
- Every recommendation should be actionable; tell the user what they can do to improve their energy savings
- Avoid repeating recent recommendations unless current evidence justifies them
- Never invent any facts
- Consider the user's context
- Use "₹" (INR) for currency, no emojis
- No introductory text, headings, numbering, bullet points, or Markdown

IMPORTANT: Each optimisation must be a single line in EXACTLY this format:
CATEGORY|SEVERITY|Title|Text|Saving|Date/time

- CATEGORY: one of GENERAL, LIGHTING, HUMIDITY, HVAC, POWER, TRENDS
- SEVERITY: one of CRITICAL, WARNING, INFO
- Title: max 4 words, no title case, plain, no punctuation
- Text: the actionable recommendation, 50-250 characters
- Saving: estimated INR saving as a plain number (e.g. 12.50), or 0 if not calculable, no "₹" symbol
- Date/time: the date and time (UTC) of the sensor reading this optimisation is based on, copied exactly from the readings table or the rule-based list. Format: D Mon YYYY HH:mm, 24-hour, short month name, no leading zero on the day (e.g. 5 Oct 2026 13:40, 23 Nov 2026 07:05). Never invent a time that is not in the data

Example line:
LIGHTING|WARNING|Lights left on|The room was empty for 3 hours with lights drawing 226 W. Switch them off when leaving to save about ₹40 a day.|41.07|5 Oct 2026 13:40

Separate optimisations with a blank line. Output nothing except the optimisation lines.
/no_think`;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DATE_RE = /^(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?,?\s+(\d{4}),?\s+(\d{1,2}):(\d{2})$/;

// "5 Oct 2026 13:40" in UTC, the format the model is asked to copy.
function formatPromptTime(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

// Turns the model's date text back into an ISO string, or null if it is
// malformed or outside the last 31 days.
function parseReadingTime(text) {
  const m = DATE_RE.exec(text.trim());
  if (!m) return null;
  const month = MONTHS.findIndex(name => name.toLowerCase() === m[2].toLowerCase());
  if (month < 0) return null;
  const time = Date.UTC(+m[3], month, +m[1], +m[4], +m[5]);
  const now  = Date.now();
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
  const recent = [...readings]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(-48);
  const header =
    'time_utc,power_w,energy_kwh,voltage_v,temp_c,humidity_pct,light_lux,occupancy';
  const rows = recent.map(r => [
    formatPromptTime(r.timestamp),
    r.power ?? '—',
    r.energy ?? '—',
    r.voltage ?? '—',
    r.temperature ?? '—',
    r.humidity ?? '—',
    r.light ?? '—',
    r.occupancy,
  ].join(','));
  return [header, ...rows].join('\n');
}

function buildUserPrompt({
  profile, readings, engineResult, priorAlerts, country, interval
}) {
  const sections = [];
  sections.push(`## Device & Context
Fetching interval: ${interval}
Approximate geography: ${profile.latitude}, ${profile.longitude} (${country})
Subscription plan: ${profile.plan ?? 'spark'}
Tariff rate: ₹${profile.tariff_rate ?? 10}/kWh
Room area: ~20 m²`);
  sections.push(`## Recent Sensor Readings (last 48 readings)
${formatReadings(readings)}`);
  const { analysis, environmental } = engineResult;
  const inferenceParts = [];

  if (environmental) inferenceParts.push(`### Environmental Savings
Consumed over the last ${environmental.periodDays} days: ${environmental.actualKwh} kWh | BEE benchmark: ${environmental.baselineKwh} kWh
Saved: ${environmental.savedKwh} kWh | CO₂ prevented: ${environmental.co2KgSaved} kg | Money saved: ₹${environmental.moneySavedINR}`);

  if (analysis?.lighting) {
    const { l1Events, l2Events, idleBaseline } = analysis.lighting;
    const l1Waste = l1Events
      .reduce((a, e) => a + parseFloat(e.waste || 0), 0)
      .toFixed(2);

    inferenceParts.push(`### Lighting
Idle baseline: ${idleBaseline.toFixed(0)} W
Empty room events (L1): ${l1Events.length} | Total estimated waste: ₹${l1Waste}
Daylight harvesting opportunities (L2): ${l2Events.length}`);
  }

  if (analysis?.hvac) {
    const { t1Events, t2Events, t3Events } = analysis.hvac;

    inferenceParts.push(`### Temperature & Humidity
HVAC running in empty room (T1): ${t1Events.length} events
Natural ventilation opportunities (T2): ${t2Events.length} events
Humidity anomalies outside 28–72% range (T3): ${t3Events.length} events`);
  }

  if (analysis?.power) {
    const {
      p1Events,
      p2Events,
      p3Events,
      avgPower,
      maxPower
    } = analysis.power;

    inferenceParts.push(`### Power Usage
Average power: ${avgPower.toFixed(0)} W | Peak: ${maxPower.toFixed(0)} W
Spike anomalies z>2.5 (P1): ${p1Events.length}
Phantom load events >80W while empty >4hrs (P2): ${p2Events.length}
Voltage irregularities outside 210–245V (P3): ${p3Events.length}`);
  }

  if (analysis?.trends) {
    const {
      trend1,
      trend2,
      avgPowerThisWeek,
      avgPowerLastWeek
    } = analysis.trends;
    const trendSummary = trend1
      ? `${trend1.changePct}% ${trend1.rising
        ? '(rising — above threshold)'
        : '(stable)'
      }`
      : 'insufficient data';
    const degradation = trend2
      ? `slope ${trend2.slope} W/day, R²=${trend2.r2} (degradation signal detected)`
      : 'none detected';

    inferenceParts.push(`### Trends & Predictions
This week avg: ${avgPowerThisWeek.toFixed(0)} W | Last week avg: ${avgPowerLastWeek.toFixed(0)} W
Week-over-week change: ${trendSummary}
Predictive degradation: ${degradation}`);
  }
  sections.push(
    `## Engine Inferences\n${inferenceParts.join('\n\n')}`
  );
  const jsOpts = engineResult.optimizations ?? [];
  if (jsOpts.length > 0) {
    const list = jsOpts
      .map(o => `- [${o.severity}] ${o.group}: ${o.title} — ${o.message}${o.timestamp ? ` (reading: ${formatPromptTime(o.timestamp)})` : ''}`)
      .join('\n');
    sections.push(`## Rule-based Optimisations (detected by the JS engine)
Use these as strong signals. You may rephrase or expand them but do not ignore significant ones. Do not duplicate their titles exactly.
${list}`);
  } else {
    sections.push(`## Rule-based Optimisations
None detected by the JS engine for this reading set.`);
  }
  if (priorAlerts?.length) {
    const list = priorAlerts
      .slice(0, 15)
      .map(a =>
        `- [${a.severity}] ${a.title} — ${a.explanation ?? a.message?.slice(0, 80) ?? ''
        }`
      )
      .join('\n');
    sections.push(`## Prior Alerts — Avoid repeating these titles
${list}`);
  } else {
    sections.push(`## Prior Alerts
None yet — this is the first optimisation run for this device.`);
  }
  sections.push(
    'Generate up to 5 new optimisations quickly. Return only the optimisation lines, separated by blank lines. Do not return JSON.'
  );
  return sections.join('\n\n');
}

function parseAIResponse(content) {
  const VALID_GROUPS     = new Set(['GENERAL', 'LIGHTING', 'HUMIDITY', 'HVAC', 'POWER', 'TRENDS']);
  const VALID_SEVERITIES = new Set(['CRITICAL', 'WARNING', 'INFO']);

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
      const rawTitle = parts[2].trim().slice(0, 60);
      const title    = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1).toLowerCase();

      let end = parts.length;
      const hasDate = end >= 5 && DATE_RE.test(parts[end - 1]);
      const timestamp = hasDate ? parseReadingTime(parts[end - 1]) : null;
      if (hasDate) end -= 1;

      const hasSaving = end >= 5 && /^[\d.,₹\s-]+$/.test(parts[end - 1]);
      const savingNum = hasSaving ? parseFloat(parts[end - 1].replace(/[^\d.]/g, '')) : NaN;
      if (hasSaving) end -= 1;

      const text = parts.slice(3, end).join(' ').trim();

      if (!VALID_GROUPS.has(group))         return null;
      if (!VALID_SEVERITIES.has(severity))  return null;
      if (!title || text.length < 20)       return null;

      return {
        group:      group.charAt(0) + group.slice(1).toLowerCase(),
        severity:   severity.toLowerCase(),
        title,
        message:    text.slice(0, 250),
        saving_inr: isNaN(savingNum) || savingNum === 0 ? null : savingNum,
        timestamp,
      };
    })
    .filter(Boolean);
}

export async function generateAIOptimizations({ profile, readings, engineResult, priorAlerts, interval }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const groq    = new Groq({ apiKey });
  const country = await getCountry(profile.latitude, profile.longitude);

  const completion = await groq.chat.completions.create({
    model:    'qwen/qwen3.8-27b',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: buildUserPrompt({ profile, readings, engineResult, priorAlerts, country, interval }) },
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

  console.log('[Atmos AI] raw output:\n', content);
  const parsed = parseAIResponse(content);
  console.log('[Atmos AI] parsed count:', parsed.length);
  return parsed;
}
