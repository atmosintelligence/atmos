import { THRESHOLDS } from '../constants.js';
import { mean, linearRegression, makeOpt, toKwh, powerOf, isOccupied, inDays, distinctDays } from '../utils.js';

const MIN_DAYS_PER_WEEK = 5;

// Trend 1: this week's energy vs last week's. Needs readings on at least
// 5 days in each week, otherwise the comparison would be unfair.
export function checkTrend1(sorted, weekOverWeekPct = THRESHOLDS.power.weekOverWeekPct) {
  const thisWeek = inDays(sorted, 0, 7);
  const lastWeek = inDays(sorted, 7, 14);
  if (distinctDays(thisWeek) < MIN_DAYS_PER_WEEK || distinctDays(lastWeek) < MIN_DAYS_PER_WEEK) return null;

  const thisKwh = toKwh(thisWeek);
  const lastKwh = toKwh(lastWeek);
  if (lastKwh === 0) return null;

  const changePct = ((thisKwh - lastKwh) / lastKwh) * 100;

  return {
    changePct: changePct.toFixed(1),
    thisKwh:   thisKwh.toFixed(2),
    lastKwh:   lastKwh.toFixed(2),
    delta:     Math.abs(thisKwh - lastKwh).toFixed(2),
    rising:    changePct > weekOverWeekPct,
  };
}

// Trend 2: steady daily rise in power while the room is occupied (possible wear).
export function checkTrend2(sorted) {
  const points = Array.from({ length: 14 }, (_, i) =>
    mean(inDays(sorted, i, i + 1).filter(isOccupied).map(powerOf))
  )
    .reverse()
    .map((y, x) => ({ x, y }))
    .filter(p => p.y > 0);

  if (points.length < 5) return null;

  const { slope, r2 } = linearRegression(points);
  if (slope <= 0 || r2 <= 0.6) return null;

  return { slope: slope.toFixed(1), r2: r2.toFixed(2) };
}

export function buildTrendOptimizations(trend1, trend2, timestamp = null) {
  const opts = [];

  if (trend1?.rising) {
    opts.push(makeOpt({
      group: 'Trends', severity: 'info',
      title: 'Rising week-over-week consumption',
      message: `Energy consumption this week (${trend1.thisKwh} kWh) is ${trend1.changePct}% higher than last week (${trend1.lastKwh} kWh), meaning an increase of ${trend1.delta} kWh. No change in occupancy patterns has been detected. This may indicate a new high-draw appliance or gradual equipment inefficiency.`,
      timestamp
    }));
  }

  if (trend2) {
    opts.push(makeOpt({
      group: 'Trends', severity: 'warning',
      title: 'Consistent degrading power increase',
      message: `Power usage during occupied hours has risen steadily over the past 14 days at a rate of ${trend2.slope} W per day (R² = ${trend2.r2}, forming a strong, consistent trend). This pattern is characteristic of equipment degradation. Scheduling a maintenance check is recommended!`,
      timestamp
    }));
  }

  return opts;
}
