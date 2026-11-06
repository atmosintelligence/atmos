export const TARIFF_DEFAULT       = 10;     // ₹ per kWh
export const CO2_KG_PER_KWH       = 0.727;
export const TREE_CO2_KG_PER_YEAR = 24;
export const BEE_BENCHMARK_KWH_M2 = 180;    // kWh per m² per year
export const ROOM_AREA_M2         = 20;
export const GENERATION_COOLDOWN_SECONDS = 30;

// Energy is power times the time until the next reading. Gaps longer than
// MAX_GAP_HOURS (device offline) are not counted. FALLBACK is used with one reading.
export const MAX_GAP_HOURS = 1;
export const FALLBACK_INTERVAL_HOURS = 1 / 6;

export const MS_PER_HOUR = 3_600_000;
export const MS_PER_DAY  = 86_400_000;

export const THRESHOLDS = {
  temperature:  { low: 22,  high: 30, indoorWarm: 27 },
  humidity:     { low: 28,  high: 72  },
  voltage:      { low: 210, high: 245 },
  lux:          { daylight: 400, dark: 50 },
  power: {
    idleOffset:        50,
    acOffset:          100,
    phantomFloor:      80,
    phantomEmptyHours: 4,
    spikeZScore:       2.5,
    weekOverWeekPct:   8,
    defaultBaseline:   50,
  },
  baselineHours: { from: 0, to: 5 },   // night window used to find idle power
  occupancy: { consecutiveEmpty: 3 },
  outdoor: { ventilationTemp: 26 },
};
