import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const readingsCache = new Map();
const READINGS_TTL  = 60_000;

export async function fetchUserReadings(username) {
  const cached = readingsCache.get(username);
  if (cached && Date.now() - cached.ts < READINGS_TTL) return cached.data;

  const { data: devices, error: devErr } = await supabase
    .from('devices')
    .select('device_id')
    .eq('owner_username', username);

  if (devErr || !devices?.length) return [];

  const deviceIds = devices.map(d => d.device_id);

  const { data, error } = await supabase
    .from('readings')
    .select('device_id, timestamp, power, current, energy, voltage, temperature, humidity, light, occupancy')
    .in('device_id', deviceIds)
    .order('timestamp', { ascending: false })
    .limit(500);

  if (error) throw new Error(error.message);

  const readings = (data ?? []).map(r => ({
    device_id:   r.device_id,
    timestamp:   r.timestamp,
    power:       r.power,
    current:     r.current,
    energy:      r.energy,
    voltage:     r.voltage,
    temperature: r.temperature,
    humidity:    r.humidity,
    light:       r.light,
    occupancy:   r.occupancy,
  }));

  readingsCache.set(username, { ts: Date.now(), data: readings });
  return readings;
}

export async function fetchUserDevices(username) {
  const { data, error } = await supabase
    .from('devices')
    .select('device_id, owner_username, installed_at, last_contacted_at')
    .eq('owner_username', username);

  if (error) throw new Error(error.message);
  return data ?? [];
}
