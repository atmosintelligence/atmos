import Groq from 'groq-sdk';
import { parseAiSchedule } from '@/lib/schedules';

const SYSTEM_PROMPT = `You are Atmos Intelligence. Plan a weekly on/off schedule for the appliances in one room, from how the room has actually been used.

Rules:
- Appliances (TARGET): LIGHT, FAN, AC
- Return 2-12 rules. Prefer few, clear rules over many
- Turn things OFF shortly after the room usually empties, and ON shortly before it is usually occupied, only when the pattern is clear
- Use only the usage summary provided. Never invent a pattern
- Do not repeat or conflict with the rules the user already set
- Use 24-hour local time
- Reason: one short plain sentence, British English, under 120 characters, no emojis
- No introduction, headings, numbering or Markdown

IMPORTANT: Each rule must be a single line in EXACTLY this format:
TARGET|ACTION|DAYS|HH:MM|Reason

- ACTION: ON or OFF
- DAYS: Daily, Weekdays, Weekends, or a comma list / range of Mon Tue Wed Thu Fri Sat Sun (e.g. Mon-Fri or Mon,Wed,Fri)
- HH:MM: 24-hour time, e.g. 08:30

Example:
LIGHT|OFF|Mon-Fri|19:30|The room is usually empty after 19:00 on weekdays.
/no_think`;

const DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_LABEL  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MIN_DAYS   = 3;

// Per weekday: the hours (local time) in which the room was occupied at least
// half of the readings, plus how many days of data each weekday has.
export function summariseUsage(readings, tz) {
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: '2-digit', hour12: false });
  const buckets = new Map();
  const days    = new Set();

  for (const r of readings) {
    const parts = fmt.formatToParts(new Date(r.timestamp));
    const wd    = parts.find(p => p.type === 'weekday')?.value;
    const hour  = Number(parts.find(p => p.type === 'hour')?.value) % 24;
    if (!wd || Number.isNaN(hour)) continue;

    const key = `${wd}-${hour}`;
    const b   = buckets.get(key) ?? { n: 0, occupied: 0, power: 0 };
    b.n += 1;
    if (Number(r.occupancy) > 0) b.occupied += 1;
    b.power += Number(r.power) || 0;
    buckets.set(key, b);
    days.add(new Date(r.timestamp).toISOString().slice(0, 10));
  }

  const lines = DAYS_ORDER.map(d => {
    const label = DAY_LABEL[d];
    const hours = [];
    for (let h = 0; h < 24; h++) {
      const b = buckets.get(`${label}-${h}`);
      if (b && b.occupied / b.n >= 0.5) hours.push(h);
    }
    return `${label}: ${hours.length ? hours.map(h => `${String(h).padStart(2, '0')}:00`).join(' ') : 'no occupied hours'}`;
  });

  return { text: lines.join('\n'), daysOfData: days.size };
}

function describeRule(r) {
  const days = r.days.map(d => DAY_LABEL[d]).join(',');
  return `- ${r.target.toUpperCase()} ${r.action.toUpperCase()} ${days} ${r.time}`;
}

// Returns [{ target, action, days, time, reason }]. Throws if there is not enough data.
export async function generateAISchedule({ readings, timeZone, existingRules }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const { text, daysOfData } = summariseUsage(readings, timeZone);
  if (daysOfData < MIN_DAYS) {
    throw new Error(`Not enough data yet. Atmos needs at least ${MIN_DAYS} days of readings to suggest a schedule.`);
  }

  const user = [
    `Time zone: ${timeZone}`,
    `Days of data: ${daysOfData}`,
    `## Occupied hours by weekday (local time)\n${text}`,
    existingRules.length
      ? `## Rules the user already set (do not repeat or conflict)\n${existingRules.map(describeRule).join('\n')}`
      : '## Rules the user already set\nNone.',
    'Return only the rule lines.',
  ].join('\n\n');

  const completion = await new Groq({ apiKey }).chat.completions.create({
    model:    'qwen/qwen3.8-27b',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: user },
    ],
    temperature:           0.3,
    max_completion_tokens: 600,
    reasoning_effort:      'none',
    top_p:                 1,
    stream:                false,
  });

  const message = completion.choices[0]?.message;
  const content = message?.content?.trim() || message?.reasoning?.trim() || '';
  if (!content) throw new Error('Empty response from model');

  return parseAiSchedule(content);
}
