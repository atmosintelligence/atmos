export const MAX_SMART_DEVICES = 8;

const PROTOCOLS    = ['tasmota', 'shelly_gen1', 'shelly_gen2'];
const ROLES        = ['light', 'fan', 'ac', 'board', 'unassigned'];
const POWER_STATES = ['on', 'off', 'unknown'];
const MAC_RE       = /^[0-9A-F]{12}$/;

const str = (v, field, max) => {
  if (v == null) return null;
  if (typeof v !== 'string') throw new Error(`${field} must be text`);
  return v.trim().slice(0, max) || null;
};

const bool = (v, field, fallback) => {
  if (v == null) return fallback;
  if (typeof v !== 'boolean') throw new Error(`${field} must be true or false`);
  return v;
};

const oneOf = (v, field, list, fallback) => {
  if (v == null) return fallback;
  if (!list.includes(v)) throw new Error(`${field} must be one of ${list.join(', ')}`);
  return v;
};

const int = (v, field, min, max, fallback = null) => {
  if (v == null) return fallback;
  if (!Number.isInteger(v) || v < min || v > max) {
    throw new Error(`${field} must be a whole number from ${min} to ${max}`);
  }
  return v;
};

const num = (v, field, min, max) => {
  if (v == null) return null;
  if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max) {
    throw new Error(`${field} must be a number from ${min} to ${max}`);
  }
  return v;
};

function cleanDevice(d, i, scanAt) {
  const f = name => `devices[${i}].${name}`;
  if (!d || typeof d !== 'object' || Array.isArray(d)) throw new Error(`${f('')}`.replace(/\.$/, ' must be an object'));

  if (typeof d.mac !== 'string') throw new Error(`${f('mac')} is required`);
  const mac = d.mac.replace(/[^0-9a-f]/gi, '').toUpperCase();
  if (!MAC_RE.test(mac)) throw new Error(`${f('mac')} must be 12 hex characters`);

  const hasMetering = bool(d.has_metering, f('has_metering'), false);
  const ago = int(d.last_command_ago_s, f('last_command_ago_s'), 0, 31_536_000);

  return {
    mac,
    ip:              str(d.ip, f('ip'), 45),
    protocol:        oneOf(d.protocol, f('protocol'), PROTOCOLS, null),
    model:           str(d.model, f('model'), 64),
    firmware:        str(d.firmware, f('firmware'), 32),
    name:            str(d.name, f('name'), 64),
    role:            oneOf(d.role, f('role'), ROLES, 'unassigned'),
    managed:         bool(d.managed, f('managed'), true),
    controllable:    bool(d.controllable, f('controllable'), true),
    auth_required:   bool(d.auth_required, f('auth_required'), false),
    power_state:     oneOf(d.power_state, f('power_state'), POWER_STATES, 'unknown'),
    reachable:       bool(d.reachable, f('reachable'), true),
    fail_count:      int(d.fail_count, f('fail_count'), 0, 1_000_000, 0),
    last_command:    str(d.last_command, f('last_command'), 16),
    last_command_ok: bool(d.last_command_ok, f('last_command_ok'), null),
    last_command_at: ago == null ? null : new Date(scanAt.getTime() - ago * 1000).toISOString(),
    has_metering:    hasMetering,
    power_w:         hasMetering ? num(d.power_w, f('power_w'), 0, 100_000) : null,
    voltage_v:       hasMetering ? num(d.voltage_v, f('voltage_v'), 0, 500) : null,
    current_a:       hasMetering ? num(d.current_a, f('current_a'), 0, 1000) : null,
    energy_kwh:      hasMetering ? num(d.energy_kwh, f('energy_kwh'), 0, 10_000_000) : null,
    rssi:            int(d.rssi, f('rssi'), -127, 0),
  };
}

export function cleanSnapshot(body) {
  try {
    const scanAgo = int(body.scan_ago_s, 'scan_ago_s', 0, 86_400, 0);
    bool(body.scan_complete, 'scan_complete', false);
    str(body.unit_ip, 'unit_ip', 45);
    int(body.wifi_rssi, 'wifi_rssi', -127, 0);

    if (!Array.isArray(body.devices)) throw new Error('devices must be a list');
    if (body.devices.length > MAX_SMART_DEVICES) {
      throw new Error(`devices can hold at most ${MAX_SMART_DEVICES} entries`);
    }

    const scanAt = new Date(Date.now() - scanAgo * 1000);
    const byMac  = new Map();
    body.devices.forEach((d, i) => {
      const clean = cleanDevice(d, i, scanAt);
      byMac.set(clean.mac, clean);
    });

    return { value: { scanAt, devices: [...byMac.values()] } };
  } catch (err) {
    return { error: err.message };
  }
}
