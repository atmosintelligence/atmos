import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      private_key,
      device_id,
      power,
      current,
      energy,
      voltage,
      temperature,
      humidity,
      light,
      occupancy,
      timestamp,
    } = body;

    if (!private_key || !device_id) {
      return Response.json(
        { error: 'device_id and private_key are required' },
        { status: 400 }
      );
    }

    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id, device_id')
      .eq('device_id', device_id)
      .eq('private_key', private_key)
      .maybeSingle();

    if (deviceError || !device) {
      return Response.json(
        { error: 'Invalid device_id or private_key' },
        { status: 401 }
      );
    }

    const { error: insertError } = await supabase
      .from('readings')
      .insert({
        device_id,
        timestamp:   timestamp ?? new Date().toISOString(),
        power:       power       ?? null,
        current:     current     ?? null,
        energy:      energy      ?? null,
        voltage:     voltage     ?? null,
        temperature: temperature ?? null,
        humidity:    humidity    ?? null,
        light:       light       ?? null,
        occupancy:   occupancy   ?? null,
      });

    if (insertError) {
      return Response.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    await supabase
      .from('devices')
      .update({ last_contacted_at: new Date().toISOString() })
      .eq('device_id', device_id);

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
