import { resolveApiUser, getSmartDevices, getAutoSwitchedRoles } from '@/lib/server/db';

// GET /api/devices/smart?deviceId=ATM-D001
// → { smartDevices, autoRoles }: plugs the unit has listed, and the kinds of appliance
//   ('light', 'fan', 'ac') it has switched off by itself in the last 7 days.
export async function GET(request) {
  try {
    const resolved = await resolveApiUser(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const deviceId = new URL(request.url).searchParams.get('deviceId');
    if (!deviceId) return Response.json({ error: 'deviceId required' }, { status: 400 });

    const smartDevices = await getSmartDevices(resolved.profile.username, deviceId);
    const autoRoles    = await getAutoSwitchedRoles(deviceId);
    return Response.json({ smartDevices, autoRoles });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
