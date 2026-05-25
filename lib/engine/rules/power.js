import { THRESHOLDS } from '../constants.js';
import { mean, stdDev, zScore, costINR, makeOpt } from '../utils.js';

export function checkP1(readings) {
  const byHourDow = {};
  for (const r of readings) {
    const d   = new Date(r.timestamp);
    const key = `${d.getDay()}-${d.getHours()}`;
    if (!byHourDow[key]) byHourDow[key] = [];
    byHourDow[key].push(parseFloat(r.power_w ?? r.power ?? 0));
  }
  const latest = readings.at(-1);
  if (!latest) return [];
  const d   = new Date(latest.timestamp);
  const key = `${d.getDay()}-${d.getHours()}`;
  const hist = byHourDow[key] ?? [];
  if (hist.length < 3) return [];
  const m  = mean(hist);
  const sd = stdDev(hist);
  const z  = zScore(parseFloat(latest.power_w ?? latest.power ?? 0), m, sd);
  if (z <= THRESHOLDS.power.spikeZScore) return [];
  return [{ timestamp: latest.timestamp, power: parseFloat(latest.power_w ?? latest.power).toFixed(0), avg: m.toFixed(0), z: z.toFixed(2) }];
}

export function checkP2(readings, tariff) {
  const events = [];
  let emptyStart = null;
  for (const r of readings) {
    const empty = r.occupancy === 'false' || r.occupancy === false;
    if (empty && !emptyStart) emptyStart = new Date(r.timestamp);
    if (!empty) { emptyStart = null; continue; }
    if (emptyStart) {
      const emptyHours = (new Date(r.timestamp) - emptyStart) / 3600000;
      const power      = parseFloat(r.power_w ?? r.power ?? 0);
      if (emptyHours >= THRESHOLDS.power.phantomEmptyHours && power > THRESHOLDS.power.phantomFloor) {
        events.push({ timestamp: r.timestamp, emptyHours: emptyHours.toFixed(1), power: power.toFixed(0), cost: costINR(power, emptyHours, tariff) });
      }
    }
  }
  return events;
}

export function checkP3(readings) {
  return readings
    .filter(r => { const v = parseFloat(r.voltage_v ?? r.voltage ?? 0); return v < THRESHOLDS.voltage.low || v > THRESHOLDS.voltage.high; })
    .map(r => ({ timestamp: r.timestamp, voltage: parseFloat(r.voltage_v ?? r.voltage).toFixed(0), low: parseFloat(r.voltage_v ?? r.voltage) < THRESHOLDS.voltage.low }));
}

export function buildPowerOptimizations(p1Events, p2Events, p3Events) {
  const opts = [];
  if (p1Events.length) {
    const e = p1Events[0];
    opts.push(makeOpt({
      group: 'Power', severity: 'critical',
      title: 'Unusual power spike detected',
      message: `Current power consumption is ${e.power} W — statistically unusual for this time of day (typical average: ${e.avg} W). This may indicate an unexpected appliance has been switched on, or a fault in the circuit. Investigate immediately.`,
      timestamp: e.timestamp,
    }));
  }
  if (p2Events.length) {
    const e = p2Events.at(-1);
    opts.push(makeOpt({
      group: 'Power', severity: 'warning',
      title: 'Phantom load whilst room is empty',
      message: `The room has been empty for ${e.emptyHours} hours but is consuming ${e.power} W — above the 80 W standby floor. Appliances appear to have been left on. Estimated cost since the room emptied: ₹${e.cost}.`,
      saving: { inr: e.cost },
      timestamp: e.timestamp,
    }));
  }
  if (p3Events.length) {
    const e = p3Events.at(-1);
    opts.push(makeOpt({
      group: 'Power', severity: 'warning',
      title: 'Voltage outside stable range',
      message: `Voltage detected at ${e.voltage} V — ${e.low ? 'below' : 'above'} the stable 210–245 V range. This reduces appliance efficiency and shortens equipment lifespan. Consider informing your electrician.`,
      timestamp: e.timestamp,
    }));
  }
  return opts;
}