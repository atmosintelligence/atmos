import { THRESHOLDS } from '../constants.js';
import { costINR, makeOpt } from '../utils.js';

export function checkT1(readings) {
  const events = [];
  for (let i = 2; i < readings.length; i++) {
    const window = [readings[i - 2], readings[i - 1], readings[i]];
    const allEmpty = window.every(r => r.occupancy === 'false' || r.occupancy === false);
    const temp = parseFloat(readings[i].temp_c ?? readings[i].temperature ?? 0);
    if (allEmpty && (temp < THRESHOLDS.temperature.low || temp > THRESHOLDS.temperature.high)) {
      events.push({ timestamp: readings[i].timestamp, temp: temp.toFixed(1) });
    }
  }
  return events;
}

export function checkT2(readings, idleBaseline, tariff, outdoorWeather) {
  if (!outdoorWeather) return [];
  if (outdoorWeather.temp >= THRESHOLDS.outdoor.ventilationTemp) return [];
  if (outdoorWeather.condition === 'Rain') return [];
  const events = [];
  for (const r of readings) {
    const temp  = parseFloat(r.temp_c ?? r.temperature ?? 0);
    const power = parseFloat(r.power_w ?? r.power ?? 0);
    if (temp > 27 && power > idleBaseline + THRESHOLDS.power.acOffset) {
      events.push({
        timestamp: r.timestamp,
        indoorTemp: temp.toFixed(1),
        outdoorTemp: outdoorWeather.temp.toFixed(1),
        power: power.toFixed(0),
        estimatedSaving: costINR(power - idleBaseline, 1, tariff),
      });
    }
  }
  return events;
}

export function checkT3(readings) {
  const events = [];
  for (const r of readings) {
    const hum = parseFloat(r.humidity_pct ?? r.humidity ?? 0);
    if (hum > THRESHOLDS.humidity.high || hum < THRESHOLDS.humidity.low) {
      events.push({ timestamp: r.timestamp, humidity: hum.toFixed(0), high: hum > THRESHOLDS.humidity.high });
    }
  }
  return events;
}

export function buildHvacOptimizations(t1Events, t2Events, t3Events) {
  const opts = [];
  if (t1Events.length) {
    const e = t1Events.at(-1);
    opts.push(makeOpt({
      group: 'HVAC', severity: 'warning',
      title: 'Conditioning an empty room',
      message: `The room has been empty for three or more consecutive readings whilst the temperature sits at ${e.temp}°C — outside the comfortable 22–30°C band. If air conditioning or heating is running, it is conditioning an unoccupied space. Consider switching it off.`,
      timestamp: e.timestamp,
    }));
  }
  if (t2Events.length) {
    const e = t2Events.at(-1);
    opts.push(makeOpt({
      group: 'HVAC', severity: 'info',
      title: 'Natural ventilation opportunity',
      message: `Outdoor temperature is ${e.outdoorTemp}°C and conditions are dry — cooler than your room at ${e.indoorTemp}°C. Opening windows could replace air conditioning entirely and save approximately ₹${e.estimatedSaving} per hour.`,
      saving: { inr: e.estimatedSaving },
      timestamp: e.timestamp,
    }));
  }
  if (t3Events.length) {
    const e = t3Events.at(-1);
    opts.push(makeOpt({
      group: 'Humidity', severity: e.high ? 'warning' : 'info',
      title: 'Humidity outside comfortable range',
      message: `Room humidity is currently ${e.humidity}%. The comfortable range is 30–70%. ${parseFloat(e.humidity) > 72
        ? 'High humidity increases the cooling load and accelerates equipment degradation. Consider dehumidification or improved ventilation.'
        : 'Low humidity can cause discomfort and static build-up. Consider a humidifier.'}`,
      timestamp: e.timestamp,
    }));
  }
  return opts;
}