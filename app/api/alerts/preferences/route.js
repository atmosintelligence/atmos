import { resolveApiUser, getAlertPreferences, saveAlertPreferences } from '@/lib/supabase';

export async function GET(request) {
  try {
    const resolved = await resolveApiUser(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const preferences = await getAlertPreferences(resolved.user.id);
    return Response.json({ preferences });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const resolved = await resolveApiUser(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    await saveAlertPreferences(resolved.user.id, await request.json());
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
