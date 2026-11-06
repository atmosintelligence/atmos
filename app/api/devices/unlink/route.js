import { resolveApiUser, unlinkDevice } from '@/lib/supabase';

export async function POST(request) {
  try {
    const resolved = await resolveApiUser(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { deviceId } = await request.json();
    if (!deviceId) return Response.json({ error: 'deviceId required' }, { status: 400 });

    await unlinkDevice(resolved.profile.username, deviceId);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
