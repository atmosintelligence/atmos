export async function fetchEngine({ isDemo, demoReadings, deviceId, location, roomAreaM2 }) {
  if (isDemo) {
    const res = await fetch('/api/engine/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        readings:   demoReadings,
        location:   location ?? { lat: 28.6139, lon: 77.2090 },
        roomAreaM2: roomAreaM2 ?? 20,
        tariff:     10,
      }),
    });
    return res;
  }
  return fetch('/api/engine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location, roomAreaM2, deviceId }),
  });
}