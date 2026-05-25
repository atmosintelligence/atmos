export const TARIFF_DEFAULT       = 10;
export const CO2_KG_PER_KWH       = 0.727;
export const TREE_CO2_KG_PER_YEAR = 24;
export const BEE_BENCHMARK_KWH_M2 = 180;
export const ROOM_AREA_M2         = 20;

export const THRESHOLDS = {
  temperature:  { low: 22,  high: 30  },
  humidity:     { low: 28,  high: 72  },
  voltage:      { low: 210, high: 245 },
  lux:          { daylight: 400       },
  power: {
    idleOffset:        50,
    acOffset:          100,
    phantomFloor:      80,
    phantomEmptyHours: 4,
    spikeZScore:       2.5,
    weekOverWeekPct:   8,
  },
  occupancy: { consecutiveEmpty: 3 },
  outdoor: { ventilationTemp: 26 },
};