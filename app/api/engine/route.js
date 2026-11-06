import { resolveApiUser } from '@/lib/apiAuth';
import { getEngine } from '@/lib/server/engine';

export async function POST(request) {
  try {
    const resolved = await resolveApiUser(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { roomAreaM2, deviceId } = await request.json();
    const result = await getEngine({ profile: resolved.profile, deviceId, roomAreaM2 });

    return Response.json(result);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
