import { THRESHOLDS } from '../constants.js';
import { makeOpt, emptyRunStarts, intervalHours, timeOf, loadKwh, hourOf, MS_PER_HOUR } from '../utils.js';
import { isDay } from './lighting.js';

// S1: the room has been empty for hours during the day (a holiday, a day off). Chargers, monitors, routers and other devices
// left plugged in keep drawing standby power, so unplugging them (or switching at the
// wall) saves it. The power itself is an assumed figure, not a measurement.
// Nights are left out: every room is empty overnight, so flagging them would be noise.
export function checkS1(readings, tariff, loads, phantomEmptyHours = THRESHOLDS.power.phantomEmptyHours, timeZone) {
  const events = [];
  const hours  = intervalHours(readings);
  const starts = emptyRunStarts(readings);
  let runStart = -1, wasteKwh = 0;

  for (let i = 0; i < readings.length; i++) {
    const start = starts[i];
    if (start === -1) { runStart = -1; continue; }
    if (start !== runStart) { runStart = start; wasteKwh = 0; }

    const kwh = loadKwh(loads.standby, hours[i]);
    wasteKwh += kwh;
    const emptyHours = (timeOf(readings[i]) - timeOf(readings[start])) / MS_PER_HOUR;
    if (emptyHours < phantomEmptyHours || !isDay(hourOf(readings[i], timeZone))) continue;

    events.push({
      timestamp:    readings[i].timestamp,
      emptyHours:   emptyHours.toFixed(1),
      kwh,
      windowKwh:    wasteKwh.toFixed(3),
      cost:         (wasteKwh * tariff).toFixed(2),
      intervalCost: ((kwh) * tariff).toFixed(2),
    });
  }

  return events;
}

export function buildStandbyOptimizations(s1Events) {
  if (!s1Events.length) return [];
  const e = s1Events.at(-1);

  return [makeOpt({
    group: 'Standby',
    severity: 'warning',
    title: 'Idle devices in empty room',
    message: `The room has been empty for ${e.emptyHours} hours. Chargers, monitors and other devices left plugged in keep using standby power. Unplug them or switch off at the wall. That is worth about ₹${e.cost} so far.`,
    saving: { inr: e.cost, kwh: e.windowKwh },
    timestamp: e.timestamp,
  })];
}
