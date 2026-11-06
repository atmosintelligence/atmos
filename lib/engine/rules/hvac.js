import { THRESHOLDS } from '../constants.js';
import { costINR, makeOpt, powerOf, tempOf, humidityOf, emptyStreak, intervalHours } from '../utils.js';

const { low: TEMP_LOW, high: TEMP_HIGH } = THRESHOLDS.temperature;
const { low: HUM_LOW,  high: HUM_HIGH  } = THRESHOLDS.humidity;

// T1: temperature is outside the comfort band while the room is empty.
export function checkT1(readings, consecutiveEmpty = 3) {
  const events = [];

  for (let i = consecutiveEmpty - 1; i < readings.length; i++) {
    if (!emptyStreak(readings, i, consecutiveEmpty)) continue;

    const temp = tempOf(readings[i]);
    if (temp < TEMP_LOW || temp > TEMP_HIGH) {
      events.push({ timestamp: readings[i].timestamp, temp: temp.toFixed(1) });
    }
  }

  return events;
}

// T2: outdoors is cooler and dry, but the room is warm and AC seems to be running.
export function checkT2(readings, idleBaseline, tariff, outdoorWeather) {
  if (!outdoorWeather) return [];
  if (outdoorWeather.temp >= THRESHOLDS.outdoor.ventilationTemp) return [];
  if (outdoorWeather.condition === 'Rain') return [];

  const events = [];
  const hours  = intervalHours(readings);

  for (const [i, r] of readings.entries()) {
    const temp  = tempOf(r);
    const power = powerOf(r);

    if (temp > THRESHOLDS.temperature.indoorWarm && power > idleBaseline + THRESHOLDS.power.acOffset) {
      events.push({
        timestamp:       r.timestamp,
        indoorTemp:      temp.toFixed(1),
        outdoorTemp:     outdoorWeather.temp.toFixed(1),
        power:           power.toFixed(0),
        estimatedSaving: costINR(power - idleBaseline, 1, tariff),
        intervalSaving:  costINR(power - idleBaseline, hours[i], tariff),
      });
    }
  }

  return events;
}

// T3: humidity too high or too low.
export function checkT3(readings) {
  const events = [];

  for (const r of readings) {
    const hum = humidityOf(r);
    if (hum > HUM_HIGH || hum < HUM_LOW) {
      events.push({ timestamp: r.timestamp, humidity: hum.toFixed(0), high: hum > HUM_HIGH });
    }
  }

  return events;
}

export function buildHvacOptimizations(t1Events, t2Events, t3Events) {
  const opts = [];

  if (t1Events.length) {
    const e = t1Events.at(-1);
    opts.push(makeOpt({
      group: 'HVAC',
      severity: 'warning',
      title: 'Conditioning an empty room',
      message: `The room has been empty for several consecutive readings whilst the temperature sits at ${e.temp}°C. This is outside the comfortable ${TEMP_LOW}–${TEMP_HIGH}°C band. If air conditioning or heating is running, it is conditioning an unoccupied space. Consider switching it off!`,
      timestamp: e.timestamp,
    }));
  }

  if (t2Events.length) {
    const e = t2Events.at(-1);
    opts.push(makeOpt({
      group: 'HVAC',
      severity: 'info',
      title: 'Natural ventilation opportunity',
      message: `Outdoor temperature is ${e.outdoorTemp}°C and conditions are dry, which is cooler than your room at ${e.indoorTemp}°C. Opening windows could replace air conditioning entirely and save approximately ₹${e.estimatedSaving} per hour.`,
      saving: { inr: e.estimatedSaving },
      timestamp: e.timestamp,
    }));
  }

  if (t3Events.length) {
    const e = t3Events.at(-1);
    opts.push(makeOpt({
      group: 'Humidity',
      severity: e.high ? 'warning' : 'info',
      title: 'Humidity outside comfortable range',
      message: `Room humidity is currently ${e.humidity}%. The comfortable range is ${HUM_LOW}–${HUM_HIGH}%. ${e.high
        ? 'High humidity increases the cooling load and accelerates equipment degradation. Consider dehumidification or improved ventilation.'
        : 'Low humidity can cause discomfort and static build-up. Consider a humidifier.'}`,
      timestamp: e.timestamp,
    }));
  }

  return opts;
}
