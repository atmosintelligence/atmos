const BASE = 'https://api.open-meteo.com/v1/forecast';

const WMO_RAIN = new Set([51,53,55,61,63,65,66,67,71,73,75,77,80,81,82,85,86,95,96,99]);

const CACHE_MS = 10 * 60_000;
const cache = new Map();   // "lat,lon" -> { at, value }

// Coordinates are rounded to 2 decimals (about 1 km) before they leave the server, so the
// exact location of a room is never sent to the weather service. Results are cached for
// 10 minutes per rounded location.
export async function getOutdoorWeather(lat, lon) {
  if (lat == null || lon == null) throw new Error('No location set');

  const rLat = Number(lat).toFixed(2);
  const rLon = Number(lon).toFixed(2);
  if (!Number.isFinite(Number(rLat)) || !Number.isFinite(Number(rLon))) throw new Error('Invalid location');

  const key = `${rLat},${rLon}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;

  const url = `${BASE}?latitude=${rLat}&longitude=${rLon}&current=temperature_2m,weathercode,relative_humidity_2m`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error('Weather API request failed');

  const { current } = await res.json();
  if (!current || !Number.isFinite(current.temperature_2m)) throw new Error('Weather API returned no data');

  const value = {
    temp:      current.temperature_2m,
    humidity:  current.relative_humidity_2m ?? null,
    condition: WMO_RAIN.has(current.weathercode) ? 'Rain' : 'Clear',
    code:      current.weathercode,
  };

  cache.set(key, { at: Date.now(), value });
  return value;
}
