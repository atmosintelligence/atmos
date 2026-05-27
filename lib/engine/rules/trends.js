import { mean, linearRegression, makeOpt } from '../utils.js';

function toKwhFromArr(readings) {
  return mean(readings.map(r => parseFloat(r.power_w ?? r.power ?? 0))) * (readings.length * 0.5) / 1000;
}

export function checkTrend1(sorted, weekOverWeekPct = 8) {
  const now   = Date.now();
  const msDay = 86400000;

  const thisWeek = sorted.filter(r =>
    (now - new Date(r.timestamp)) / msDay < 7
  );

  const lastWeek = sorted.filter(r => {
    const a = (now - new Date(r.timestamp)) / msDay;
    return a >= 7 && a < 14;
  });

  if (!thisWeek.length || !lastWeek.length) {
    return null;
  }

  const thisKwh = toKwhFromArr(thisWeek);
  const lastKwh = toKwhFromArr(lastWeek);

  if (lastKwh === 0) {
    return null;
  }

  const changePct =
    ((thisKwh - lastKwh) / lastKwh) * 100;

  return {
    changePct: changePct.toFixed(1),
    thisKwh: thisKwh.toFixed(2),
    lastKwh: lastKwh.toFixed(2),
    delta: Math.abs(thisKwh - lastKwh).toFixed(2),
    rising: changePct > weekOverWeekPct
  };
}

export function checkTrend2(sorted) {
  const now = Date.now();
  const msDay = 86400000;
  const last14 = sorted.filter(r => (now - new Date(r.timestamp)) / msDay < 14);
  const byDay = Array.from({ length: 14 }, (_, i) => {
    const dayR = last14.filter(r => {
      const age = (now - new Date(r.timestamp)) / msDay;
      return age >= i && age < i + 1 && (r.occupancy === 'true' || r.occupancy === true);
    });
    return mean(dayR.map(r => parseFloat(r.power_w ?? r.power ?? 0)));
  }).reverse();
  const points = byDay.map((y, x) => ({ x, y })).filter(p => p.y > 0);
  if (points.length < 5) return null;
  const { slope, r2 } = linearRegression(points);
  if (slope <= 0 || r2 <= 0.6) return null;
  return { slope: slope.toFixed(1), r2: r2.toFixed(2) };
}

export function buildTrendOptimizations(trend1, trend2) {
  const opts = [];
  if (trend1?.rising) {
    opts.push(makeOpt({
      group: 'Trends', severity: 'info',
      title: 'Rising week-over-week consumption',
      message: `Energy consumption this week (${trend1.thisKwh} kWh) is ${trend1.changePct}% higher than last week (${trend1.lastKwh} kWh) — an increase of ${trend1.delta} kWh. No change in occupancy patterns has been detected. This may indicate a new high-draw appliance or gradual equipment inefficiency.`,
    }));
  }
  if (trend2) {
    opts.push(makeOpt({
      group: 'Trends', severity: 'warning',
      title: 'Consistent power increase — possible degradation',
      message: `Power usage during occupied hours has risen steadily over the past 14 days at a rate of ${trend2.slope} W per day (R² = ${trend2.r2} — a strong, consistent trend). This pattern is characteristic of equipment degradation. Scheduling a maintenance check is recommended.`,
    }));
  }
  return opts;
}