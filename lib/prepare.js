import { mean } from './engine/utils.js';
import { TARIFF_DEFAULT, BEE_BENCHMARK_KWH_M2 } from './engine/constants.js';

function parseRow(row) {
  return {
    timestamp:    new Date(row.timestamp),
    occupancy:    row.occupancy === 'true' || row.occupancy === true || row.occupancy === 1,
    temp_c:       parseFloat(row.temperature) || null,
    humidity_pct: parseFloat(row.humidity)    || null,
    power_w:      parseFloat(row.power)       || null,
    voltage_v:    parseFloat(row.voltage)     || null,
    light_lux:    parseFloat(row.light)       || null,
    energy_kwh:   parseFloat(row.energy)      || null,
    co2:          null,
    aqi:          null,
  };
}

export function prepareEnginePayload(rawReadings, { location, roomAreaM2 = 20 }) {
  const readings = rawReadings.map(parseRow).sort((a, b) => a.timestamp - b.timestamp);
  if (!readings.length) return null;

  const now = new Date();
  const latestOccupied = readings.findLast(r => r.occupancy);
  const vacantSince = latestOccupied ? latestOccupied.timestamp : readings[0].timestamp;
  const vacantHours = (now - vacantSince) / 3_600_000;

  const emptyRun = [...readings].reverse();
  let emptyHours = 0;
  for (const r of emptyRun) {
    if (!r.occupancy) emptyHours += 0.5;
    else break;
  }

  const nightReadings = readings.filter(r => {
    const h = r.timestamp.getHours();
    return h >= 0 && h < 5 && !r.occupancy && r.light_lux < 50;
  });
  const idleBaseline = nightReadings.length
    ? mean(nightReadings.map(r => r.power_w).filter(Boolean))
    : 50;

  const thisHourDow = `${now.getDay()}-${now.getHours()}`;
  const historicalForThisHour = readings.filter(r => {
    const key = `${r.timestamp.getDay()}-${r.timestamp.getHours()}`;
    return key === thisHourDow;
  });

  const msPerDay = 86_400_000;
  const days = (offset, count) => readings.filter(r => {
    const age = (now - r.timestamp) / msPerDay;
    return age >= offset && age < offset + count;
  });

  const toKwh = rs => mean(rs.map(r => r.power_w).filter(Boolean)) * (rs.length * 0.5) / 1000;

  const thisWeekKwh = toKwh(days(0, 7));
  const lastWeekKwh = toKwh(days(7, 7));

  const dailyOccupiedPower = Array.from({ length: 14 }, (_, i) => {
    const dayReadings = days(i, 1).filter(r => r.occupancy);
    return mean(dayReadings.map(r => r.power_w).filter(Boolean)) || 0;
  }).reverse();

  const monthReadings = days(0, 30);
  const actualKwhMonth = toKwh(monthReadings);
  const baselineKwhMonth = (BEE_BENCHMARK_KWH_M2 * roomAreaM2) / 12;

  return {
    readings,
    historicalForThisHour,
    idleBaseline,
    vacantHours,
    emptyHours,
    hoursOfCondition: 8,
    thisWeekKwh,
    lastWeekKwh,
    dailyOccupiedPower,
    baselineKwhMonth,
    actualKwhMonth,
    tariff: TARIFF_INR_PER_KWH,
    location,
  };
}