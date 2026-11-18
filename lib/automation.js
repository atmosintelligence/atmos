// Pure helpers for the sensor's automation settings and action log.
// No database access here; see lib/server/db.js for that.

export const DEFAULT_CONFIG = {
  enabled: true,
  light_min: 30,
  light_bright_min: 10,
  fan_min: 60,
  ac_min: 60,
  bright_lux: 300,
};

const LIMITS = {
  light_min:        [1, 1440],
  light_bright_min: [0, 1440],
  fan_min:          [1, 1440],
  ac_min:           [1, 1440],
  bright_lux:       [1, 65000],
};

const MAX_ACTIONS   = 20;
const VALID_ACTIONS = new Set(['on', 'off']);

// The unit names each device "<role>_<last part of its IP>", e.g. "light_23".
const ROLE_FROM_NAME = /^(light|fan|ac)(?:_|$)/i;

// Reasons the unit gives for an automatic switch-off.
const REASON_TEXT = {
  vacant:        'Room empty',
  vacant_bright: 'Room empty and already bright',
};

// Cleans a change to the auto-off settings from the dashboard. Returns { value } or { error }.
export function cleanConfigPatch(input) {
  const body = input && typeof input === 'object' ? input : {};
  const out = {};
  if ('enabled' in body) {
    if (typeof body.enabled !== 'boolean') return { error: 'enabled must be true or false' };
    out.enabled = body.enabled;
  }
  for (const [key, [min, max]] of Object.entries(LIMITS)) {
    if (!(key in body)) continue;
    const value = Number(body[key]);
    if (!Number.isInteger(value) || value < min || value > max) return { error: `${key} must be a whole number from ${min} to ${max}` };
    out[key] = value;
  }
  if (!Object.keys(out).length) return { error: 'Nothing to save' };
  return { value: out };
}

// Merges a device's stored settings over the defaults, ignoring bad values.
export function buildConfig(stored) {
  const config = { ...DEFAULT_CONFIG };
  if (!stored || typeof stored !== 'object') return config;

  if (typeof stored.enabled === 'boolean') config.enabled = stored.enabled;

  for (const [key, [min, max]] of Object.entries(LIMITS)) {
    const value = stored[key];
    if (Number.isFinite(value) && value >= min && value <= max) config[key] = value;
  }
  return config;
}

// Cleans the sensor's auto_actions into rows for the automation_logs table.
export function normalizeActions(raw, deviceId) {
  if (!Array.isArray(raw)) return [];
  const now = Date.now();

  return raw.slice(0, MAX_ACTIONS).flatMap(item => {
    if (!item || typeof item !== 'object') return [];

    const name   = String(item.device ?? '').slice(0, 32);
    const action = String(item.action ?? '').toLowerCase();
    if (!name || !VALID_ACTIONS.has(action)) return [];

    // Stored as the kind of appliance (light, fan, ac), like schedules, with the unit's own
    // device name kept in the reason.
    const role   = name.match(ROLE_FROM_NAME)?.[1].toLowerCase();
    const why    = item.reason ? REASON_TEXT[item.reason] ?? String(item.reason) : null;
    const reason = role && role !== name.toLowerCase() ? [why, name].filter(Boolean).join(' · ') : why;

    const agoSeconds = Number.isFinite(item.ago_s) && item.ago_s >= 0 ? item.ago_s : 0;

    return [{
      device_id: deviceId,
      target:    role ?? name,
      action,
      reason:    reason ? reason.slice(0, 64) : null,
      timestamp: new Date(now - agoSeconds * 1000).toISOString(),
    }];
  });
}
