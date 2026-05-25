import { computeIdleBaseline } from './baseline.js';
import { getOutdoorWeather }   from './weather.js';
import { checkL1, checkL2, buildLightingOptimizations } from './rules/lighting.js';
import { checkT1, checkT2, checkT3, buildHvacOptimizations } from './rules/hvac.js';
import { checkP1, checkP2, checkP3, buildPowerOptimizations } from './rules/power.js';
import { checkTrend1, checkTrend2, buildTrendOptimizations } from './rules/trends.js';
import { computeEnvironmental } from './rules/environmental.js';
import { mean, stdDev } from './utils.js';
import { TARIFF_DEFAULT } from './constants.js';

export async function runEngine({ readings, location, roomAreaM2 = 20, tariff = TARIFF_DEFAULT, thresholdOverrides = {} }) {
  const sorted = [...readings].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const idleBaseline = computeIdleBaseline(sorted);

  let outdoorWeather = null;
  let weatherError   = null;
  if (location?.lat && location?.lon) {
    try {
      outdoorWeather = await getOutdoorWeather(location.lat, location.lon);
    } catch (err) {
      weatherError = err.message;
    }
  }

  const l1Events = checkL1(sorted, idleBaseline, tariff);
  const l2Events = checkL2(sorted, idleBaseline, tariff);
  const t1Events = checkT1(sorted);
  const t2Events = checkT2(sorted, idleBaseline, tariff, outdoorWeather);
  const t3Events = checkT3(sorted);
  const p1Events = checkP1(sorted);
  const p2Events = checkP2(sorted, tariff);
  const p3Events = checkP3(sorted);
  const trend1   = checkTrend1(sorted);
  const trend2   = checkTrend2(sorted);

  const now    = Date.now();
  const msDay  = 86400000;

  const lightingOpts = buildLightingOptimizations(l1Events, l2Events, idleBaseline);
  const hvacOpts     = buildHvacOptimizations(t1Events, t2Events, t3Events);
  const powerOpts    = buildPowerOptimizations(p1Events, p2Events, p3Events);
  const trendOpts    = buildTrendOptimizations(trend1, trend2);
  const optimizations = [...lightingOpts, ...hvacOpts, ...powerOpts, ...trendOpts];

  const environmental = computeEnvironmental(sorted, tariff, roomAreaM2);

  const avgPowerThisWeek = mean(sorted.filter(r => (now - new Date(r.timestamp)) / msDay < 7).map(r => parseFloat(r.power_w ?? r.power ?? 0)));
  const avgPowerLastWeek = mean(sorted.filter(r => { const a = (now - new Date(r.timestamp)) / msDay; return a >= 7 && a < 14; }).map(r => parseFloat(r.power_w ?? r.power ?? 0)));

  const dailyBreakdown = Array.from({ length: 7 }, (_, i) => {
    const dayR = sorted.filter(r => { const a = (now - new Date(r.timestamp)) / msDay; return a >= i && a < i + 1; });
    const date = new Date(now - i * msDay);
    return {
      date:     date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      avgPower: mean(dayR.map(r => parseFloat(r.power_w ?? r.power ?? 0))).toFixed(0),
      readings: dayR.length,
      kwh:      (mean(dayR.map(r => parseFloat(r.power_w ?? r.power ?? 0))) * (dayR.length * 0.5) / 1000).toFixed(3),
    };
  }).reverse();

  return {
    optimizations,
    environmental,
    outdoorWeather,
    weatherError,
    analysis: {
      lighting:    { l1Events, l2Events, idleBaseline },
      hvac:        { t1Events, t2Events, t3Events },
      power:       { p1Events, p2Events, p3Events, avgPower: mean(sorted.map(r => parseFloat(r.power_w ?? r.power ?? 0))), maxPower: Math.max(...sorted.map(r => parseFloat(r.power_w ?? r.power ?? 0))), totalEnergy: sorted.reduce((a, r) => a + parseFloat(r.energy ?? 0), 0) },
      trends:      { trend1, trend2, avgPowerThisWeek, avgPowerLastWeek, dailyBreakdown },
      environmental,
    },
  };
}