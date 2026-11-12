// Per-device settings. Pure helpers, safe to import from the browser and the server.
//
//   display_name  a name for the dashboard only; the device ID (ATM-D001) never changes
//   tariff_rate   ₹ per kWh for this device's savings; default: profile rate, then 10
//   latitude, longitude   where the device is, for outdoor weather; default: profile
//   monthly_kwh   the room's monthly electricity use, entered by the owner; default: the
//                 BEE benchmark for the room (see DEFAULT_MONTHLY_KWH)

import { TARIFF_DEFAULT, DEFAULT_MONTHLY_KWH } from '@/lib/engine/constants.js';

export const DEVICE_SETTING_LIMITS = {
  tariff:    { min: 0.5, max: 100 },
  monthlyKwh: { min: 1,  max: 100000 },
  name:      { max: 40 },
};

// The numbers a device really uses, falling back to account values and defaults.
export function resolveDeviceSettings(device, profile) {
  const pick = (own, fallback) => (own != null && own !== '' ? Number(own) : fallback);
  return {
    name:       device?.display_name?.trim() || device?.device_id || '',
    tariff:     pick(device?.tariff_rate, pick(profile?.tariff_rate, TARIFF_DEFAULT)),
    latitude:   pick(device?.latitude,  profile?.latitude  ?? null),
    longitude:  pick(device?.longitude, profile?.longitude ?? null),
    monthlyKwh: pick(device?.monthly_kwh, null),
    monthlyKwhDefault: DEFAULT_MONTHLY_KWH,
    // true when the owner has set the value for this device
    own: {
      tariff:     device?.tariff_rate != null,
      location:   device?.latitude != null && device?.longitude != null,
      monthlyKwh: device?.monthly_kwh != null,
    },
  };
}

export function deviceLabel(device) {
  return device?.display_name?.trim() || device?.device_id || '';
}

// Validates a settings form. Empty values clear the setting (back to the default).
// Returns { value } or { error }.
export function cleanDeviceSettings(input) {
  const body = input && typeof input === 'object' ? input : {};
  const out = {};

  if ('display_name' in body) {
    const name = typeof body.display_name === 'string' ? body.display_name.trim() : '';
    if (name.length > DEVICE_SETTING_LIMITS.name.max) {
      return { error: `Name can be at most ${DEVICE_SETTING_LIMITS.name.max} characters` };
    }
    out.display_name = name || null;
  }

  const number = (key, label, min, max) => {
    if (!(key in body)) return null;
    const raw = body[key];
    if (raw === null || raw === '') { out[key] = null; return null; }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < min || n > max) return `${label} must be between ${min} and ${max}`;
    out[key] = n;
    return null;
  };

  const { tariff, monthlyKwh } = DEVICE_SETTING_LIMITS;
  const problem =
    number('tariff_rate', 'Rate per kWh', tariff.min, tariff.max) ||
    number('monthly_kwh', 'Monthly usage', monthlyKwh.min, monthlyKwh.max) ||
    number('latitude',  'Latitude',  -90,  90) ||
    number('longitude', 'Longitude', -180, 180);
  if (problem) return { error: problem };

  if (('latitude' in out) && ('longitude' in out) && ((out.latitude === null) !== (out.longitude === null))) {
    return { error: 'Enter both latitude and longitude, or leave both empty' };
  }
  if (Object.keys(out).length === 0) return { error: 'Nothing to save' };
  return { value: out };
}
