// Every database query in Atmos lives in this one file, and it only ever runs on the server.
//
// The browser never reads or writes a table. Pages call our API routes, the routes check who
// is asking (resolveApiUser), and then call the functions below with that account's id or
// username, which every query filters by.
//
// If the database schema changes, the table and column lists in SCHEMA are the first (and
// usually the only) place to update.

import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ── Schema: table names and the columns each query reads ──

export const SCHEMA = {
  tables: {
    profiles:      'profiles',
    subscriptions: 'subscriptions',
    devices:       'devices',
    readings:      'readings',
    smartDevices:  'smart_devices',
    schedules:     'automation_schedules',
    automationLog: 'automation_logs',
    alerts:        'alerts',
    alertPrefs:    'alert_preferences',
  },
  columns: {
    // What the dashboard may see about the account. The API key itself is never sent back.
    profile:         'id, username, display_name, latitude, longitude, optimization_mode',
    profileEditable: ['display_name', 'latitude', 'longitude', 'optimization_mode'],
    subscription:    'plan, last_payment_at, next_payment_at',
    device:          'device_id, owner_username, installed_at, last_contacted_at',
    deviceSettings:  'display_name, tariff_rate, latitude, longitude, monthly_kwh',
    // The unit reports these. appliance_power (W) and appliance_energy (kWh) come from smart appliances.
    reading:         'device_id, timestamp, temperature, humidity, light, occupancy, appliance_power, appliance_energy',
    readingBasic:    'device_id, timestamp, temperature, humidity, light, occupancy',
    smartDevice:     'mac, name, model, role, role_override, managed, controllable, reachable, power_state, power_w, has_metering, rssi, last_seen_at, last_command, last_command_ok, last_command_at, desired_state, desired_at',
    smartDeviceBasic:'mac, name, model, role, role_override, managed, reachable, last_seen_at',
    schedule:        'id, device_id, target, action, days, time, tz, source, reason, enabled, created_at',
    scheduleDevice:  'id, target, action, days, time, tz, enabled',
    automationLog:   'target, action, reason, timestamp',
  },
  rpc: {
    emailForUsername: 'get_email_for_username',
    deleteUser:       'delete_user',
  },
};

const T = SCHEMA.tables;
const C = SCHEMA.columns;

export const PLANS = ['spark', 'basic', 'premium', 'enterprise'];
export const OPTIMIZATION_MODES = ['ai', 'rule'];

// How long a manual on/off from the dashboard waits for the unit before it is dropped.
const COMMAND_TTL_MS = 15 * 60_000;

// ── Clients ──

// The signed-in user's own session (from cookies). Used for auth, never for table reads.
export async function getServerClient() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, ANON_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {}
      },
    },
  });
}

let adminClient = null;
function admin() {
  if (!adminClient) adminClient = createSupabaseClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  return adminClient;
}

const fail = error => { if (error) throw new Error(error.message); };
const isMissingColumn = error => error && (error.code === '42703' || /column .* does not exist/i.test(error.message));

// ── Auth and the current account ──

export async function getSessionUser() {
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}

// API routes: accepts a "Bearer atmos_..." key or the logged-in session.
// Returns { user, profile, via } or null. profile.plan comes from the subscription.
export async function resolveApiUser(request, { sessionOnly = false } = {}) {
  const header = request.headers.get('Authorization');
  let user = null;
  let via  = 'session';

  if (header?.startsWith('Bearer ')) {
    if (sessionOnly) return null;
    const { data } = await admin().from(T.profiles).select('id').eq('api_key', header.slice(7)).maybeSingle();
    if (!data) return null;
    user = { id: data.id };
    via  = 'api_key';
  } else {
    user = await getSessionUser();
    if (!user) return null;
  }

  const profile = await getProfile(user.id);
  return profile ? { user, profile, via } : null;
}

// Login: finds the email for a username (the person is not signed in yet).
export async function getEmailForUsername(username) {
  if (typeof username !== 'string' || !username.trim()) return null;
  const { data } = await admin().rpc(SCHEMA.rpc.emailForUsername, { p_username: username.trim() });
  return data ?? null;
}

export async function exchangeCodeForSession(code) {
  const supabase = await getServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return { error };
}

// Runs as the signed-in user, so the database function knows whose account to delete.
export async function deleteOwnAccount() {
  const supabase = await getServerClient();
  const { error } = await supabase.rpc(SCHEMA.rpc.deleteUser);
  fail(error);
  await supabase.auth.signOut();
}

// Refreshes the Supabase login cookie on every request (proxy.js).
export async function updateSession(request) {
  const { NextResponse } = await import('next/server');
  let response = NextResponse.next({ request });
  if (!SUPABASE_URL || !ANON_KEY) return response;

  const supabase = createServerClient(SUPABASE_URL, ANON_KEY, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  await supabase.auth.getUser().catch(() => null);
  return response;
}

// ── Profile ──

export async function getProfile(userId) {
  const [first, subscription] = await Promise.all([
    admin().from(T.profiles).select(C.profile).eq('id', userId).maybeSingle(),
    getSubscription(userId).catch(() => null),
  ]);
  let profile = first.data;
  // A column renamed or not added yet should never lock the person out.
  if (isMissingColumn(first.error)) {
    const { data } = await admin().from(T.profiles).select('*').eq('id', userId).maybeSingle();
    if (data) {
      const { api_key, ...rest } = data;
      profile = rest;
    }
  }
  if (!profile) return null;
  return { ...profile, plan: subscription?.plan ?? 'spark' };
}

// Only the columns in SCHEMA.columns.profileEditable can be changed, and only to valid values.
export function cleanProfilePatch(input) {
  const body = input && typeof input === 'object' ? input : {};
  const out = {};
  for (const key of C.profileEditable) {
    if (!(key in body)) continue;
    const v = body[key];
    if (key === 'display_name') {
      const name = typeof v === 'string' ? v.trim() : '';
      if (!name || name.length > 60) return { error: 'Name must be 1 to 60 characters' };
      out.display_name = name;
    } else if (key === 'optimization_mode') {
      if (!OPTIMIZATION_MODES.includes(v)) return { error: 'Recommendation style must be ai or rule' };
      out.optimization_mode = v;
    } else {
      const n = v === null || v === '' ? null : Number(v);
      const limit = key === 'latitude' ? 90 : 180;
      if (n !== null && (!Number.isFinite(n) || Math.abs(n) > limit)) return { error: `${key} is out of range` };
      out[key] = n;
    }
  }
  if (!Object.keys(out).length) return { error: 'Nothing to save' };
  return { value: out };
}

export async function updateProfile(userId, patch) {
  const { data, error } = await admin().from(T.profiles).update(patch).eq('id', userId).select(C.profile).maybeSingle();
  fail(error);
  return data;
}

export async function hasApiKey(userId) {
  const { data } = await admin().from(T.profiles).select('api_key').eq('id', userId).maybeSingle();
  return Boolean(data?.api_key);
}

export async function setApiKey(userId, key) {
  const { error } = await admin().from(T.profiles).update({ api_key: key }).eq('id', userId);
  fail(error);
}

// ── Subscription ──

export async function getSubscription(userId) {
  const { data, error } = await admin().from(T.subscriptions).select(C.subscription).eq('user_id', userId).maybeSingle();
  fail(error);
  return data ?? null;
}

// Payments are not connected yet, so a plan change only records the plan and its dates.
export async function setPlan(userId, plan) {
  const now  = new Date();
  const next = new Date(now);
  next.setMonth(next.getMonth() + 1);
  const patch = {
    plan,
    last_payment_at: plan === 'spark' ? null : now.toISOString(),
    next_payment_at: plan === 'spark' ? null : next.toISOString(),
  };
  const { data, error } = await admin().from(T.subscriptions).update(patch).eq('user_id', userId).select(C.subscription).maybeSingle();
  fail(error);
  return data;
}

// ── Devices ──

// Rows include the per-device settings. If the settings columns are missing, the basic
// columns are returned so the dashboard still works.
export async function getDevices(username) {
  const full = await admin()
    .from(T.devices)
    .select(`${C.device}, ${C.deviceSettings}`)
    .eq('owner_username', username)
    .order('installed_at', { ascending: true });
  if (!full.error) return full.data ?? [];

  const basic = await admin()
    .from(T.devices)
    .select(C.device)
    .eq('owner_username', username)
    .order('installed_at', { ascending: true });
  fail(basic.error);
  return basic.data ?? [];
}

// Sensor auth. Returns the device row or null.
export async function getDeviceByCredentials(deviceId, privateKey) {
  const { data, error } = await admin()
    .from(T.devices)
    .select('*')
    .eq('device_id', deviceId)
    .eq('private_key', privateKey)
    .maybeSingle();
  fail(error);
  return data ?? null;
}

export async function touchDevice(deviceId) {
  await admin().from(T.devices).update({ last_contacted_at: new Date().toISOString() }).eq('device_id', deviceId);
}

async function assertOwnsDevice(username, deviceId) {
  const { data } = await admin()
    .from(T.devices)
    .select('device_id')
    .eq('device_id', deviceId)
    .eq('owner_username', username)
    .maybeSingle();
  if (!data) throw new Error('Device not found for this account');
}

// Frees the device from the account.
export async function unlinkDevice(username, deviceId) {
  await assertOwnsDevice(username, deviceId);
  const { error } = await admin().from(T.devices).update({ owner_username: null }).eq('device_id', deviceId);
  fail(error);
  readingsCache.delete(username);
}

// Saves a device's own settings (already cleaned by cleanDeviceSettings).
export async function updateDeviceSettings(username, deviceId, patch) {
  await assertOwnsDevice(username, deviceId);
  const { data, error } = await admin()
    .from(T.devices)
    .update(patch)
    .eq('device_id', deviceId)
    .select(`${C.device}, ${C.deviceSettings}`)
    .single();
  if (isMissingColumn(error)) throw new Error('Device settings are not set up in the database yet. Run docs/sql/schema-update.sql in Supabase.');
  fail(error);
  readingsCache.delete(username);
  return data;
}

// Links a unit to the account that knows its private key (printed on the unit).
// Returns { device } or { error, status }.
export async function linkDeviceByKey(username, privateKey) {
  const { data: device, error } = await admin()
    .from(T.devices)
    .select('device_id, owner_username')
    .eq('private_key', privateKey)
    .maybeSingle();
  fail(error);

  if (!device) return { error: 'No device matches that key. Check it and try again.', status: 404 };
  if (device.owner_username === username) return { device, already: true };
  if (device.owner_username) return { error: 'That device is already linked to another account.', status: 409 };

  const { error: updateError } = await admin()
    .from(T.devices)
    .update({ owner_username: username })
    .eq('device_id', device.device_id)
    .is('owner_username', null);
  fail(updateError);

  readingsCache.delete(username);
  return { device: { ...device, owner_username: username } };
}

// ── Smart devices (plugs and switches a unit found on its Wi-Fi) ──

async function selectSmartDevices(unitId) {
  const full = await admin().from(T.smartDevices).select(C.smartDevice).eq('unit_id', unitId).order('name', { ascending: true });
  if (!full.error) return full.data ?? [];
  if (!isMissingColumn(full.error)) fail(full.error);
  const basic = await admin().from(T.smartDevices).select(C.smartDeviceBasic).eq('unit_id', unitId).order('name', { ascending: true });
  fail(basic.error);
  return basic.data ?? [];
}

export async function getSmartDevices(username, unitId) {
  await assertOwnsDevice(username, unitId);
  return selectSmartDevices(unitId);
}

// Server-side use (alerts): the unit is already known to belong to the account.
export async function getSmartDevicesForUnit(unitId) {
  return selectSmartDevices(unitId).catch(() => []);
}

// Dashboard "Manual control": records the state the user wants. The unit picks it up with
// its next reading (see getPendingCommands) and reports the new power_state back.
export async function setSmartDeviceState(username, unitId, mac, state) {
  await assertOwnsDevice(username, unitId);
  const { data, error } = await admin()
    .from(T.smartDevices)
    .update({ desired_state: state, desired_at: new Date().toISOString() })
    .eq('unit_id', unitId)
    .eq('mac', mac)
    .select(C.smartDevice)
    .maybeSingle();
  if (isMissingColumn(error)) throw new Error('Manual control is not set up in the database yet. Run docs/sql/schema-update.sql in Supabase.');
  fail(error);
  if (!data) throw new Error('Smart device not found on this unit');
  return data;
}

// Manual switches the unit still has to carry out: [{ mac, action }].
export async function getPendingCommands(unitId) {
  const since = new Date(Date.now() - COMMAND_TTL_MS).toISOString();
  const { data, error } = await admin()
    .from(T.smartDevices)
    .select('mac, desired_state, power_state')
    .eq('unit_id', unitId)
    .not('desired_state', 'is', null)
    .gte('desired_at', since);
  if (error) return [];
  return (data ?? [])
    .filter(d => d.desired_state !== d.power_state)
    .map(d => ({ mac: d.mac, action: d.desired_state }));
}

export async function syncSmartDevices(unitId, devices, scanAt) {
  const seenAt = scanAt.toISOString();
  const macs   = devices.map(d => d.mac);

  if (devices.length) {
    const { data: existing, error: lookupError } = await admin()
      .from(T.smartDevices)
      .select('mac')
      .eq('unit_id', unitId)
      .in('mac', macs);
    fail(lookupError);

    const known = new Set((existing ?? []).map(r => r.mac));
    const rows  = devices.map(d => ({ ...d, unit_id: unitId, last_seen_at: seenAt }));
    const fresh = rows.filter(r => !known.has(r.mac));
    const stale = rows.filter(r => known.has(r.mac)).map(({ managed, ...rest }) => rest);

    for (const batch of [fresh, stale]) {
      if (!batch.length) continue;
      const { error } = await admin().from(T.smartDevices).upsert(batch, { onConflict: 'unit_id,mac' });
      fail(error);
    }
  }

  let missing = admin().from(T.smartDevices).update({ reachable: false }).eq('unit_id', unitId);
  if (macs.length) missing = missing.not('mac', 'in', `(${macs.join(',')})`);
  const { error: missingError } = await missing;
  fail(missingError);

  // A manual switch is done once the device reports the state that was asked for.
  for (const state of ['on', 'off']) {
    await admin().from(T.smartDevices).update({ desired_state: null })
      .eq('unit_id', unitId).eq('desired_state', state).eq('power_state', state)
      .then(() => null, () => null);
  }

  const { data, error } = await admin()
    .from(T.smartDevices)
    .select('mac, role_override, managed')
    .eq('unit_id', unitId);
  fail(error);
  return data ?? [];
}

// ── Readings ──

const READINGS_TTL  = 60_000;
const READINGS_DAYS = 30;
const PAGE_SIZE     = 1000;
const MAX_PAGES     = 5;
const readingsCache = new Map();

async function fetchDeviceReadings(deviceId, sinceIso, columns) {
  const rows = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const { data, error } = await admin()
      .from(T.readings)
      .select(columns)
      .eq('device_id', deviceId)
      .gte('timestamp', sinceIso)
      .order('timestamp', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (error) {
      if (columns !== C.readingBasic && isMissingColumn(error)) return fetchDeviceReadings(deviceId, sinceIso, C.readingBasic);
      fail(error);
    }
    rows.push(...(data ?? []));
    if ((data ?? []).length < PAGE_SIZE) break;
  }
  return rows;
}

// Last 30 days for all of a user's devices, newest first (cached 60 s).
export async function fetchUserReadings(username) {
  const hit = readingsCache.get(username);
  if (hit && Date.now() - hit.ts < READINGS_TTL) return hit.data;

  const { data: devices, error } = await admin().from(T.devices).select('device_id').eq('owner_username', username);
  if (error || !devices?.length) return [];

  const since = new Date(Date.now() - READINGS_DAYS * 86_400_000).toISOString();
  const perDevice = await Promise.all(devices.map(d => fetchDeviceReadings(d.device_id, since, C.reading)));
  const readings  = perDevice.flat();

  readingsCache.set(username, { ts: Date.now(), data: readings });
  return readings;
}

const numOrNull = v => (v === undefined || v === null || v === '' || !Number.isFinite(Number(v)) ? null : Number(v));

export async function insertReading(deviceId, r) {
  const row = {
    device_id:   deviceId,
    timestamp:   r.timestamp ?? new Date().toISOString(),
    temperature: r.temperature ?? null,
    humidity:    r.humidity    ?? null,
    light:       r.light       ?? null,
    occupancy:   r.occupancy   ?? null,
  };
  const power  = numOrNull(r.appliance_power);
  const energy = numOrNull(r.appliance_energy);
  if (power !== null)  row.appliance_power  = power;
  if (energy !== null) row.appliance_energy = energy;

  const { error } = await admin().from(T.readings).insert(row);
  fail(error);
}

export async function clearReadings(username, deviceId) {
  await assertOwnsDevice(username, deviceId);
  const { error } = await admin().from(T.readings).delete().eq('device_id', deviceId);
  fail(error);
  readingsCache.delete(username);
}

// ── Automation ──

// rows are already cleaned by normalizeActions() in lib/automation.js
export async function logAutomationActions(rows) {
  if (!rows.length) return;
  const { error } = await admin().from(T.automationLog).insert(rows);
  if (error) console.error('automation_logs insert failed:', error.message);
}

export async function getAutomationLogs(username, deviceId, limit = 15) {
  await assertOwnsDevice(username, deviceId);
  const { data, error } = await admin()
    .from(T.automationLog)
    .select(C.automationLog)
    .eq('device_id', deviceId)
    .order('timestamp', { ascending: false })
    .limit(limit);
  fail(error);
  return data ?? [];
}

export async function getSchedules(userId, username, deviceId) {
  await assertOwnsDevice(username, deviceId);
  const { data, error } = await admin()
    .from(T.schedules)
    .select(C.schedule)
    .eq('user_id', userId)
    .eq('device_id', deviceId)
    .order('time', { ascending: true });
  fail(error);
  return data ?? [];
}

// Sensor side: the device is already authenticated by its private key.
export async function getDeviceSchedules(deviceId) {
  const { data, error } = await admin()
    .from(T.schedules)
    .select(C.scheduleDevice)
    .eq('device_id', deviceId)
    .eq('enabled', true);
  fail(error);
  return data ?? [];
}

export async function insertSchedules(userId, username, deviceId, rows) {
  await assertOwnsDevice(username, deviceId);
  if (!rows.length) return [];
  const { data, error } = await admin()
    .from(T.schedules)
    .insert(rows.map(r => ({ ...r, user_id: userId, device_id: deviceId })))
    .select(C.schedule);
  fail(error);
  return data ?? [];
}

// Any edit by the user turns the rule into the user's own (source = 'manual').
export async function updateSchedule(userId, id, patch) {
  const { data, error } = await admin()
    .from(T.schedules)
    .update({ ...patch, source: 'manual', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select(C.schedule)
    .maybeSingle();
  fail(error);
  return data ?? null;
}

export async function deleteSchedule(userId, id) {
  const { error } = await admin().from(T.schedules).delete().eq('id', id).eq('user_id', userId);
  fail(error);
}

// Removes the device's AI rules (not the user's own) and inserts the new ones.
export async function replaceAiSchedules(userId, username, deviceId, rows) {
  await assertOwnsDevice(username, deviceId);
  const { error } = await admin()
    .from(T.schedules)
    .delete()
    .eq('user_id', userId)
    .eq('device_id', deviceId)
    .eq('source', 'ai');
  fail(error);
  return insertSchedules(userId, username, deviceId, rows);
}

// ── Alerts ──

export async function getAlerts(userId, deviceId = null) {
  let query = admin()
    .from(T.alerts)
    .select('*')
    .eq('user_id', userId)
    .order('when', { ascending: false, nullsFirst: false });
  if (deviceId) query = query.eq('device_id', deviceId);
  const { data, error } = await query;
  fail(error);
  return data ?? [];
}

// ISO string of the newest generated alert, or null.
export async function getLastGeneratedAt(userId) {
  const { data } = await admin()
    .from(T.alerts)
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.created_at ?? null;
}

export async function getPriorAlerts(userId, deviceId, limit = 20) {
  const { data } = await admin()
    .from(T.alerts)
    .select('title, severity')
    .eq('user_id', userId)
    .eq('device_id', deviceId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}

// Set of titles created in the last `sinceMs` (used to avoid duplicates).
export async function getRecentAlertTitles(userId, deviceId, sinceMs = 6 * 3_600_000) {
  const { data } = await admin()
    .from(T.alerts)
    .select('title')
    .eq('user_id', userId)
    .eq('device_id', deviceId)
    .gte('created_at', new Date(Date.now() - sinceMs).toISOString());
  return new Set((data ?? []).map(a => a.title));
}

export async function insertAlerts(rows) {
  const { error } = await admin().from(T.alerts).insert(rows);
  return { error };
}

// acknowledgeAlerts(userId, { ids: [1,2] })  or  acknowledgeAlerts(userId, { all: true, deviceId })
export async function acknowledgeAlerts(userId, { ids, all, deviceId }) {
  let query = admin().from(T.alerts).update({ acknowledged: true }).eq('user_id', userId);
  if (all) {
    if (deviceId) query = query.eq('device_id', deviceId);
  } else {
    query = query.in('id', ids ?? []);
  }
  const { error } = await query;
  fail(error);
}

export async function getAlertPreferences(userId) {
  const { data } = await admin().from(T.alertPrefs).select('*').eq('user_id', userId).maybeSingle();
  return data ?? null;
}

export async function saveAlertPreferences(userId, prefs) {
  const { error } = await admin().from(T.alertPrefs).upsert({ ...prefs, user_id: userId });
  fail(error);
}

// ── Keep-alive ──

// A real query, so the free project counts as active.
export async function pingDatabase() {
  const { error } = await admin().from(T.devices).select('device_id').limit(1);
  fail(error);
}
