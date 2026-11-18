import { getDeviceByCredentials, insertReading, touchDevice, logAutomationActions, getDeviceSchedules, getPendingCommands } from '@/lib/server/db';
import { buildConfig, normalizeActions } from '@/lib/automation';
import { toDevicePayload } from '@/lib/schedules';

export async function POST(request) {
  try {
    const body = await request.json();
    const { private_key, device_id, auto_actions, ...reading } = body;

    if (!private_key || !device_id) {
      return Response.json({ error: 'device_id and private_key are required' }, { status: 400 });
    }

    const device = await getDeviceByCredentials(device_id, private_key);
    if (!device) {
      return Response.json({ error: 'Invalid device_id or private_key' }, { status: 401 });
    }

    await insertReading(device_id, reading);
    await logAutomationActions(normalizeActions(auto_actions, device_id));
    await touchDevice(device_id);

    // A lookup failure must never lose the reading that was just saved.
    const [schedules, commands] = await Promise.all([
      getDeviceSchedules(device_id).catch(() => []),
      getPendingCommands(device_id).catch(() => []),
    ]);

    return Response.json({
      ok: true,
      config: buildConfig(device.automation_config),
      schedules: toDevicePayload(schedules),
      // Manual switches from the dashboard: [{ mac, action: 'on' | 'off' }]
      commands,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
