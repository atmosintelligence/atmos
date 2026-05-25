import { createClient }        from '@/utils/supabase/server';
import { fetchUserReadings }   from '@/lib/sheets';
import { prepareEnginePayload } from '@/lib/prepare';
import { runEngine }           from '@/lib/engine/index.js';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, latitude, longitude, tariff_rate')
      .eq('id', user.id)
      .single();

    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });

    const body = await request.json();
    const { roomAreaM2, deviceId } = body;

    const raw      = await fetchUserReadings(profile.username);
    const filtered = deviceId ? raw.filter(r => r.device_id === deviceId) : raw;

    if (!filtered.length) return Response.json({
      optimizations: [], environmental: null, readings: [],
      analysis: null, outdoorWeather: null, weatherError: null,
    });

    const result = await runEngine({
      readings:   filtered,
      location:   { lat: profile.latitude, lon: profile.longitude },
      roomAreaM2: roomAreaM2 ?? 20,
      tariff:     profile.tariff_rate ?? 10,
    });

    return Response.json({ ...result, readings: filtered });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}