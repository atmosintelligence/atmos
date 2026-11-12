// The one place the dashboard calls the engine.
//   Demo mode:  sends the demo readings to /api/engine/demo
//   Real mode:  asks /api/engine to run on the signed-in user's readings (rate, location and
//               monthly usage come from the device's own settings)
// Returns the engine result: { optimizations, environmental, analysis, readings, weatherError, ... }

const DEMO_LOCATION = { lat: 28.6139, lon: 77.2090 };

function post(url, body) {
  return fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
}

export async function fetchEngine({ isDemo, readings, deviceId, roomAreaM2 = 20, settings = null }) {
  const res = isDemo
    ? await post('/api/engine/demo', {
        readings,
        location:   settings?.latitude != null ? { lat: settings.latitude, lon: settings.longitude } : DEMO_LOCATION,
        roomAreaM2,
        tariff:     settings?.tariff ?? 10,
        monthlyKwh: settings?.monthlyKwh ?? null,
      })
    : await post('/api/engine', { deviceId, roomAreaM2 });

  if (!res.ok) throw new Error(`Engine request failed (${res.status})`);
  return res.json();
}
