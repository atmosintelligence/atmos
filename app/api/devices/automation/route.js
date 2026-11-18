import { resolveApiUser, getAutomationConfig, updateAutomationConfig } from '@/lib/server/db';
import { buildConfig, cleanConfigPatch } from '@/lib/automation';

// Auto-off settings for one unit. The unit downloads them with its next reading.

// GET /api/devices/automation?deviceId=ATM-D001 → { config }
export async function GET(request) {
  try {
    const resolved = await resolveApiUser(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const deviceId = new URL(request.url).searchParams.get('deviceId');
    if (!deviceId) return Response.json({ error: 'deviceId required' }, { status: 400 });

    const stored = await getAutomationConfig(resolved.profile.username, deviceId);
    return Response.json({ config: buildConfig(stored) });
  } catch (err) {
    const status = /not found/i.test(err.message) ? 404 : 500;
    return Response.json({ error: err.message }, { status });
  }
}

// PATCH { deviceId, enabled?, light_min?, light_bright_min?, fan_min?, ac_min?, bright_lux? } → { config }
export async function PATCH(request) {
  try {
    const resolved = await resolveApiUser(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { deviceId, ...rest } = (await request.json().catch(() => null)) ?? {};
    if (!deviceId) return Response.json({ error: 'deviceId required' }, { status: 400 });

    const { value, error } = cleanConfigPatch(rest);
    if (error) return Response.json({ error }, { status: 400 });

    const saved = await updateAutomationConfig(resolved.profile.username, deviceId, value);
    return Response.json({ config: buildConfig(saved) });
  } catch (err) {
    const status = /not found/i.test(err.message) ? 404 : 500;
    return Response.json({ error: err.message }, { status });
  }
}
