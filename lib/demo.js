// Demo Mode data. It is simulated, never live: four weeks of readings every 30 minutes,
// built from a fixed seed so the demo looks the same each time. Each room has a normal
// working pattern plus a few habits that waste energy, so every dashboard page has
// something to show. Demo rooms report temperature, humidity, light and occupancy only,
// like the real unit.

export const DEMO_DEVICE_ID   = 'ATM-DEMO';
export const DEMO_DEVICE_ID_2 = 'ATM-DEMO2';

export const DEMO_PLAN = {
  plan:            'enterprise',
  label:           'Enterprise',
  last_payment_at: null,
  next_payment_at: null,
};

const STEP_MIN = 30;
const DAYS     = 28;
const IST_MS   = 330 * 60_000;

// Small seeded random numbers (mulberry32).
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ROOMS = {
  [DEMO_DEVICE_ID]:   { seed: 11, open: 9,   close: 18.5, lightsLeftOn: 0.35, acLeftOn: 0.3,  acTemp: 24.0, leaveEarly: 0.1 },
  [DEMO_DEVICE_ID_2]: { seed: 29, open: 8.5, close: 17,   lightsLeftOn: 0.2,  acLeftOn: 0.45, acTemp: 23.5, leaveEarly: 0.2 },
};

// Hours since local midnight for a timestamp, in India time (the demo is for Indian rooms).
const istHours = ms => {
  const d = new Date(ms + IST_MS);
  return d.getUTCHours() + d.getUTCMinutes() / 60;
};
const istDay = ms => new Date(ms + IST_MS).getUTCDay();   // 0 = Sunday
const istDate = ms => Math.floor((ms + IST_MS) / 86_400_000);

export function generateDemoReadings(deviceId = DEMO_DEVICE_ID, now = Date.now()) {
  const room = ROOMS[deviceId] ?? ROOMS[DEMO_DEVICE_ID];
  const rand = rng(room.seed);
  const end  = Math.floor(now / (STEP_MIN * 60_000)) * STEP_MIN * 60_000;
  const readings = [];

  // One set of choices per calendar day, so a habit lasts the whole evening.
  const habits = new Map();
  const habitFor = ms => {
    const key = istDate(ms);
    if (!habits.has(key)) {
      habits.set(key, {
        lights: rand() < room.lightsLeftOn,
        ac:     rand() < room.acLeftOn,
        early:  rand() < room.leaveEarly,
        shift:  (rand() - 0.5) * 0.8,
      });
    }
    return habits.get(key);
  };

  for (let t = end - DAYS * 86_400_000; t <= end; t += STEP_MIN * 60_000) {
    const h   = istHours(t);
    const dow = istDay(t);
    const habit = habitFor(t);
    const working = dow !== 0 && (dow !== 6 || h < 14);
    const open  = room.open + habit.shift;
    const close = (habit.early ? room.close - 2.5 : room.close) + habit.shift;
    const lunch = h >= 13 && h < 14;

    const occupied = working && h >= open && h < close && !(lunch && rand() < 0.6);
    const after    = working && h >= close;
    const lightsOn = occupied || (after && habit.lights && h < close + 3.5) || (!working && h >= 10 && h < 14 && habit.lights);
    const acOn     = (occupied && h >= open + 0.25) || (after && habit.ac && h < close + 3);

    // Outdoor daylight reaching the room, in lux, with some cloud.
    const sun = h > 6.5 && h < 18 ? Math.sin(((h - 6.5) / 11.5) * Math.PI) : 0;
    const daylight = sun * (480 + rand() * 300);
    const light = Math.round(daylight + (lightsOn ? 260 + rand() * 60 : rand() * 4));

    // Room temperature: held near the AC set point while it runs, otherwise follows the day.
    const outdoor = 21 + 8 * Math.max(0, Math.sin(((h - 8) / 14) * Math.PI)) + (rand() - 0.5);
    const temperature = acOn ? room.acTemp + (rand() - 0.5) * 0.9 : Math.max(22.5, outdoor + 1.2 + (rand() - 0.5));
    const humidity = Math.round(44 + (acOn ? -4 : 6) + 8 * Math.cos((h / 24) * 2 * Math.PI) + (rand() - 0.5) * 4);

    readings.push({
      device_id:   deviceId,
      timestamp:   new Date(t).toISOString(),
      temperature: Number(temperature.toFixed(1)),
      humidity,
      light,
      occupancy:   occupied,
    });
  }

  return readings;
}

// Settings a demo device would have, by default.
const demoSettings = { display_name: null, tariff_rate: null, latitude: null, longitude: null, monthly_kwh: null };

export function getDemoDevices() {
  const now = Date.now();
  return [
    {
      device_id:         DEMO_DEVICE_ID,
      owner_username:    'demo',
      installed_at:      new Date(now - 30 * 86400000).toISOString(),
      last_contacted_at: new Date(now - 600_000).toISOString(),
      ...demoSettings,
      display_name:      'Main office',
      monthly_kwh:       420,
    },
    {
      device_id:         DEMO_DEVICE_ID_2,
      owner_username:    'demo',
      installed_at:      new Date(now - 14 * 86400000).toISOString(),
      last_contacted_at: new Date(now - 900_000).toISOString(),
      ...demoSettings,
      display_name:      'Meeting room',
    },
  ];
}

// Smart plugs the demo units "found" on the Wi-Fi.
export function getDemoSmartDevices() {
  return [
    { mac: 'A4CF12000001', name: 'Ceiling lights', model: 'Shelly Plus 1',  role: 'light', managed: true, reachable: true },
    { mac: 'A4CF12000002', name: 'Split AC',       model: 'Shelly Plug S',  role: 'ac',    managed: true, reachable: true },
    { mac: 'A4CF12000003', name: 'Desk fan',       model: 'Tasmota plug',   role: 'fan',   managed: true, reachable: true },
  ];
}

export function getDemoProfile() {
  return {
    display_name: null,
    username:     'demo',
    latitude:     28.6139,
    longitude:    77.2090,
    tariff_rate:  10,
    api_key:      null,
  };
}

export function getDemoSubscription() {
  return {
    plan:            'enterprise',
    last_payment_at: null,
    next_payment_at: null,
    user_id:         'demo',
  };
}
