import { resolveApiUser, acknowledgeAlerts } from '@/lib/supabase';

// POST { ids: [1, 2] }  or  { all: true, deviceId }
export async function POST(request) {
  try {
    const resolved = await resolveApiUser(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { ids, all, deviceId } = await request.json();
    await acknowledgeAlerts(resolved.user.id, { ids, all, deviceId });
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
