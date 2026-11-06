// Pure helpers for the sensor's automation settings and action log.
// No database access here; see lib/supabase.js for that.

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

    const target = String(item.device ?? '').slice(0, 32);
    const action = String(item.action ?? '').toLowerCase();
    if (!target || !VALID_ACTIONS.has(action)) return [];

    const agoSeconds = Number.isFinite(item.ago_s) && item.ago_s >= 0 ? item.ago_s : 0;

    return [{
      device_id: deviceId,
      target,
      action,
      reason:    item.reason ? String(item.reason).slice(0, 64) : null,
      timestamp: new Date(now - agoSeconds * 1000).toISOString(),
    }];
  });
}
