import { resolveApiUser, getAlerts } from '@/lib/supabase';
import { syncAlerts } from '@/lib/alerts';

// GET /api/alerts?deviceId=ATM-001  → alert log
export async function GET(request) {
  try {
    const resolved = await resolveApiUser(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const deviceId = new URL(request.url).searchParams.get('deviceId');
    const alerts   = await getAlerts(resolved.user.id, deviceId);
    return Response.json({ alerts });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/alerts  { deviceId, roomAreaM2 }  → generate new alerts
export async function POST(request) {
  try {
    const resolved = await resolveApiUser(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { deviceId, roomAreaM2 } = await request.json();
    if (!deviceId) return Response.json({ error: 'deviceId required' }, { status: 400 });

    const result = await syncAlerts({
      userId: resolved.user.id,
      profile: resolved.profile,
      deviceId,
      roomAreaM2,
    });
    return Response.json(result);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
