import { resolveApiUser } from '@/lib/apiAuth';
import { fetchUserReadings } from '@/lib/supabase-readings';
import { runEngine } from '@/lib/engine/index.js';
const engineCache = new Map();
const ENGINE_TTL  = 60_000;

export async function POST(request) {
  const resolved = await resolveApiUser(request);
  if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { profile } = resolved;
  const body        = await request.json();
  const deviceId    = body.deviceId;
  const cacheKey    = `${profile.username}:${deviceId}`;

  const cached = engineCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < ENGINE_TTL) {
    return Response.json(cached.data);
  }

  const raw      = await fetchUserReadings(profile.username);
  const filtered = deviceId ? raw.filter(r => r.device_id === deviceId) : raw;

  if (!filtered.length) return Response.json({
    optimizations: [], environmental: null,
    readings: [], analysis: null,
    outdoorWeather: null, weatherError: null,
  });

  const result = await runEngine({
    readings:   filtered,
    location:   { lat: profile.latitude, lon: profile.longitude },
    roomAreaM2: body.roomAreaM2 ?? 20,
    tariff:     profile.tariff_rate ?? 10,
  });

  const payload = { ...result, readings: filtered };
  engineCache.set(cacheKey, { ts: Date.now(), data: payload });

  return Response.json(payload);
}