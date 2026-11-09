import { computeIdleBaseline } from './baseline.js';
import { getOutdoorWeather }   from './weather.js';
import { checkL1, checkL2, buildLightingOptimizations } from './rules/lighting.js';
import { checkT1, checkT2, checkT3, buildHvacOptimizations } from './rules/hvac.js';
import { checkP1, checkP2, checkP3, buildPowerOptimizations } from './rules/power.js';
import { checkTrend1, checkTrend2, buildTrendOptimizations } from './rules/trends.js';
import { computeEnvironmental } from './rules/environmental.js';
import { mean, powerOf, inDays, toKwh, MS_PER_DAY } from './utils.js';
import { TARIFF_DEFAULT, THRESHOLDS } from './constants.js';

async function loadWeather(location) {
  if (location?.lat == null || location?.lon == null) return { outdoorWeather: null, weatherError: null };
  try {
    return { outdoorWeather: await getOutdoorWeather(location.lat, location.lon), weatherError: null };
  } catch (err) {
    return { outdoorWeather: null, weatherError: err.message };
  }
}

// Runs every rule over the readings and returns recommendations plus the data behind them.
// thresholdOverrides can set: consecutiveEmpty, phantomLoadHours, spikeZScore, weekOverWeekPct.
export async function runEngine({
  readings,
  location,
  roomAreaM2 = 20,
  tariff = TARIFF_DEFAULT,
  thresholdOverrides = {},
}) {
  const sorted = [...readings].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const now    = Date.now();

  const consecEmpty     = thresholdOverrides.consecutiveEmpty ?? THRESHOLDS.occupancy.consecutiveEmpty;
  const phantomHours    = thresholdOverrides.phantomLoadHours ?? THRESHOLDS.power.phantomEmptyHours;
  const spikeZ          = thresholdOverrides.spikeZScore      ?? THRESHOLDS.power.spikeZScore;
  const weekOverWeekPct = thresholdOverrides.weekOverWeekPct  ?? THRESHOLDS.power.weekOverWeekPct;

  const baseline     = computeIdleBaseline(sorted);
  const idleBaseline = baseline.watts;
  const { outdoorWeather, weatherError } = await loadWeather(location);

  // Rules
  const l1Events = checkL1(sorted, idleBaseline, tariff, consecEmpty);
  const l2Events = checkL2(sorted, idleBaseline, tariff);
  const t1Events = checkT1(sorted, consecEmpty);
  const t2Events = checkT2(sorted, idleBaseline, tariff, outdoorWeather);
  const t3Events = checkT3(sorted);
  const p1Events = checkP1(sorted, spikeZ);
  const p2Events = checkP2(sorted, tariff, phantomHours);
  const p3Events = checkP3(sorted);
  const trend1   = checkTrend1(sorted, weekOverWeekPct);
  const trend2   = checkTrend2(sorted);

  const optimizations = [
    ...buildLightingOptimizations(l1Events, l2Events),
    ...buildHvacOptimizations(t1Events, t2Events, t3Events),
    ...buildPowerOptimizations(p1Events, p2Events, p3Events),
    ...buildTrendOptimizations(trend1, trend2, sorted.at(-1)?.timestamp)
  ];

  const environmental = computeEnvironmental(sorted, tariff, roomAreaM2);

  // Numbers for the Power and Trends pages
  const powers = sorted.map(powerOf);

  const dailyBreakdown = Array.from({ length: 7 }, (_, i) => {
    const day = inDays(sorted, i, i + 1, now);
    return {
      date:     new Date(now - i * MS_PER_DAY).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      avgPower: mean(day.map(powerOf)).toFixed(0),
      readings: day.length,
      kwh:      toKwh(day).toFixed(3),
    };
  }).reverse();

  return {
    optimizations,
    environmental,
    outdoorWeather,
    weatherError,
    analysis: {
      lighting: { l1Events, l2Events, idleBaseline, idleBaselineMeasured: baseline.measured },
      hvac:     { t1Events, t2Events, t3Events },
      power: {
        p1Events, p2Events, p3Events,
        avgPower:    mean(powers),
        maxPower:    powers.length ? Math.max(...powers) : 0,
        totalEnergy: toKwh(sorted),
        firstReading: sorted[0]?.timestamp ?? null,
        lastReading:  sorted.at(-1)?.timestamp ?? null,
      },
      trends: {
        trend1, trend2,
        avgPowerThisWeek: mean(inDays(sorted, 0, 7, now).map(powerOf)),
        avgPowerLastWeek: mean(inDays(sorted, 7, 14, now).map(powerOf)),
        dailyBreakdown,
      },
      environmental,
    },
  };
}
