import { THRESHOLDS } from '../constants.js';
import { costINR, makeOpt, luxOrNull, isOccupied, emptyRunEvents, intervalHours, hourOf, loadKwh } from '../utils.js';

const { nightFrom, nightTo, dayFrom, dayTo } = THRESHOLDS.hours;

export const isNight = hour => hour >= nightFrom || hour < nightTo;
export const isDay   = hour => hour >= dayFrom && hour < dayTo;

// L1: the room has been empty, it is night, and the light sensor still sees light, so
// the lights are probably on. Waste is the assumed lighting load for the time it lasted.
export function checkL1(readings, tariff, consecutiveEmpty, loads, timeZone) {
  return emptyRunEvents(readings, tariff, consecutiveEmpty, loads.lighting, r => {
    const lux = luxOrNull(r);
    return lux !== null && lux >= THRESHOLDS.lux.lightsOn && isNight(hourOf(r, timeZone));
  });
}

// L2: bright daylight in an occupied room. Natural light alone is enough to work by, so
// any lights that are on can be switched off. We cannot see the lights, only the lux.
export function checkL2(readings, tariff, loads, timeZone) {
  const events = [];
  const hours  = intervalHours(readings);

  for (const [i, r] of readings.entries()) {
    const lux = luxOrNull(r);
    if (lux === null || lux <= THRESHOLDS.lux.daylight || !isOccupied(r)) continue;
    if (!isDay(hourOf(r, timeZone))) continue;

    events.push({
      timestamp:     r.timestamp,
      lux:           lux.toFixed(0),
      kwh:           loadKwh(loads.lighting, hours[i]),
      saving:        costINR(loads.lighting, hours[i], tariff),
      savingPerHour: costINR(loads.lighting, 1, tariff),
    });
  }

  return events;
}

export function buildLightingOptimizations(l1Events, l2Events) {
  const opts = [];

  if (l1Events.length) {
    const e = l1Events.at(-1);
    opts.push(makeOpt({
      group: 'Lighting',
      severity: 'warning',
      title: 'Lights on in empty room',
      message: `The room has been empty for ${e.vacantMins} minutes, but the light sensor still reads ${Math.round(e.lux)} lux after dark. The lights look like they were left on. Switching them off could save about ₹${e.windowWaste} for this stretch.`,
      saving: { inr: e.windowWaste, kwh: e.windowKwh },
      timestamp: e.timestamp,
    }));
  }

  if (l2Events.length) {
    const e = l2Events.at(-1);
    opts.push(makeOpt({
      group: 'Lighting',
      severity: 'info',
      title: 'Daylight harvesting opportunity',
      message: `Natural light is at ${e.lux} lux, above the ${THRESHOLDS.lux.daylight} lux that is comfortable to work in. If the lights are on, you can switch them off and save about ₹${e.savingPerHour} an hour.`,
      saving: { inr: e.savingPerHour },
      timestamp: e.timestamp,
    }));
  }

  return opts;
}
