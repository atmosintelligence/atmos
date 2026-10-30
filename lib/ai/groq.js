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
CATEGORY|SEVERITY|Title|Text|Saving

- CATEGORY: one of GENERAL, LIGHTING, HUMIDITY, HVAC, POWER, TRENDS
- SEVERITY: one of CRITICAL, WARNING, INFO
- Title: max 4 words, no title case, plain, no punctuation
- Text: the actionable recommendation, 50-250 characters
- Saving: estimated INR saving as a plain number (e.g. 12.50), or 0 if not calculable, no "₹" symbol

Separate optimisations with a blank line. Output nothing except the optimisation lines.
/no_think`;

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
    'timestamp,power_w,energy_kwh,voltage_v,temp_c,humidity_pct,light_lux,occupancy';
  const rows = recent.map(r => [
    r.timestamp,
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
Consumed this month: ${environmental.actualKwh} kWh | BEE benchmark: ${environmental.baselineKwh} kWh
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
Humidity anomalies outside 30–70% range (T3): ${t3Events.length} events`);
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
      .map(o => `- [${o.severity}] ${o.group}: ${o.title} — ${o.message}`)
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
    .split(/\n\n+/)
    .map(s => s.replace(/\n/g, ' ').trim())
    .filter(s => s.includes('|'))
    .map(s => {
      const parts = s.split('|');
      if (parts.length < 4) return null;

      const group    = parts[0].trim().toUpperCase();
      const severity = parts[1].trim().toLowerCase();
      const rawTitle = parts[2].trim().slice(0, 60);
      const title    = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1).toLowerCase();
      const saving   = parts[parts.length - 1].trim();
      const text     = parts.slice(3, parts.length - 1).join('').trim();

      if (!VALID_GROUPS.has(group))                      return null;
      if (!VALID_SEVERITIES.has(severity.toUpperCase())) return null;
      if (!title || !text || text.length < 20)           return null;

      const savingNum = parseFloat(saving);

      return {
        group:      group.charAt(0) + group.slice(1).toLowerCase(),
        severity:   severity,
        title:      title,
        message:    text.slice(0, 250),
        saving_inr: isNaN(savingNum) || savingNum === 0 ? null : savingNum
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

  return parseAIResponse(content);
}
