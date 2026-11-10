import { getDeviceByCredentials, touchDevice, syncSmartDevices } from '@/lib/supabase';
import { cleanSnapshot } from '@/lib/smartDevices';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { private_key, device_id } = body;
    if (typeof private_key !== 'string' || typeof device_id !== 'string' || !private_key || !device_id) {
      return Response.json({ error: 'device_id and private_key are required' }, { status: 400 });
    }

    const device = await getDeviceByCredentials(device_id, private_key);
    if (!device) {
      return Response.json({ error: 'Invalid device_id or private_key' }, { status: 401 });
    }

    const { value, error } = cleanSnapshot(body);
    if (error) return Response.json({ error }, { status: 400 });

    const devices = await syncSmartDevices(device_id, value.devices, value.scanAt);
    await touchDevice(device_id);

    return Response.json({ ok: true, devices });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
