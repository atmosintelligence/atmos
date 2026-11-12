// What a user has saved so far. Only alerts the user has acknowledged count: it means they
// read the advice and acted on it. kWh is worked back from the ₹ estimate and the device's
// rate, so every figure here is an estimate, not a meter reading.

import { CO2_KG_PER_KWH, TARIFF_DEFAULT } from '@/lib/engine/constants.js';
import { treesEquivalent } from '@/lib/engine/utils.js';

export function summariseSavings(alerts, tariff = TARIFF_DEFAULT) {
  const done = (alerts ?? []).filter(a => a.acknowledged);
  const inr  = done.reduce((sum, a) => sum + (Number(a.saving_inr) || 0), 0);
  const kwh  = tariff > 0 ? inr / tariff : 0;
  const co2Kg = kwh * CO2_KG_PER_KWH;

  return {
    count: done.length,
    inr,
    kwh,
    co2Kg,
    trees: treesEquivalent(co2Kg),
  };
}

// Indian digit grouping: 1,23,456
export const formatINR = value =>
  `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
