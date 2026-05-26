export const DEMO_DEVICE_ID = 'ATM-DEMO';

export const DEMO_PLAN = {
  plan:            'enterprise',
  label:           'Enterprise',
  last_payment_at: null,
  next_payment_at: null,
};

export function generateDemoReadings(rawEntries) {
  const now        = new Date();
  const yesterday  = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const readings = [];
  let entryIndex = 0;

  for (let week = 3; week >= 0; week--) {
    for (let day = 6; day >= 0; day--) {
      for (let slot = 0; slot < 6; slot++) {
        if (entryIndex >= rawEntries.length) break;

        const base = new Date(yesterday);
        base.setDate(base.getDate() - (week * 7 + day));
        base.setHours(19, slot * 10, 0, 0);

        const entry = rawEntries[entryIndex++];
        readings.push({
          ...entry,
          device_id: DEMO_DEVICE_ID,
          timestamp: base.toISOString(),
          occupancy: entry.occupancy === true || entry.occupancy === 'true',
        });
      }
    }
  }

  return readings.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
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

export function getDemoDevices() {
  return [{
    device_id:         DEMO_DEVICE_ID,
    owner_username:    'demo',
    installed_at:      new Date(Date.now() - 30 * 86400000).toISOString(),
    last_contacted_at: new Date(Date.now() - 86400000).toISOString(),
  }];
}