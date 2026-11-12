import { fetchUserReadings, getDevices } from '@/lib/supabase';
import { runEngine } from '@/lib/engine/index.js';
import { resolveDeviceSettings } from '@/lib/deviceSettings';

const cache = new Map();
const TTL = 60_000;

// Runs the engine for one device (or all of the user's devices when deviceId is omitted).
// Tariff, location and monthly usage come from the device's own settings, falling back to
// the account's values and then the defaults.
export function getEngine({ profile, deviceId, roomAreaM2 = 20, thresholdOverrides = {} }) {
  const key = [
    profile.username,
    deviceId ?? 'all',
    roomAreaM2,
    profile.tariff_rate ?? 10,
    profile.latitude ?? '',
    profile.longitude ?? '',
    JSON.stringify(thresholdOverrides),
  ].join(':');

  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < TTL) return hit.promise;

  const promise = (async () => {
    const [raw, devices] = await Promise.all([
      fetchUserReadings(profile.username),
      getDevices(profile.username).catch(() => []),
    ]);
    const readings = deviceId ? raw.filter(r => r.device_id === deviceId) : raw;
    const device   = devices.find(d => d.device_id === deviceId) ?? null;
    const settings = resolveDeviceSettings(device, profile);

    if (!readings.length) {
      return {
        optimizations: [],
        environmental: null,
        analysis: null,
        outdoorWeather: null,
        weatherError: null,
        readings: [],
        settings,
      };
    }

    const result = await runEngine({
      readings,
      location: { lat: settings.latitude, lon: settings.longitude },
      roomAreaM2,
      tariff: settings.tariff,
      monthlyKwh: settings.monthlyKwh,
      thresholdOverrides,
    });

    return { ...result, readings, settings };
  })();

  cache.set(key, { ts: Date.now(), promise });
  promise.catch(() => cache.delete(key));
  return promise;
}

// Call after a device's settings or ownership change, so the next request recomputes.
export function clearEngineCache(username) {
  for (const key of cache.keys()) if (key.startsWith(`${username}:`)) cache.delete(key);
}
