import { CO2_KG_PER_KWH, TREE_CO2_KG_PER_YEAR, MAX_GAP_HOURS, FALLBACK_INTERVAL_HOURS, MS_PER_HOUR, MS_PER_DAY } from './constants.js';

export { MS_PER_HOUR, MS_PER_DAY } from './constants.js';

// Reading accessors
// Readings can use short names (power) or long names (power_w). These return a
// number, or 0 when the value is missing.

function num(...values) {
  for (const v of values) {
    const n = parseFloat(v);
    if (!Number.isNaN(n)) return n;
  }
  return 0;
}

export const powerOf    = r => num(r.power_w, r.power);
export const tempOf     = r => num(r.temp_c, r.temperature);
export const humidityOf = r => num(r.humidity_pct, r.humidity);
export const luxOf      = r => num(r.light_lux, r.light);
export const voltageOf  = r => num(r.voltage_v, r.voltage);

export const isEmpty    = r => r.occupancy === false || r.occupancy === 'false';
export const isOccupied = r => r.occupancy === true  || r.occupancy === 'true';

// True when the last `count` readings ending at index `i` are all empty-room.
export function emptyStreak(readings, i, count) {
  if (i < count - 1) return false;
  for (let k = i - count + 1; k <= i; k++) {
    if (!isEmpty(readings[k])) return false;
  }
  return true;
}

// Time windows

// Readings from `fromDay` (inclusive) up to `toDay` (exclusive) days ago.
// fromDay 0 also keeps readings stamped slightly in the future (clock drift).
export function inDays(readings, fromDay, toDay, now = Date.now()) {
  return readings.filter(r => {
    const age = (now - new Date(r.timestamp)) / MS_PER_DAY;
    return (fromDay <= 0 || age >= fromDay) && age < toDay;
  });
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

export function linearRegression(points) {
  const n = points.length;
  if (n < 2) return { slope: 0, r2: 0 };
  const sumX  = points.reduce((s, p) => s + p.x, 0);
  const sumY  = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x ** 2, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
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
    const hours = (new Date(sorted[i + 1].timestamp) - new Date(sorted[i].timestamp)) / MS_PER_HOUR;
    gaps.push(Math.min(Math.max(hours, 0), MAX_GAP_HOURS));
  }

  let typical = FALLBACK_INTERVAL_HOURS;
  if (gaps.length) {
    const ordered = [...gaps].sort((a, b) => a - b);
    typical = ordered[Math.floor(ordered.length / 2)] || FALLBACK_INTERVAL_HOURS;
  }

  return sorted.map((_, i) => (i < gaps.length ? gaps[i] : typical));
}

// kWh used by readings (oldest first).
export function toKwh(sorted) {
  const hours = intervalHours(sorted);
  return sorted.reduce((sum, r, i) => sum + powerOf(r) * hours[i], 0) / 1000;
}

// Number of different calendar days the readings fall on.
export function distinctDays(readings) {
  return new Set(readings.map(r => new Date(r.timestamp).toDateString())).size;
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
