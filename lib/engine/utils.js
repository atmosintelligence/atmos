import { CO2_KG_PER_KWH, TREE_CO2_KG_PER_YEAR } from './constants.js';

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

export function toKwh(readings) {
  return mean(readings.map(r => parseFloat(r.power_w || 0))) * (readings.length * 0.5) / 1000;
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

export function makeOpt({ group, severity, title, message, saving = null, timestamp = null }) {
  return { group, severity, title, message, saving, timestamp: timestamp ?? new Date().toISOString() };
}