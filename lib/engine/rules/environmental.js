import { BEE_BENCHMARK_KWH_M2, CO2_KG_PER_KWH, MS_PER_DAY } from '../constants.js';
import { co2Saved, treesEquivalent, toKwh, inDays, intervalHours } from '../utils.js';

const fmtDay = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

// Days covered by the readings, including the last reading's own interval.
function coveredDays(readings) {
  if (!readings.length) return 0;
  const hours = intervalHours(readings);
  const span  = new Date(readings.at(-1).timestamp) - new Date(readings[0].timestamp);
  return span / MS_PER_DAY + hours.at(-1) / 24;
}

// Savings are measured against the BEE benchmark (kWh per m² per year), pro-rated
// to the days the readings actually cover. Periods with no readings report zero.
export function computeEnvironmental(sorted, tariff, roomAreaM2 = 20) {
  const now          = Date.now();
  const dailyBenchmarkKwh = (BEE_BENCHMARK_KWH_M2 * roomAreaM2) / 365;

  const weeklyData = Array.from({ length: 4 }, (_, i) => {
    const readings = inDays(sorted, i * 7, (i + 1) * 7, now);
    const label    = `${fmtDay(new Date(now - (i + 1) * 7 * MS_PER_DAY))} – ${fmtDay(new Date(now - i * 7 * MS_PER_DAY))}`;

    if (!readings.length) {
      return { week: label, kwh: '0.000', baseline: '0.000', saved: '0.000', co2: '0.000', money: '0.00', hasData: false };
    }

    const kwh      = toKwh(readings);
    const baseline = dailyBenchmarkKwh * Math.min(coveredDays(readings), 7);
    const saved    = Math.max(0, baseline - kwh);

    return {
      week:     label,
      kwh:      kwh.toFixed(3),
      baseline: baseline.toFixed(3),
      saved:    saved.toFixed(3),
      co2:      (saved * CO2_KG_PER_KWH).toFixed(3),
      money:    (saved * tariff).toFixed(2),
      hasData:  true,
    };
  }).reverse();

  const periodReadings = inDays(sorted, 0, 30, now);
  const periodDays     = Math.min(coveredDays(periodReadings), 30);
  const weeklyBaselineKwh = (dailyBenchmarkKwh * 7).toFixed(3);

  if (!periodReadings.length) {
    return {
      actualKwh: '0.00', baselineKwh: '0.00', savedKwh: '0.00', co2KgSaved: '0.00',
      treesEquiv: '0', moneySavedINR: '0.00', kwhSaved: '0.00',
      periodDays: '0', weeklyBaselineKwh, weeklyData,
    };
  }

  const actualKwh   = toKwh(periodReadings);
  const baselineKwh = dailyBenchmarkKwh * periodDays;
  const savedKwh    = Math.max(0, baselineKwh - actualKwh);
  const co2Kg       = co2Saved(baselineKwh, actualKwh);

  return {
    actualKwh:     actualKwh.toFixed(2),
    baselineKwh:   baselineKwh.toFixed(2),
    savedKwh:      savedKwh.toFixed(2),
    co2KgSaved:    co2Kg.toFixed(2),
    treesEquiv:    String(treesEquivalent(co2Kg)),
    moneySavedINR: (savedKwh * tariff).toFixed(2),
    kwhSaved:      savedKwh.toFixed(2),
    periodDays:    String(Number(periodDays.toFixed(1))),
    weeklyBaselineKwh,
    weeklyData,
  };
}
