import { THRESHOLDS, DEFAULT_TIME_ZONE } from '../constants.js';
import { makeOpt, parseOccupancy, inDays, distinctDays, timeOf, hourOf } from '../utils.js';

const T = THRESHOLDS.trends;

// Share of readings (0-100) with the room occupied, ignoring unknown occupancy.
function occupiedShare(readings) {
  const known = readings.map(r => parseOccupancy(r.occupancy)).filter(o => o !== null);
  return known.length ? (known.filter(Boolean).length / known.length) * 100 : null;
}

const sumKwh = (events, from, to, now) =>
  events.filter(e => {
    const age = (now - timeOf(e)) / 86_400_000;
    return (from <= 0 || age >= from) && age < to;
  }).reduce((s, e) => s + e.kwh, 0);

// Trend 1: avoidable energy (waste the rules found) this week against last week. Needs
// readings on at least 5 days of each week. It also says whether the room was used
// differently, because more use explains more waste.
// `wasteEvents` are the L1, T1 and S1 events, each with a `kwh` estimate.
export function checkTrend1(sorted, wasteEvents, now = Date.now(), timeZone = DEFAULT_TIME_ZONE) {
  const thisWeek = inDays(sorted, 0, 7, now);
  const lastWeek = inDays(sorted, 7, 14, now);
  if (distinctDays(thisWeek, timeZone) < T.minDaysPerWeek) return null;
  if (distinctDays(lastWeek, timeZone) < T.minDaysPerWeek) return null;

  const thisKwh  = sumKwh(wasteEvents, 0, 7, now);
  const lastKwh  = sumKwh(wasteEvents, 7, 14, now);
  if (thisKwh < THRESHOLDS.power.trendMinKwh && lastKwh < THRESHOLDS.power.trendMinKwh) return null;

  const changePct = lastKwh > 0 ? ((thisKwh - lastKwh) / lastKwh) * 100 : 100;
  const occThis = occupiedShare(thisWeek);
  const occLast = occupiedShare(lastWeek);
  const shift   = occThis !== null && occLast !== null ? occThis - occLast : null;
  const minKwh  = THRESHOLDS.power.trendMinKwh;
  const pct     = THRESHOLDS.power.weekOverWeekPct;

  return {
    changePct: changePct.toFixed(1),
    thisKwh:   thisKwh.toFixed(2),
    lastKwh:   lastKwh.toFixed(2),
    delta:     Math.abs(thisKwh - lastKwh).toFixed(2),
    rising:    changePct > pct && thisKwh - lastKwh >= minKwh,
    falling:   changePct < -pct && lastKwh - thisKwh >= minKwh,
    occupancyShift: shift === null ? null : Number(shift.toFixed(1)),
    occupancyChanged: shift !== null && Math.abs(shift) >= T.occupancyShiftPoints,
  };
}

// Trend 2: waste tends to happen at the same hour. If one hour of the day holds a big
// share of the waste, a schedule can switch things off at that time.
export function checkTrend2(wasteEvents, timeZone = DEFAULT_TIME_ZONE) {
  if (wasteEvents.length < T.peakMinEvents) return null;

  const byHour = new Map();
  let total = 0;
  for (const e of wasteEvents) {
    const hour = hourOf(e, timeZone);
    byHour.set(hour, (byHour.get(hour) ?? 0) + e.kwh);
    total += e.kwh;
  }
  if (total <= 0) return null;

  const [hour, kwh] = [...byHour.entries()].sort((a, b) => b[1] - a[1])[0];
  const share = kwh / total;
  if (share < T.peakShareMin) return null;

  return { hour, share: Math.round(share * 100), kwh: kwh.toFixed(2) };
}

const hourLabel = h => `${h % 12 || 12}${h >= 12 ? ' PM' : ' AM'}`;

export function buildTrendOptimizations(trend1, trend2, timestamp = null) {
  const opts = [];

  if (trend1?.rising) {
    const why = trend1.occupancyChanged
      ? `The room was occupied ${trend1.occupancyShift > 0 ? 'more' : 'less'} this week, which may explain part of it.`
      : 'Room use looks similar to last week, so something is being left on more often.';
    opts.push(makeOpt({
      group: 'Trends', severity: 'info',
      title: 'More energy wasted this week',
      message: `About ${trend1.thisKwh} kWh of avoidable energy was flagged this week, up from ${trend1.lastKwh} kWh last week. ${why}`,
      timestamp,
    }));
  }

  if (trend1?.falling) {
    opts.push(makeOpt({
      group: 'Trends', severity: 'info',
      title: 'Less energy wasted this week',
      message: `Avoidable energy fell from ${trend1.lastKwh} kWh last week to ${trend1.thisKwh} kWh this week. Keep the same habits going.`,
      timestamp,
    }));
  }

  if (trend2) {
    const next = (trend2.hour + 1) % 24;
    opts.push(makeOpt({
      group: 'Trends', severity: 'info',
      title: `Waste peaks around ${hourLabel(trend2.hour)}`,
      message: `${trend2.share}% of the waste we found happens between ${hourLabel(trend2.hour)} and ${hourLabel(next)}. An automation rule that switches things off at that time would catch most of it.`,
      timestamp,
    }));
  }

  return opts;
}
