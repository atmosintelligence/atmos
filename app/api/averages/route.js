import { fetchUserReadings } from '@/lib/sheets';

const CACHE_DURATION = 5 * 60 * 1000;
let cached = null;
let lastFetched = 0;

export async function GET() {
  const now = Date.now();
  if (cached && now - lastFetched < CACHE_DURATION) {
    return Response.json(cached);
  }

  try {
    const devRes  = await fetch(`${process.env.SHEETS_API_URL}?username=all&sheet=Devices`, { redirect: 'follow' });
    const devText = await devRes.text();
    let allDevices = [];
    try { allDevices = JSON.parse(devText).data ?? []; } catch (_) {}

    const usernames = [...new Set(allDevices.map(d => d.owner_username).filter(Boolean))];

    let allReadings = [];
    for (const username of usernames) {
      try {
        const readings = await fetchUserReadings(username);
        allReadings = allReadings.concat(readings);
      } catch (_) {}
    }

    const oneYearAgo = Date.now() - 365 * 24 * 3600 * 1000;
    const recent = allReadings.filter(r => new Date(r.timestamp).getTime() > oneYearAgo);

    if (!recent.length) {
      return Response.json({ temperature: null, humidity: null, power: null, light: null });
    }

    function avg(key) {
      const vals = recent.map(r => parseFloat(r[key])).filter(v => !isNaN(v));
      return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
    }

    const data = {
      temperature: avg('temperature'),
      humidity:    avg('humidity'),
      power:       avg('power'),
      light:       avg('light'),
    };

    cached = data;
    lastFetched = now;
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}