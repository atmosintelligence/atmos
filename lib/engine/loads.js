import { ASSUMED_LOADS_W, DEFAULT_MONTHLY_KWH, LOAD_SCALE_MIN, LOAD_SCALE_MAX } from './constants.js';

// Turns the owner's monthly kWh into the watts used for waste estimates.
// With no figure, or a bad one, the assumed loads are used as they are.
export function resolveLoads(monthlyKwh) {
  const kwh = Number(monthlyKwh);
  const known = Number.isFinite(kwh) && kwh > 0;
  const raw = known ? kwh / DEFAULT_MONTHLY_KWH : 1;
  const scale = Math.min(Math.max(raw, LOAD_SCALE_MIN), LOAD_SCALE_MAX);

  return {
    lighting: ASSUMED_LOADS_W.lighting * scale,
    ac:       ASSUMED_LOADS_W.ac       * scale,
    standby:  ASSUMED_LOADS_W.standby  * scale,
    monthlyKwh: known ? kwh : DEFAULT_MONTHLY_KWH,
    monthlyKwhKnown: known,
  };
}
