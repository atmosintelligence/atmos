import Groq from 'groq-sdk';
import { parseAiSchedule } from '@/lib/schedules';
import { mean, powerOf, tempOf, humidityOf, luxOf } from '@/lib/engine/utils.js';

const SYSTEM_PROMPT = `Plan a weekly on/off schedule for one room's appliances (LIGHT, FAN, AC) from its real usage data.

Rules:
- 2-12 rules, few and clear
- OFF shortly after the room usually empties, ON shortly before it is occupied, only when the pattern is clear
- Use the waste findings to decide what to switch and when
- Use only the data given; never invent patterns
- Do not repeat or conflict with the user's rules
- 24-hour local time
- Reason: one plain British English sentence under 120 characters, no emojis, mention ₹ saved only if the data supports it
- Output only rule lines, nothing else

Format: TARGET|ACTION|DAYS|HH:MM|Reason
ACTION: ON or OFF. DAYS: Daily, Weekdays, Weekends, or Mon-Fri / Mon,Wed,Fri.
Example: LIGHT|OFF|Mon-Fri|19:30|The room is usually empty after 19:00.
/no_think`;

const DAYS_ORDER  = [1, 2, 3, 4, 5, 6, 0];
const DAY_LABEL   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MIN_DAYS    = 3;
const RECENT_ROWS = 12;

const pad = n => String(n).padStart(2, '0');
const isOccupied = r => r.occupancy === 'true' || Number(r.occupancy) > 0;
const avg = arr => (arr.length ? mean(arr).toFixed(0) : '-');

function localParser(tz) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  });
  return ts => {
    const parts = fmt.formatToParts(new Date(ts));
    const get   = type => parts.find(p => p.type === type)?.value;
    const hour  = Number(get('hour')) % 24;
    const wd    = get('weekday');
    if (!wd || Number.isNaN(hour)) return null;
    return { wd, hour, minute: Number(get('minute')) };
  };
}

function toRanges(hours) {
  const out = [];
  let start = null;
  let prev  = null;
  for (const h of hours) {
    if (start === null) start = h;
    else if (h !== prev + 1) {
      out.push(`${pad(start)}-${pad(prev + 1)}`);
      start = h;
    }
    prev = h;
  }
  if (start !== null) out.push(`${pad(start)}-${pad(prev + 1)}`);
  return out.join(' ');
}

export function summariseUsage(readings, tz) {
  const parse = localParser(tz);
  const slots = new Map();
  const stats = new Map();
  const days  = new Set();

  for (const r of readings) {
    const t = parse(r.timestamp);
    if (!t) continue;

    const key  = `${t.wd}-${t.hour}`;
    const slot = slots.get(key) ?? { n: 0, occ: 0 };
    slot.n += 1;
    const occ = isOccupied(r);
    if (occ) slot.occ += 1;
    slots.set(key, slot);

    const s = stats.get(t.wd) ?? { occW: [], emptyW: [], occT: [] };
    if (occ) {
      s.occW.push(powerOf(r));
      s.occT.push(tempOf(r));
    } else {
      s.emptyW.push(powerOf(r));
    }
    stats.set(t.wd, s);

    days.add(new Date(r.timestamp).toISOString().slice(0, 10));
  }

  const lines = DAYS_ORDER.map(d => {
    const label = DAY_LABEL[d];
    const hours = [];
    for (let h = 0; h < 24; h++) {
      const s = slots.get(`${label}-${h}`);
      if (s && s.occ / s.n >= 0.5) hours.push(h);
    }
    const s = stats.get(label) ?? { occW: [], emptyW: [], occT: [] };
    const occupied = hours.length ? toRanges(hours) : 'never';
    return `${label}: occupied ${occupied} | ${avg(s.occW)} W occupied, ${avg(s.emptyW)} W empty, ${avg(s.occT)}°C`;
  });

  return { text: lines.join('\n'), daysOfData: days.size };
}

function peakHours(events, parse) {
  const counts = new Map();
  for (const e of events) {
    const t = parse(e.timestamp);
    if (t) counts.set(t.hour, (counts.get(t.hour) ?? 0) + 1);
  }
  const top = [...counts]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([h]) => h)
    .sort((a, b) => a - b);
  return top.length ? ` (mostly ${top.map(h => `${pad(h)}:00`).join(', ')})` : '';
}

function describeEngine(result, parse) {
  const a = result?.analysis;
  if (!a) return null;

  const sum   = (events, key) => events.reduce((s, e) => s + parseFloat(e[key] || 0), 0);
  const lines = [];
  const add   = (label, events, extra = '') => {
    if (events?.length) lines.push(`${label}: ${events.length}${peakHours(events, parse)}${extra}`);
  };

  const l1 = a.lighting?.l1Events ?? [];
  const p2 = a.power?.p2Events ?? [];

  if (a.lighting) lines.push(`Idle baseline: ${a.lighting.idleBaseline.toFixed(0)} W`);
  add('Load on, room empty', l1, l1.length ? `, ₹${sum(l1, 'waste').toFixed(0)} wasted` : '');
  add('Lights on in daylight', a.lighting?.l2Events);
  add('HVAC on, room empty', a.hvac?.t1Events);
  add('Ventilation chances', a.hvac?.t2Events);
  add('Phantom load', p2, p2.length ? `, ₹${sum(p2, 'intervalCost').toFixed(0)} wasted` : '');
  if (a.trends?.trend1) lines.push(`Week-on-week energy: ${a.trends.trend1.changePct}%`);

  const titles = (result.optimizations ?? []).map(o => `${o.group}: ${o.title}`);
  if (titles.length) lines.push(`Flagged: ${titles.join('; ')}`);

  return lines.length ? lines.join('\n') : 'No waste events found';
}

function overview(readings) {
  const power = readings.map(powerOf);
  const peak  = power.length ? Math.max(...power) : 0;
  return `Power avg ${avg(power)} W, peak ${peak.toFixed(0)} W | Temp ${mean(readings.map(tempOf)).toFixed(1)}°C | Humidity ${avg(readings.map(humidityOf))}%`;
}

function recentRows(readings, parse) {
  const rows = [...readings]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(-RECENT_ROWS)
    .map(r => {
      const t = parse(r.timestamp);
      if (!t) return null;
      return [
        `${t.wd} ${pad(t.hour)}:${pad(t.minute)}`,
        powerOf(r).toFixed(0),
        tempOf(r).toFixed(1),
        humidityOf(r).toFixed(0),
        luxOf(r).toFixed(0),
        isOccupied(r) ? 1 : 0,
      ].join(',');
    })
    .filter(Boolean);
  return ['local_time,power_w,temp_c,humidity_pct,lux,occ', ...rows].join('\n');
}

function describeRule(r) {
  const days = r.days.map(d => DAY_LABEL[d]).join(',');
  return `- ${r.target.toUpperCase()} ${r.action.toUpperCase()} ${days} ${r.time}`;
}

export async function generateAISchedule({ readings, timeZone, existingRules, profile, engineResult }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const { text, daysOfData } = summariseUsage(readings, timeZone);
  if (daysOfData < MIN_DAYS) {
    throw new Error(`Not enough data yet. Atmos needs at least ${MIN_DAYS} days of readings to suggest a schedule.`);
  }

  const parse  = localParser(timeZone);
  const engine = describeEngine(engineResult, parse);

  const user = [
    `${timeZone} | ${daysOfData} days of data | Tariff ₹${profile?.tariff_rate ?? 10}/kWh | Plan ${profile?.plan ?? 'spark'}`,
    `## Overview\n${overview(readings)}`,
    `## Weekday pattern (local, hours start-end)\n${text}`,
    engine && `## Waste findings (30 days)\n${engine}`,
    `## Latest readings\n${recentRows(readings, parse)}`,
    existingRules.length
      ? `## User's rules (do not repeat or conflict)\n${existingRules.map(describeRule).join('\n')}`
      : "## User's rules\nNone",
  ].filter(Boolean).join('\n\n');

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
