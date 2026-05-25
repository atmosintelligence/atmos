import { createClient } from '@/utils/supabase/server';
import { runEngine }    from '@/lib/engine/index.js';
import { fetchUserReadings } from '@/lib/sheets';

export async function GET(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get('deviceId');

  let query = supabase
    .from('alerts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (deviceId) query = query.eq('device_id', deviceId);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ alerts: data });
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, latitude, longitude, tariff_rate')
    .eq('id', user.id)
    .single();

  const { data: prefs } = await supabase
    .from('alert_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const body     = await request.json();
  const deviceId = body.deviceId;

  const raw      = await fetchUserReadings(profile.username);
  const filtered = deviceId ? raw.filter(r => r.device_id === deviceId) : raw;
  if (!filtered.length) return Response.json({ synced: 0 });

  const result = await runEngine({
    readings:   filtered,
    location:   { lat: profile.latitude, lon: profile.longitude },
    roomAreaM2: body.roomAreaM2 ?? 20,
    tariff:     profile.tariff_rate ?? 10,
  });

  const now  = new Date();
  const hour = now.getHours();
  if (prefs?.quiet_hours_enabled) {
    const { quiet_hours_start: start, quiet_hours_end: end } = prefs;
    const inQuiet = start > end
      ? (hour >= start || hour < end)
      : (hour >= start && hour < end);
    if (inQuiet) return Response.json({ synced: 0, reason: 'quiet_hours' });
  }

  const { data: existing } = await supabase
    .from('alerts')
    .select('title, device_id, created_at')
    .eq('user_id', user.id)
    .eq('device_id', deviceId)
    .gte('created_at', new Date(Date.now() - 3600000).toISOString());

  const existingTitles = new Set((existing ?? []).map(a => a.title));

  const toInsert = result.optimizations
    .filter(opt => !existingTitles.has(opt.title))
    .map(opt => ({
      user_id:    user.id,
      device_id:  deviceId,
      group_name: opt.group,
      severity:   opt.severity,
      title:      opt.title,
      message:    opt.message,
      saving_inr: opt.saving?.inr ? parseFloat(opt.saving.inr) : null,
    }));

  if (!toInsert.length) return Response.json({ synced: 0 });

  const { error } = await supabase.from('alerts').insert(toInsert);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ synced: toInsert.length });
}