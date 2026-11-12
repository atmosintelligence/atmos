import { resolveApiUser, updateDeviceSettings } from '@/lib/supabase';
import { cleanDeviceSettings } from '@/lib/deviceSettings';
import { clearEngineCache } from '@/lib/server/engine';

// PATCH { deviceId, display_name?, tariff_rate?, latitude?, longitude?, monthly_kwh? } → { device }
export async function PATCH(request) {
  try {
    const resolved = await resolveApiUser(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { deviceId, ...settings } = await request.json();
    if (!deviceId) return Response.json({ error: 'deviceId required' }, { status: 400 });

    const { value, error } = cleanDeviceSettings(settings);
    if (error) return Response.json({ error }, { status: 400 });

    const device = await updateDeviceSettings(resolved.profile.username, deviceId, value);
    clearEngineCache(resolved.profile.username);
    return Response.json({ device });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
