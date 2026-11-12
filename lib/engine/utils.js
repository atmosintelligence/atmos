import { CO2_KG_PER_KWH, TREE_CO2_KG_PER_YEAR, MAX_GAP_HOURS, FALLBACK_INTERVAL_HOURS, MS_PER_HOUR, MS_PER_DAY, DEFAULT_TIME_ZONE } from './constants.js';

export { MS_PER_HOUR, MS_PER_DAY } from './constants.js';

// Reading accessors
// Readings can use short names (temperature) or long names (temp_c). The unit only
// reports temperature, humidity, light and occupancy. Power, energy and voltage are
// not measured, so there are no accessors for them.
//
// tempOf / humidityOf / luxOf return a number, or 0 when the value is missing (safe for
// display). The *OrNull versions return null so rules can skip a missing sensor instead
// of reading it as "0 °C".

function parse(...values) {
  for (const v of values) {
    if (v === null || v === undefined || v === '') continue;
    const n = typeof v === 'number' ? v : parseFloat(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export const tempOrNull     = r => parse(r.temp_c, r.temperature);
export const humidityOrNull = r => parse(r.humidity_pct, r.humidity);
export const luxOrNull      = r => parse(r.light_lux, r.light);

export const tempOf     = r => tempOrNull(r)     ?? 0;
export const humidityOf = r => humidityOrNull(r) ?? 0;
export const luxOf      = r => luxOrNull(r)      ?? 0;

// Occupancy
// Sensors send true/false, 'true'/'false', 1/0 or '1'/'0'. Returns true, false, or
// null when unknown. Unknown is never treated as empty or occupied.
export function parseOccupancy(value) {
  if (value === true  || value === 1) return true;
  if (value === false || value === 0) return false;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (v === 'true'  || v === '1' || v === 'occupied') return true;
    if (v === 'false' || v === '0' || v === 'empty' || v === 'vacant') return false;
    const n = parseFloat(v);
    if (Number.isFinite(n)) return n > 0;
    return null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return value > 0;
  return null;
}

export const isEmpty    = r => parseOccupancy(r.occupancy) === false;
export const isOccupied = r => parseOccupancy(r.occupancy) === true;

// Time

export const timeOf = r => new Date(r.timestamp).getTime();

const formatters = new Map();
function formatter(timeZone) {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-GB', {
      timeZone, hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', weekday: 'short',
    });
    formatters.set(timeZone, f);
  }
  return f;
}

const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

// Local hour (0-23), weekday (0 = Sunday) and calendar day key (YYYY-MM-DD) in a zone.
export function localParts(ms, timeZone = DEFAULT_TIME_ZONE) {
  const p = {};
  for (const part of formatter(timeZone).formatToParts(new Date(ms))) p[part.type] = part.value;
  return {
    hour:    Number(p.hour) % 24,
    weekday: WEEKDAYS[p.weekday],
    day:     `${p.year}-${p.month}-${p.day}`,
  };
}

export const hourOf   = (r, tz) => localParts(timeOf(r), tz).hour;
export const dayKeyOf = (r, tz) => localParts(timeOf(r), tz).day;

export function dayLabel(ms, timeZone = DEFAULT_TIME_ZONE) {
  return new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone });
}

// Number of different calendar days the readings fall on.
export function distinctDays(readings, tz = DEFAULT_TIME_ZONE) {
  return new Set(readings.map(r => dayKeyOf(r, tz))).size;
}

// Readings from `fromDay` (inclusive) up to `toDay` (exclusive) days ago.
// fromDay 0 also keeps readings stamped slightly in the future (clock drift).
export function inDays(readings, fromDay, toDay, now = Date.now()) {
  return readings.filter(r => {
    const age = (now - timeOf(r)) / MS_PER_DAY;
    return (fromDay <= 0 || age >= fromDay) && age < toDay;
  });
}

// Empty-room runs

// For each reading, the index where its current empty run began, or -1 when the room
// is not known to be empty. A run breaks on an occupied or unknown reading, or on a
// gap longer than MAX_GAP_HOURS (device was offline, so we cannot say it stayed empty).
export function emptyRunStarts(readings) {
  const starts = new Array(readings.length).fill(-1);
  let start = -1;

  for (let i = 0; i < readings.length; i++) {
    if (!isEmpty(readings[i])) { start = -1; continue; }

    const gapHours = i > 0 ? (timeOf(readings[i]) - timeOf(readings[i - 1])) / MS_PER_HOUR : 0;
    if (start === -1 || gapHours > MAX_GAP_HOURS) start = i;
    starts[i] = start;
  }

  return starts;
}

// True when the last `count` readings ending at index `i` are all empty-room, with no
// offline gap between them.
export function emptyStreak(readings, i, count) {
  if (i < count - 1) return false;
  const starts = emptyRunStarts(readings.slice(i - count + 1, i + 1));
  return starts[count - 1] === 0;
}

// Maths

export function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function stdDev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

export function zScore(value, m, sd) {
  return sd === 0 ? 0 : (value - m) / sd;
}

// p between 0 and 100, linear interpolation.
export function percentile(arr, p) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const pos = (p / 100) * (s.length - 1);
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}

export function linearRegression(points) {
  const n = points.length;
  if (n < 2) return { slope: 0, r2: 0 };
  const sumX  = points.reduce((s, p) => s + p.x, 0);
  const sumY  = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x ** 2, 0);
  const denom = n * sumX2 - sumX ** 2;
  if (denom === 0) return { slope: 0, r2: 0 };
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const yMean = sumY / n;
  const ssTot = points.reduce((s, p) => s + (p.y - yMean) ** 2, 0);
  const ssRes = points.reduce((s, p) => s + (p.y - (slope * p.x + intercept)) ** 2, 0);
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  return { slope, r2 };
}

// Energy and money

// Hours each reading represents: the time until the next reading.
// The last reading uses the typical gap. `sorted` must be oldest first.
export function intervalHours(sorted) {
  const gaps = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const hours = (timeOf(sorted[i + 1]) - timeOf(sorted[i])) / MS_PER_HOUR;
    gaps.push(Math.min(Math.max(Number.isFinite(hours) ? hours : 0, 0), MAX_GAP_HOURS));
  }

  let typical = FALLBACK_INTERVAL_HOURS;
  if (gaps.length) {
    const ordered = [...gaps].sort((a, b) => a - b);
    typical = ordered[Math.floor(ordered.length / 2)] || FALLBACK_INTERVAL_HOURS;
  }

  return sorted.map((_, i) => (i < gaps.length ? gaps[i] : typical));
}

export function costINR(watts, hours, tariff) {
  return ((watts / 1000) * hours * tariff).toFixed(2);
}

export function co2Saved(baselineKwh, actualKwh) {
  return Math.max(0, (baselineKwh - actualKwh) * CO2_KG_PER_KWH);
}

export function treesEquivalent(co2Kg) {
  return Math.round(co2Kg / TREE_CO2_KG_PER_YEAR);
}

// Output

export function makeOpt({ group, severity, title, message, saving = null, timestamp = null }) {
  return { group, severity, title, message, saving, timestamp };
}

// kWh used by a load of `watts` running for `hours`.
export const loadKwh = (watts, hours) => (watts * hours) / 1000;

// Shared by L1 and T1: walks every empty-room run (at least `consecutive` readings long,
// no offline gap) and calls `match(reading)`. Matching readings become events with the
// estimated waste of a `watts` load for this reading's interval (`waste`, in ₹) and for
// the whole run so far (`windowWaste`).
export function emptyRunEvents(readings, tariff, consecutive, watts, match) {
  const events = [];
  const hours  = intervalHours(readings);
  const starts = emptyRunStarts(readings);
  let runStart = -1, wasteKwh = 0;

  for (let i = 0; i < readings.length; i++) {
    const start = starts[i];
    if (start === -1) { runStart = -1; continue; }
    if (start !== runStart) { runStart = start; wasteKwh = 0; }

    if (!match(readings[i])) continue;
    wasteKwh += loadKwh(watts, hours[i]);
    if (i - start + 1 < consecutive) continue;

    events.push({
      timestamp:   readings[i].timestamp,
      vacantMins:  Math.round((timeOf(readings[i]) - timeOf(readings[start])) / 60000),
      kwh:         loadKwh(watts, hours[i]),
      waste:       costINR(watts, hours[i], tariff),
      windowKwh:   wasteKwh.toFixed(3),
      windowWaste: (wasteKwh * tariff).toFixed(2),
      temp:        tempOrNull(readings[i]),
      lux:         luxOrNull(readings[i]),
    });
  }

  return events;
}
