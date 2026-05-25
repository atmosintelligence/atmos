import { createClient } from '@/utils/supabase/server';
import { fetchUserReadings } from '@/lib/sheets';
import { prepareEnginePayload } from '@/lib/prepare';
import { runEngine } from '@/lib/engine/index.js';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });

    const body = await request.json();
    const { location, roomAreaM2 } = body;

    const raw = await fetchUserReadings(profile.username);
    if (!raw.length) return Response.json({ optimizations: [], environmental: null, readings: [] });

    const payload = prepareEnginePayload(raw, { location, roomAreaM2 });
    if (!payload) return Response.json({ optimizations: [], environmental: null, readings: raw });

    const result = await runEngine(payload);
    return Response.json({ ...result, readings: raw });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}