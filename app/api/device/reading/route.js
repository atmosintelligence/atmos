import { getDeviceByCredentials, insertReading, touchDevice, logAutomationActions } from '@/lib/server/db';
import { buildConfig, normalizeActions } from '@/lib/automation';

// The Atmos unit posts here every 10 minutes (30 s retries).
//
// Stored:   temperature, humidity, light, occupancy (readings) and auto_actions (automation_logs).
// Ignored:  power, current, voltage, energy. The current firmware simulates these, so they
//           are not saved. appliance_power and appliance_energy are only stored when a sender
//           names them exactly (smart appliances).
// Reply:    { ok, config }. config holds the auto-off timers set on the dashboard.
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

    return Response.json({ ok: true, config: buildConfig(device.automation_config) });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
