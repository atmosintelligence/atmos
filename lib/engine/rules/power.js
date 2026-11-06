import { THRESHOLDS } from '../constants.js';
import { mean, stdDev, zScore, costINR, makeOpt, powerOf, voltageOf, isEmpty, intervalHours, MS_PER_HOUR } from '../utils.js';

// P1: the latest reading is far above what is normal for this weekday and hour.
export function checkP1(readings, spikeZScore = THRESHOLDS.power.spikeZScore) {
  const latest = readings.at(-1);
  if (!latest) return [];

  const slot = r => {
    const d = new Date(r.timestamp);
    return `${d.getDay()}-${d.getHours()}`;
  };

  const key  = slot(latest);
  const hist = readings.filter(r => slot(r) === key).map(powerOf);
  if (hist.length < 3) return [];

  const avg = mean(hist);
  const z   = zScore(powerOf(latest), avg, stdDev(hist));
  if (z <= spikeZScore) return [];

  return [{
    timestamp: latest.timestamp,
    power:     powerOf(latest).toFixed(0),
    avg:       avg.toFixed(0),
    z:         z.toFixed(2),
  }];
}

// P2: room empty for hours, yet power stays above the standby floor.
// `cost` is the total since the room emptied; `intervalCost` is this reading only.
export function checkP2(readings, tariff, phantomEmptyHours = THRESHOLDS.power.phantomEmptyHours) {
  const events = [];
  const hours  = intervalHours(readings);
  let emptyStart = null;

  for (const [i, r] of readings.entries()) {
    if (!isEmpty(r)) {
      emptyStart = null;
      continue;
    }

    emptyStart ??= new Date(r.timestamp);

    const emptyHours = (new Date(r.timestamp) - emptyStart) / MS_PER_HOUR;
    const power      = powerOf(r);

    if (emptyHours >= phantomEmptyHours && power > THRESHOLDS.power.phantomFloor) {
      events.push({
        timestamp:  r.timestamp,
        emptyHours: emptyHours.toFixed(1),
        power:      power.toFixed(0),
        cost:       costINR(power, emptyHours, tariff),
        intervalCost: costINR(power, hours[i], tariff),
      });
    }
  }

  return events;
}

// P3: voltage outside the stable range.
export function checkP3(readings) {
  const { low, high } = THRESHOLDS.voltage;

  return readings
    .filter(r => voltageOf(r) < low || voltageOf(r) > high)
    .map(r => ({
      timestamp: r.timestamp,
      voltage:   voltageOf(r).toFixed(0),
      low:       voltageOf(r) < low,
    }));
}

export function buildPowerOptimizations(p1Events, p2Events, p3Events) {
  const opts = [];

  if (p1Events.length) {
    const e = p1Events[0];
    opts.push(makeOpt({
      group: 'Power',
      severity: 'critical',
      title: 'Unusual power spike detected',
      message: `Current power consumption is ${e.power} W, which is unusual for this time of day (typical average: ${e.avg} W). This may indicate an unexpected appliance has been switched on, or a fault in the circuit. Investigate immediately!`,
      timestamp: e.timestamp,
    }));
  }

  if (p2Events.length) {
    const e = p2Events.at(-1);
    opts.push(makeOpt({
      group: 'Power',
      severity: 'warning',
      title: 'Phantom load whilst room is empty',
      message: `The room has been empty for ${e.emptyHours} hours but is consuming ${e.power} W, which is above the ${THRESHOLDS.power.phantomFloor} W standby floor. Appliances appear to have been left on. Estimated cost since the room emptied: ₹${e.cost}.`,
      saving: { inr: e.cost },
      timestamp: e.timestamp,
    }));
  }

  if (p3Events.length) {
    const e = p3Events.at(-1);
    opts.push(makeOpt({
      group: 'Power',
      severity: 'warning',
      title: 'Voltage outside stable range',
      message: `Voltage detected at ${e.voltage} V, ${e.low ? 'below' : 'above'} the stable ${THRESHOLDS.voltage.low}–${THRESHOLDS.voltage.high} V range. This reduces appliance efficiency and shortens equipment lifespan. Consider informing your electrician!`,
      timestamp: e.timestamp,
    }));
  }

  return opts;
}
