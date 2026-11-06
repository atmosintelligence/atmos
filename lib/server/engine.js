import { fetchUserReadings } from '@/lib/supabase';
import { runEngine } from '@/lib/engine/index.js';

const cache = new Map();
const TTL = 60_000;

export function getEngine({ profile, deviceId, roomAreaM2 = 20, thresholdOverrides = {} }) {
  const key = [
    profile.username,
    deviceId ?? 'all',
    roomAreaM2,
    profile.tariff_rate ?? 10,
    JSON.stringify(thresholdOverrides),
  ].join(':');

  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < TTL) return hit.promise;

  const promise = (async () => {
    const raw = await fetchUserReadings(profile.username);
    const readings = deviceId ? raw.filter(r => r.device_id === deviceId) : raw;

    if (!readings.length) {
      return {
        optimizations: [],
        environmental: null,
        analysis: null,
        outdoorWeather: null,
        weatherError: null,
        readings: [],
      };
    }

    const result = await runEngine({
      readings,
      location: { lat: profile.latitude, lon: profile.longitude },
      roomAreaM2,
      tariff: profile.tariff_rate ?? 10,
      thresholdOverrides,
    });

    return { ...result, readings };
  })();

  cache.set(key, { ts: Date.now(), promise });
  promise.catch(() => cache.delete(key));
  return promise;
}
