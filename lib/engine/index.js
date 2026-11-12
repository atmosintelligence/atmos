import { getOutdoorWeather }   from './weather.js';
import { resolveLoads }        from './loads.js';
import { checkL1, checkL2, buildLightingOptimizations } from './rules/lighting.js';
import { checkT1, checkT2, checkT3, buildHvacOptimizations } from './rules/hvac.js';
import { checkS1, buildStandbyOptimizations } from './rules/standby.js';
import { checkTrend1, checkTrend2, buildTrendOptimizations } from './rules/trends.js';
import { computeEnvironmental } from './rules/environmental.js';
import { parseOccupancy, timeOf, localParts, dayLabel, intervalHours, MS_PER_DAY } from './utils.js';
import { TARIFF_DEFAULT, THRESHOLDS, DEFAULT_TIME_ZONE } from './constants.js';

async function loadWeather(location) {
  if (location?.lat == null || location?.lon == null) return { outdoorWeather: null, weatherError: null };
  try {
    return { outdoorWeather: await getOutdoorWeather(location.lat, location.lon), weatherError: null };
  } catch (err) {
    return { outdoorWeather: null, weatherError: err.message };
  }
}

// The last 7 calendar days (in `timeZone`), oldest first, with today last: how long the
// room was occupied or empty, and the avoidable energy the rules found that day.
function buildDailyBreakdown(sorted, wasteEvents, now, timeZone) {
  const hours = intervalHours(sorted);
  const byDay = new Map();

  sorted.forEach((r, i) => {
    const key = localParts(timeOf(r), timeZone).day;
    const day = byDay.get(key) ?? { occupiedH: 0, emptyH: 0, readings: 0, wasteKwh: 0 };
    const occ = parseOccupancy(r.occupancy);
    if (occ === true)  day.occupiedH += hours[i];
    if (occ === false) day.emptyH    += hours[i];
    day.readings += 1;
    byDay.set(key, day);
  });

  for (const e of wasteEvents) {
    const day = byDay.get(localParts(timeOf(e), timeZone).day);
    if (day) day.wasteKwh += e.kwh;
  }

  return Array.from({ length: 7 }, (_, i) => {
    const ms  = now - i * MS_PER_DAY;
    const day = byDay.get(localParts(ms, timeZone).day) ?? { occupiedH: 0, emptyH: 0, readings: 0, wasteKwh: 0 };
    return {
      date:      dayLabel(ms, timeZone),
      occupiedH: Number(day.occupiedH.toFixed(1)),
      emptyH:    Number(day.emptyH.toFixed(1)),
      readings:  day.readings,
      wasteKwh:  Number(day.wasteKwh.toFixed(3)),
    };
  }).reverse();
}

// Runs every rule over the readings and returns recommendations plus the data behind them.
//
// The unit reports temperature, humidity, light and occupancy only. Energy figures are
// estimates: assumed appliance loads (see constants.js), scaled by monthlyKwh when the
// owner has entered it.
//
// thresholdOverrides can set: consecutiveEmpty, phantomLoadHours, weekOverWeekPct and
// recentHours. recentHours (default 24) hides recommendations whose latest event is
// older than that; older events stay in `analysis`. Pass null to keep everything.
//
// timeZone controls hour of day, weekday and calendar days; `now` exists for testing.
export async function runEngine({
  readings,
  location,
  roomAreaM2 = 20,
  tariff = TARIFF_DEFAULT,
  monthlyKwh = null,
  thresholdOverrides = {},
  timeZone = DEFAULT_TIME_ZONE,
  now = Date.now(),
}) {
  const sorted = (readings ?? [])
    .filter(r => r && Number.isFinite(timeOf(r)))
    .sort((a, b) => timeOf(a) - timeOf(b));

  const consecEmpty     = thresholdOverrides.consecutiveEmpty ?? THRESHOLDS.occupancy.consecutiveEmpty;
  const phantomHours    = thresholdOverrides.phantomLoadHours ?? THRESHOLDS.power.phantomEmptyHours;
  const recentHours     = 'recentHours' in thresholdOverrides ? thresholdOverrides.recentHours : 24;

  const loads = resolveLoads(monthlyKwh);
  const { outdoorWeather, weatherError } = await loadWeather(location);

  // Rules
  const l1Events = checkL1(sorted, tariff, consecEmpty, loads, timeZone);
  const l2Events = checkL2(sorted, tariff, loads, timeZone);
  const t1Events = checkT1(sorted, tariff, consecEmpty, loads, outdoorWeather, now, timeZone);
  const t2Events = checkT2(sorted, tariff, loads, outdoorWeather, now);
  const t3Events = checkT3(sorted);
  const s1Events = checkS1(sorted, tariff, loads, phantomHours, timeZone);

  const wasteEvents = [...l1Events, ...t1Events, ...s1Events];
  const trend1 = checkTrend1(sorted, wasteEvents, now, timeZone);
  const trend2 = checkTrend2(wasteEvents, timeZone);

  const optimizations = [
    ...buildLightingOptimizations(l1Events, l2Events),
    ...buildHvacOptimizations(t1Events, t2Events, t3Events),
    ...buildStandbyOptimizations(s1Events),
    ...buildTrendOptimizations(trend1, trend2, sorted.at(-1)?.timestamp),
  ].filter(o => recentHours == null || !o.timestamp || now - new Date(o.timestamp).getTime() <= recentHours * 3_600_000);

  const environmental = computeEnvironmental(sorted, wasteEvents, { loads, roomAreaM2, now, timeZone });

  return {
    optimizations,
    environmental,
    outdoorWeather,
    weatherError,
    loads: { lighting: loads.lighting, ac: loads.ac, standby: loads.standby, monthlyKwh: loads.monthlyKwh, monthlyKwhKnown: loads.monthlyKwhKnown },
    analysis: {
      lighting: { l1Events, l2Events },
      hvac:     { t1Events, t2Events, t3Events },
      standby:  { s1Events },
      trends:   { trend1, trend2, dailyBreakdown: buildDailyBreakdown(sorted, wasteEvents, now, timeZone) },
      environmental,
      firstReading: sorted[0]?.timestamp ?? null,
      lastReading:  sorted.at(-1)?.timestamp ?? null,
    },
  };
}
