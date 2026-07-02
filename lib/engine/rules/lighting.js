import { THRESHOLDS } from '../constants.js';
import { costINR, makeOpt } from '../utils.js';

export function checkL1(readings, idleBaseline, tariff, consecutiveEmpty = 3) {
  const events = [];

  for (let i = consecutiveEmpty - 1; i < readings.length; i++) {
    const window = readings.slice(
      i - (consecutiveEmpty - 1),
      i + 1
    );

    const allEmpty = window.every(
      r => r.occupancy === 'false' || r.occupancy === false
    );

    const power = parseFloat(
      readings[i].power_w ?? readings[i].power ?? 0
    );

    if (allEmpty && power > idleBaseline + THRESHOLDS.power.idleOffset) {
      const vacantMs    = new Date(readings[i].timestamp) - new Date(window[0].timestamp);
      const vacantMins  = Math.round(vacantMs / 60000);
      const vacantHours = vacantMs / 3600000;
      const wasteW      = power - idleBaseline;
      const waste       = costINR(wasteW, vacantHours, tariff);

      events.push({
        timestamp: readings[i].timestamp,
        vacantMins,
        power: power.toFixed(0),
        waste,
        idleBaseline: idleBaseline.toFixed(0)
      });
    }
  }

  return events;
}

export function checkL2(readings, idleBaseline, tariff) {
  const events = [];

  for (const r of readings) {
    const lux      = parseFloat(r.light_lux ?? r.light ?? 0);
    const power    = parseFloat(r.power_w ?? r.power ?? 0);
    const occupied = r.occupancy === 'true' || r.occupancy === true;

    if (lux > THRESHOLDS.lux.daylight && occupied && power > idleBaseline) {
      const wasteW = power - idleBaseline;
      const saving = costINR(wasteW, 0.5, tariff);

      events.push({
        timestamp: r.timestamp,
        lux: lux.toFixed(0),
        power: power.toFixed(0),
        saving
      });
    }
  }

  return events;
}

export function buildLightingOptimizations(l1Events, l2Events, idleBaseline) {
  const opts = [];

  if (l1Events.length) {
    const e = l1Events.at(-1);

    opts.push(makeOpt({
      group: 'Lighting',
      severity: 'warning',
      title: 'Lights on in empty room',
      message: `The room has been empty for ${e.vacantMins} minutes whilst drawing ${e.power} W, which is well above the idle baseline of ${e.idleBaseline} W. Lights or non-essential equipment appear to be running. Estimated waste: ₹${e.waste} for this period.`,
      saving: { inr: e.waste },
      timestamp: e.timestamp,
    }));
  }

  if (l2Events.length) {
    const e = l2Events.at(-1);

    opts.push(makeOpt({
      group: 'Lighting',
      severity: 'info',
      title: 'Daylight harvesting opportunity',
      message: `Natural light is at ${e.lux} lux, which is above the 400 lux comfortable working threshold. Artificial lights appear to still be on at ${e.power} W. Switching them off could save approximately ₹${e.saving} per half-hour period.`,
      saving: { inr: e.saving },
      timestamp: e.timestamp,
    }));
  }

  return opts;
}