import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DEFAULT_CONFIG = {
  enabled: true,
  light_min: 30,
  light_bright_min: 10,
  fan_min: 60,
  ac_min: 60,
  bright_lux: 300,
};

const LIMITS = {
  light_min: [1, 1440],
  light_bright_min: [0, 1440],
  fan_min: [1, 1440],
  ac_min: [1, 1440],
  bright_lux: [1, 65000],
};

const MAX_ACTIONS = 20;
const VALID_ACTIONS = new Set(['on', 'off']);

function buildConfig(stored) {
  const config = { ...DEFAULT_CONFIG };

  if (!stored || typeof stored !== 'object') return config;

  if (typeof stored.enabled === 'boolean') {
    config.enabled = stored.enabled;
  }

  for (const [key, [min, max]] of Object.entries(LIMITS)) {
    const value = stored[key];

    if (Number.isFinite(value) && value >= min && value <= max) {
      config[key] = value;
    }
  }

  return config;
}

function normalizeActions(raw, deviceId) {
  if (!Array.isArray(raw)) return [];

  const now = Date.now();

  return raw.slice(0, MAX_ACTIONS).flatMap((item) => {
    if (!item || typeof item !== 'object') return [];

    const target = String(item.device ?? '').slice(0, 32);
    const action = String(item.action ?? '').toLowerCase();

    if (!target || !VALID_ACTIONS.has(action)) return [];

    const agoSeconds =
      Number.isFinite(item.ago_s) && item.ago_s >= 0 ? item.ago_s : 0;

    return [
      {
        device_id: deviceId,
        target,
        action,
        reason: item.reason ? String(item.reason).slice(0, 64) : null,
        timestamp: new Date(now - agoSeconds * 1000).toISOString(),
      },
    ];
  });
}

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
      auto_actions,
    } = body;

    if (!private_key || !device_id) {
      return Response.json(
        { error: 'device_id and private_key are required' },
        { status: 400 }
      );
    }

    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('*')
      .eq('device_id', device_id)
      .eq('private_key', private_key)
      .maybeSingle();

    if (deviceError) {
      return Response.json(
        { error: deviceError.message },
        { status: 500 }
      );
    }

    if (!device) {
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

    const actions = normalizeActions(auto_actions, device_id);

    if (actions.length > 0) {
      const { error: logError } = await supabase
        .from('automation_logs')
        .insert(actions);

      if (logError) {
        console.error('automation_logs insert failed:', logError.message);
      }
    }

    await supabase
      .from('devices')
      .update({ last_contacted_at: new Date().toISOString() })
      .eq('device_id', device_id);

    return Response.json({
      ok: true,
      config: buildConfig(device.automation_config),
    });
  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
