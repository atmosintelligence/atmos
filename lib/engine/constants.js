export const TARIFF_DEFAULT       = 10;     // ₹ per kWh
export const CO2_KG_PER_KWH       = 0.727;
export const TREE_CO2_KG_PER_YEAR = 24;
export const BEE_BENCHMARK_KWH_M2 = 180;    // kWh per m² per year
export const ROOM_AREA_M2         = 20;
export const GENERATION_COOLDOWN_SECONDS = 30;

// All "hour of day", "weekday" and "calendar day" logic uses this zone, because the
// server runs in UTC. India has a single zone and no daylight saving.
export const DEFAULT_TIME_ZONE = 'Asia/Kolkata';

// The unit cannot measure power, energy or voltage. The owner can enter the room's
// monthly electricity use in Device settings. When they have not, we assume the BEE
// benchmark for the room, and we assume typical loads for the appliances below.
export const DEFAULT_MONTHLY_KWH = Math.round((BEE_BENCHMARK_KWH_M2 * ROOM_AREA_M2) / 12);   // 300

// Typical draw in watts for a room of ROOM_AREA_M2. They scale with the owner's monthly
// kWh (see scaleFor in loads.js), so a bigger room gets bigger loads.
export const ASSUMED_LOADS_W = {
  lighting: 120,   // LED panels / tube lights for a ~20 m² room
  ac:       1200,  // 1.5 tonne split AC, average while the compressor cycles
  standby:  45,    // chargers, monitors, routers and other idle devices
};
export const LOAD_SCALE_MIN = 0.4;
export const LOAD_SCALE_MAX = 4;

// Energy is estimated from how long a state lasts. Gaps longer than MAX_GAP_HOURS
// (device offline) are not counted. FALLBACK is used with one reading.
export const MAX_GAP_HOURS = 1;
export const FALLBACK_INTERVAL_HOURS = 1 / 6;

export const MS_PER_HOUR = 3_600_000;
export const MS_PER_DAY  = 86_400_000;

export const THRESHOLDS = {
  temperature:  { low: 22,  high: 30, indoorWarm: 27, acRunning: 24.5 },
  humidity:     { low: 28,  high: 72  },
  lux:          { daylight: 400, lightsOn: 120 },
  hours:        { nightFrom: 18, nightTo: 6, dayFrom: 8, dayTo: 17, acFrom: 9, acTo: 21 },   // local time
  power: {
    phantomEmptyHours: 4,
    weekOverWeekPct:   15,   // avoidable energy must rise this much, week on week
    trendMinKwh:       0.5,  // ...and by at least this many kWh
  },
  occupancy: { consecutiveEmpty: 3 },
  outdoor: { ventilationTemp: 26, maxHumidity: 70, freshMinutes: 120, acColderBy: 4 },
  trends: {
    minDaysPerWeek:       5,
    occupancyShiftPoints: 10,
    peakShareMin:         0.35,   // one hour holding this share of waste counts as a peak
    peakMinEvents:        6,
  },
};
