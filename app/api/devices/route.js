import { resolveApiUser, getDevices } from '@/lib/supabase';

export async function GET(request) {
  try {
    const resolved = await resolveApiUser(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const devices = await getDevices(resolved.profile.username);
    return Response.json({ devices });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
