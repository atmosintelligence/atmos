const BASE = 'https://api.open-meteo.com/v1/forecast';

const WMO_RAIN = new Set([51,53,55,61,63,65,66,67,71,73,75,77,80,81,82,85,86,95,96,99]);

export async function getOutdoorWeather(lat, lon) {
  if (!lat || !lon) throw new Error('No location set');
  const url = `${BASE}?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,relative_humidity_2m`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error('Weather API request failed');
  const data = await res.json();
  const current = data.current;
  return {
    temp:      current.temperature_2m,
    humidity:  current.relative_humidity_2m,
    condition: WMO_RAIN.has(current.weathercode) ? 'Rain' : 'Clear',
    code:      current.weathercode,
  };
}