import { BEE_BENCHMARK_KWH_M2, MS_PER_DAY, DEFAULT_TIME_ZONE } from '../constants.js';
import { intervalHours, inDays, dayLabel, timeOf } from '../utils.js';

// Days covered by the readings, including the last reading's own interval.
function coveredDays(readings) {
  if (!readings.length) return 0;
  const hours = intervalHours(readings);
  const span  = timeOf(readings.at(-1)) - timeOf(readings[0]);
  return span / MS_PER_DAY + hours.at(-1) / 24;
}

// Avoidable energy can never be more than most of what the room uses, so it is capped.
const MAX_AVOIDABLE_SHARE = 0.6;

const sumKwh = (events, from, to, now) =>
  events.filter(e => {
    const age = (now - timeOf(e)) / MS_PER_DAY;
    return (from <= 0 || age >= from) && age < to;
  }).reduce((s, e) => s + e.kwh, 0);

// The unit cannot measure energy, so consumption here is an estimate: the owner's monthly
// kWh (or the BEE benchmark for the room, when they have not given one) spread over the
// days the readings cover. It is compared with the BEE benchmark. Avoidable energy is what
// the rules found. What the user has actually saved comes from the alerts they
// acknowledge, so it is worked out on the dashboard, not here.
export function computeEnvironmental(sorted, wasteEvents, { loads, roomAreaM2 = 20, now = Date.now(), timeZone = DEFAULT_TIME_ZONE }) {
  const dailyBenchmarkKwh = (BEE_BENCHMARK_KWH_M2 * roomAreaM2) / 365;
  const dailyUseKwh       = loads.monthlyKwh / 30;

  const weeklyData = Array.from({ length: 4 }, (_, i) => {
    const readings = inDays(sorted, i * 7, (i + 1) * 7, now);
    const label    = `${dayLabel(now - (i + 1) * 7 * MS_PER_DAY, timeZone)} – ${dayLabel(now - i * 7 * MS_PER_DAY, timeZone)}`;
    if (!readings.length) return { week: label, kwh: '0.00', baseline: '0.00', avoidable: '0.00', hasData: false };

    const days = Math.min(coveredDays(readings), 7);
    return {
      week:      label,
      kwh:       (dailyUseKwh * days).toFixed(2),
      baseline:  (dailyBenchmarkKwh * days).toFixed(2),
      avoidable: Math.min(sumKwh(wasteEvents, i * 7, (i + 1) * 7, now), dailyUseKwh * days * MAX_AVOIDABLE_SHARE).toFixed(2),
      hasData:   true,
    };
  }).reverse();

  const periodReadings = inDays(sorted, 0, 30, now);
  const periodDays     = periodReadings.length ? Math.min(coveredDays(periodReadings), 30) : 0;
  const avoidableKwh   = Math.min(sumKwh(wasteEvents, 0, 30, now), dailyUseKwh * periodDays * MAX_AVOIDABLE_SHARE);

  return {
    monthlyKwh:      loads.monthlyKwh,
    monthlyKwhKnown: loads.monthlyKwhKnown,
    benchmarkMonthlyKwh: Number(((dailyBenchmarkKwh * 365) / 12).toFixed(0)),
    periodDays:      String(Number(periodDays.toFixed(1))),
    estimatedKwh:    (dailyUseKwh * periodDays).toFixed(2),
    benchmarkKwh:    (dailyBenchmarkKwh * periodDays).toFixed(2),
    avoidableKwh:    avoidableKwh.toFixed(2),
    weeklyData,
  };
}
