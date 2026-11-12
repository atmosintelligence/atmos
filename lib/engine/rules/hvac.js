import { THRESHOLDS } from '../constants.js';
import {
  hourOf, costINR, makeOpt, tempOrNull, humidityOrNull, emptyRunEvents, intervalHours,
  isOccupied, timeOf, loadKwh,
} from '../utils.js';

const { low: TEMP_LOW, high: TEMP_HIGH } = THRESHOLDS.temperature;
const { low: HUM_LOW,  high: HUM_HIGH  } = THRESHOLDS.humidity;

const isFresh = (r, now) => timeOf(r) >= now - THRESHOLDS.outdoor.freshMinutes * 60_000;

// T1: the room has been empty but is still cooled to AC temperature, so the AC is
// probably running. Only the hours when an AC is normally used are checked, because a room
// is cool overnight anyway. For recent readings we also check the weather: if it is cool
// outside, a cool room does not prove the AC is on.
export function checkT1(readings, tariff, consecutiveEmpty, loads, outdoorWeather, now = Date.now(), timeZone) {
  const { acRunning } = THRESHOLDS.temperature;
  const coolOutside = outdoorWeather && outdoorWeather.temp < acRunning + THRESHOLDS.outdoor.acColderBy;

  return emptyRunEvents(readings, tariff, consecutiveEmpty, loads.ac, r => {
    const temp = tempOrNull(r);
    if (temp === null || temp > acRunning) return false;
    const hour = hourOf(r, timeZone);
    if (hour < THRESHOLDS.hours.acFrom || hour >= THRESHOLDS.hours.acTo) return false;
    return !(coolOutside && isFresh(r, now));
  });
}

// T2: outdoors is cooler and dry, but the occupied room is warm. If the AC is on,
// opening windows could replace it. Outdoor weather is a live reading, so this only
// looks at recent readings. Applying today's weather to last week's data would be wrong.
export function checkT2(readings, tariff, loads, outdoorWeather, now = Date.now()) {
  if (!outdoorWeather) return [];
  if (outdoorWeather.temp >= THRESHOLDS.outdoor.ventilationTemp) return [];
  if (outdoorWeather.condition === 'Rain') return [];
  if (outdoorWeather.humidity != null && outdoorWeather.humidity > THRESHOLDS.outdoor.maxHumidity) return [];

  const events = [];
  const hours  = intervalHours(readings);

  for (const [i, r] of readings.entries()) {
    if (!isFresh(r, now) || !isOccupied(r)) continue;

    const temp = tempOrNull(r);
    if (temp === null || temp <= THRESHOLDS.temperature.indoorWarm) continue;

    events.push({
      timestamp:       r.timestamp,
      indoorTemp:      temp.toFixed(1),
      outdoorTemp:     outdoorWeather.temp.toFixed(1),
      kwh:             loadKwh(loads.ac, hours[i]),
      estimatedSaving: costINR(loads.ac, 1, tariff),
      intervalSaving:  costINR(loads.ac, hours[i], tariff),
    });
  }

  return events;
}

// T3: humidity too high or too low.
export function checkT3(readings) {
  const events = [];

  for (const r of readings) {
    const hum = humidityOrNull(r);
    if (hum === null) continue;
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
      title: 'AC running in empty room',
      message: `The room has been empty for ${e.vacantMins} minutes and is still at ${e.temp.toFixed(1)}°C, so the AC looks like it is running. Switch it off when the room is empty. Estimated waste so far: about ₹${e.windowWaste}.`,
      saving: { inr: e.windowWaste, kwh: e.windowKwh },
      timestamp: e.timestamp,
    }));
  }

  if (t2Events.length) {
    const e = t2Events.at(-1);
    opts.push(makeOpt({
      group: 'HVAC',
      severity: 'info',
      title: 'Natural ventilation opportunity',
      message: `It is ${e.outdoorTemp}°C and dry outside, cooler than your room at ${e.indoorTemp}°C. If the AC is on, opening a window could replace it and save about ₹${e.estimatedSaving} an hour.`,
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
      message: `Room humidity is ${e.humidity}%. The comfortable range is ${HUM_LOW}–${HUM_HIGH}%. ${e.high
        ? 'High humidity makes cooling work harder. Try a dehumidifier or more ventilation.'
        : 'Low humidity feels uncomfortable and builds static. A humidifier can help.'}`,
      timestamp: e.timestamp,
    }));
  }

  return opts;
}
