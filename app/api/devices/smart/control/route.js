import { resolveApiUser, setSmartDeviceState } from '@/lib/server/db';

const MAC_RE = /^[0-9A-F]{12}$/;

// POST { deviceId, mac, state: 'on' | 'off' } → { device }
// Records the switch; the unit carries it out with its next reading.
export async function POST(request) {
  try {
    const resolved = await resolveApiUser(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { deviceId, mac, state } = (await request.json().catch(() => null)) ?? {};
    const cleanMac = typeof mac === 'string' ? mac.replace(/[^0-9a-f]/gi, '').toUpperCase() : '';
    if (!deviceId || !MAC_RE.test(cleanMac)) return Response.json({ error: 'deviceId and a valid mac are required' }, { status: 400 });
    if (state !== 'on' && state !== 'off') return Response.json({ error: 'state must be on or off' }, { status: 400 });

    const device = await setSmartDeviceState(resolved.profile.username, deviceId, cleanMac, state);
    return Response.json({ device });
  } catch (err) {
    const status = /not found/i.test(err.message) ? 404 : 500;
    return Response.json({ error: err.message }, { status });
  }
}
