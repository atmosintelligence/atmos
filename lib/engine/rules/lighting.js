import { THRESHOLDS } from '../constants.js';
import { costINR, makeOpt, powerOf, luxOf, isOccupied, emptyStreak, intervalHours, MS_PER_HOUR } from '../utils.js';

// L1: lights or equipment drawing power while the room has been empty.
// `waste` covers this reading's interval only, so events can be added up.
// `windowWaste` covers the whole empty window and is used in the message.
export function checkL1(readings, idleBaseline, tariff, consecutiveEmpty = 3) {
  const events = [];
  const hours  = intervalHours(readings);

  for (let i = consecutiveEmpty - 1; i < readings.length; i++) {
    if (!emptyStreak(readings, i, consecutiveEmpty)) continue;

    const power = powerOf(readings[i]);
    if (power <= idleBaseline + THRESHOLDS.power.idleOffset) continue;

    const vacantMs = new Date(readings[i].timestamp) - new Date(readings[i - consecutiveEmpty + 1].timestamp);

    events.push({
      timestamp:    readings[i].timestamp,
      vacantMins:   Math.round(vacantMs / 60000),
      power:        power.toFixed(0),
      waste:        costINR(power - idleBaseline, hours[i], tariff),
      windowWaste:  costINR(power - idleBaseline, vacantMs / MS_PER_HOUR, tariff),
      idleBaseline: idleBaseline.toFixed(0),
    });
  }

  return events;
}

// L2: bright daylight in an occupied room, yet power is above idle.
// `saving` covers this reading's interval; `savingPerHour` is for the message.
export function checkL2(readings, idleBaseline, tariff) {
  const events = [];
  const hours  = intervalHours(readings);

  for (const [i, r] of readings.entries()) {
    const lux   = luxOf(r);
    const power = powerOf(r);

    if (lux > THRESHOLDS.lux.daylight && isOccupied(r) && power > idleBaseline) {
      events.push({
        timestamp: r.timestamp,
        lux:       lux.toFixed(0),
        power:     power.toFixed(0),
        saving:    costINR(power - idleBaseline, hours[i], tariff),
        savingPerHour: costINR(power - idleBaseline, 1, tariff),
      });
    }
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
      message: `The room has been empty for ${e.vacantMins} minutes whilst drawing ${e.power} W, which is well above the idle baseline of ${e.idleBaseline} W. Lights or non-essential equipment appear to be running. Estimated waste: ₹${e.windowWaste} for this period.`,
      saving: { inr: e.windowWaste },
      timestamp: e.timestamp,
    }));
  }

  if (l2Events.length) {
    const e = l2Events.at(-1);
    opts.push(makeOpt({
      group: 'Lighting',
      severity: 'info',
      title: 'Daylight harvesting opportunity',
      message: `Natural light is at ${e.lux} lux, which is above the ${THRESHOLDS.lux.daylight} lux comfortable working threshold. Artificial lights appear to still be on at ${e.power} W. Switching them off could save approximately ₹${e.savingPerHour} per hour.`,
      saving: { inr: e.savingPerHour },
      timestamp: e.timestamp,
    }));
  }

  return opts;
}
