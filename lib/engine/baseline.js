import { THRESHOLDS } from './constants.js';
import { mean, powerOf, luxOf, isEmpty } from './utils.js';

// Idle power: average draw on empty, dark readings between midnight and 5 am.
// Returns { watts, measured }. measured is false when there were no such readings.
export function computeIdleBaseline(readings) {
  const { from, to } = THRESHOLDS.baselineHours;

  const night = readings.filter(r => {
    const hour = new Date(r.timestamp).getHours();
    return hour >= from && hour < to && isEmpty(r) && luxOf(r) < THRESHOLDS.lux.dark;
  });

  return night.length
    ? { watts: mean(night.map(powerOf)), measured: true }
    : { watts: THRESHOLDS.power.defaultBaseline, measured: false };
}
