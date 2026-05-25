import { mean } from './utils.js';

export function computeIdleBaseline(readings) {
  const night = readings.filter(r => {
    const h = new Date(r.timestamp).getHours();
    return h >= 0 && h < 5
      && (r.occupancy === 'false' || r.occupancy === false)
      && parseFloat(r.light_lux ?? r.light ?? 0) < 50;
  });
  if (!night.length) return 50;
  return mean(night.map(r => parseFloat(r.power_w ?? r.power ?? 0)));
}