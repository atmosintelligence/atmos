import { resolveApiUser, getSmartDevices } from '@/lib/supabase';

// GET /api/devices/smart?deviceId=ATM-D001 → { smartDevices } the plugs that unit has found
export async function GET(request) {
  try {
    const resolved = await resolveApiUser(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const deviceId = new URL(request.url).searchParams.get('deviceId');
    if (!deviceId) return Response.json({ error: 'deviceId required' }, { status: 400 });

    const smartDevices = await getSmartDevices(resolved.profile.username, deviceId);
    return Response.json({ smartDevices });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
