// All Supabase access lives here. Browser-safe functions use the signed-in
// user's client (row-level security applies). Server-only functions use the
// admin client, so API routes must authorise the user first and every query
// filters by the user id or username passed in.
// next/headers is imported lazily so client components can import this file.

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isBrowser = typeof window !== 'undefined';

// ── Clients ──

let browserClient = null;
export function getBrowserClient() {
  if (!browserClient) browserClient = createBrowserClient(SUPABASE_URL, ANON_KEY);
  return browserClient;
}

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
export function getAdminClient() {
  if (isBrowser) throw new Error('getAdminClient() is server-only');
  if (!adminClient) {
    adminClient = createSupabaseClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return adminClient;
}

// Logged-in user's client: browser client in the browser, cookie client on the server.
async function db() {
  return isBrowser ? getBrowserClient() : getServerClient();
}

// ── Auth ──

export async function getCurrentUser() {
  const supabase = await db();
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}

// API routes: accepts a "Bearer atmos_..." key or the logged-in session.
// Returns { user, profile } or null.
export async function resolveApiUser(request) {
  const header = request.headers.get('Authorization');

  if (header?.startsWith('Bearer ')) {
    const { data: profile } = await getAdminClient()
      .from('profiles')
      .select('*')
      .eq('api_key', header.slice(7))
      .maybeSingle();
    return profile ? { user: { id: profile.id }, profile } : null;
  }

  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await db();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile ? { user, profile } : null;
}

export async function signIn(email, password) {
  const supabase = getBrowserClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error };
}

export async function signUp({ email, password, metadata }) {
  const supabase = getBrowserClient();
  const { error } = await supabase.auth.signUp({ email, password, options: { data: metadata } });
  return { error };
}

export async function signOut() {
  await getBrowserClient().auth.signOut();
}

export async function exchangeCodeForSession(code) {
  const supabase = await getServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return { error };
}

// Returns an unsubscribe function.
export function onAuthChange(callback) {
  const { data } = getBrowserClient().auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

// Re-checks the current password, then sets the new one.
export async function changePassword(currentPassword, newPassword) {
  const supabase = getBrowserClient();
  const user = await getCurrentUser();
  if (!user) return { error: { message: 'Not signed in.' } };

  const { error: wrong } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (wrong) return { error: { message: 'Current password is incorrect.' } };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error };
}

export async function deleteAccount() {
  const supabase = getBrowserClient();
  const { error } = await supabase.rpc('delete_user');
  if (error) return { error };
  await supabase.auth.signOut();
  return { error: null };
}

// ── Profile (browser or server; uses the logged-in user's session) ──

// getProfile('display_name, username') → row or null
export async function getProfile(columns = '*') {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await db();
  const { data } = await supabase.from('profiles').select(columns).eq('id', user.id).single();
  return data ?? null;
}

// updateProfile({ display_name }) → { error }
export async function updateProfile(patch) {
  const user = await getCurrentUser();
  if (!user) return { error: { message: 'Not signed in.' } };
  const supabase = await db();
  const { error } = await supabase.from('profiles').update(patch).eq('id', user.id);
  return { error };
}

export async function hasApiKey() {
  const profile = await getProfile('api_key');
  return Boolean(profile?.api_key);
}

// setApiKey('atmos_...') to create, setApiKey(null) to revoke.
export function setApiKey(key) {
  return updateProfile({ api_key: key });
}

// Login only: finds the email for a username (the user is not signed in yet).
export async function getEmailForUsername(username) {
  const { data } = await getBrowserClient()
    .from('profiles')
    .select('email')
    .eq('username', username)
    .single();
  return data?.email ?? null;
}

// ── Subscription ──

export async function getSubscription() {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await db();
  const { data } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).single();
  return data ?? null;
}

export async function updateSubscription(patch) {
  const user = await getCurrentUser();
  if (!user) return { error: { message: 'Not signed in.' } };
  const supabase = await db();
  const { error } = await supabase.from('subscriptions').update(patch).eq('user_id', user.id);
  return { error };
}

// ── Devices (server-only) ──

export async function getDevices(username) {
  const { data, error } = await getAdminClient()
    .from('devices')
    .select('device_id, owner_username, installed_at, last_contacted_at')
    .eq('owner_username', username);
  if (error) throw new Error(error.message);
  return data ?? [];
}

// Sensor auth. Returns the device row or null.
export async function getDeviceByCredentials(deviceId, privateKey) {
  const { data, error } = await getAdminClient()
    .from('devices')
    .select('*')
    .eq('device_id', deviceId)
    .eq('private_key', privateKey)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function touchDevice(deviceId) {
  await getAdminClient()
    .from('devices')
    .update({ last_contacted_at: new Date().toISOString() })
    .eq('device_id', deviceId);
}

async function assertOwnsDevice(username, deviceId) {
  const { data } = await getAdminClient()
    .from('devices')
    .select('device_id')
    .eq('device_id', deviceId)
    .eq('owner_username', username)
    .maybeSingle();
  if (!data) throw new Error('Device not found for this account');
}

// Frees the device from the account (assumes devices.owner_username is nullable).
export async function unlinkDevice(username, deviceId) {
  await assertOwnsDevice(username, deviceId);
  const { error } = await getAdminClient()
    .from('devices')
    .update({ owner_username: null })
    .eq('device_id', deviceId);
  if (error) throw new Error(error.message);
  readingsCache.delete(username);
}

// ── Readings (server-only) ──

const READINGS_TTL  = 60_000;
const READINGS_DAYS = 30;
const PAGE_SIZE     = 1000;
const MAX_PAGES     = 5;
const readingsCache = new Map();

const READING_COLUMNS =
  'device_id, timestamp, power, current, energy, voltage, temperature, humidity, light, occupancy';

// Last 30 days of one device, newest first, up to MAX_PAGES * PAGE_SIZE rows.
async function fetchDeviceReadings(admin, deviceId, sinceIso) {
  const rows = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const { data, error } = await admin
      .from('readings')
      .select(READING_COLUMNS)
      .eq('device_id', deviceId)
      .gte('timestamp', sinceIso)
      .order('timestamp', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if ((data ?? []).length < PAGE_SIZE) break;
  }
  return rows;
}

// Readings for all of a user's devices (cached 60 s).
export async function fetchUserReadings(username) {
  const hit = readingsCache.get(username);
  if (hit && Date.now() - hit.ts < READINGS_TTL) return hit.data;

  const admin = getAdminClient();

  const { data: devices, error: devError } = await admin
    .from('devices')
    .select('device_id')
    .eq('owner_username', username);
  if (devError || !devices?.length) return [];

  const since   = new Date(Date.now() - READINGS_DAYS * 86_400_000).toISOString();
  const perDevice = await Promise.all(devices.map(d => fetchDeviceReadings(admin, d.device_id, since)));
  const readings  = perDevice.flat();

  readingsCache.set(username, { ts: Date.now(), data: readings });
  return readings;
}

export async function insertReading(deviceId, r) {
  const { error } = await getAdminClient().from('readings').insert({
    device_id:   deviceId,
    timestamp:   r.timestamp ?? new Date().toISOString(),
    power:       r.power       ?? null,
    current:     r.current     ?? null,
    energy:      r.energy      ?? null,
    voltage:     r.voltage     ?? null,
    temperature: r.temperature ?? null,
    humidity:    r.humidity    ?? null,
    light:       r.light       ?? null,
    occupancy:   r.occupancy   ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function clearReadings(username, deviceId) {
  await assertOwnsDevice(username, deviceId);
  const { error } = await getAdminClient().from('readings').delete().eq('device_id', deviceId);
  if (error) throw new Error(error.message);
  readingsCache.delete(username);
}

// ── Automation (server-only) ──

// rows are already cleaned by normalizeActions() in lib/automation.js
export async function logAutomationActions(rows) {
  if (!rows.length) return;
  const { error } = await getAdminClient().from('automation_logs').insert(rows);
  if (error) console.error('automation_logs insert failed:', error.message);
}

// Recent actions the sensor reported, newest first.
export async function getAutomationLogs(username, deviceId, limit = 15) {
  await assertOwnsDevice(username, deviceId);
  const { data, error } = await getAdminClient()
    .from('automation_logs')
    .select('target, action, reason, timestamp')
    .eq('device_id', deviceId)
    .order('timestamp', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Schedules (server-only; always pass the authorised userId / username) ──

const SCHEDULE_COLUMNS = 'id, device_id, target, action, days, time, tz, source, reason, enabled, created_at';

export async function getSchedules(userId, username, deviceId) {
  await assertOwnsDevice(username, deviceId);
  const { data, error } = await getAdminClient()
    .from('automation_schedules')
    .select(SCHEDULE_COLUMNS)
    .eq('user_id', userId)
    .eq('device_id', deviceId)
    .order('time', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

// Sensor side: the device is already authenticated by its private key.
export async function getDeviceSchedules(deviceId) {
  const { data, error } = await getAdminClient()
    .from('automation_schedules')
    .select('id, target, action, days, time, tz, enabled')
    .eq('device_id', deviceId)
    .eq('enabled', true);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function insertSchedules(userId, username, deviceId, rows) {
  await assertOwnsDevice(username, deviceId);
  if (!rows.length) return [];
  const { data, error } = await getAdminClient()
    .from('automation_schedules')
    .insert(rows.map(r => ({ ...r, user_id: userId, device_id: deviceId })))
    .select(SCHEDULE_COLUMNS);
  if (error) throw new Error(error.message);
  return data ?? [];
}

// Any edit by the user turns the rule into the user's own (source = 'manual').
export async function updateSchedule(userId, id, patch) {
  const { data, error } = await getAdminClient()
    .from('automation_schedules')
    .update({ ...patch, source: 'manual', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select(SCHEDULE_COLUMNS)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function deleteSchedule(userId, id) {
  const { error } = await getAdminClient()
    .from('automation_schedules')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}

// Removes the device's AI rules (not the user's own) and inserts the new ones.
export async function replaceAiSchedules(userId, username, deviceId, rows) {
  await assertOwnsDevice(username, deviceId);
  const { error } = await getAdminClient()
    .from('automation_schedules')
    .delete()
    .eq('user_id', userId)
    .eq('device_id', deviceId)
    .eq('source', 'ai');
  if (error) throw new Error(error.message);
  return insertSchedules(userId, username, deviceId, rows);
}

// ── Alerts (server-only; always pass the authorised userId) ──

export async function getAlerts(userId, deviceId = null) {
  let query = getAdminClient()
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (deviceId) query = query.eq('device_id', deviceId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ISO string of the newest generated alert, or null.
export async function getLastGeneratedAt(userId) {
  const { data } = await getAdminClient()
    .from('alerts')
    .select('generated_at')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.generated_at ?? null;
}

export async function getPriorAlerts(userId, deviceId, limit = 20) {
  const { data } = await getAdminClient()
    .from('alerts')
    .select('title, severity, explanation, message, created_at')
    .eq('user_id', userId)
    .eq('device_id', deviceId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}

// Set of titles created in the last `sinceMs` (used to avoid duplicates).
export async function getRecentAlertTitles(userId, deviceId, sinceMs = 3_600_000) {
  const { data } = await getAdminClient()
    .from('alerts')
    .select('title')
    .eq('user_id', userId)
    .eq('device_id', deviceId)
    .gte('generated_at', new Date(Date.now() - sinceMs).toISOString());
  return new Set((data ?? []).map(a => a.title));
}

export async function insertAlerts(rows) {
  const { error } = await getAdminClient().from('alerts').insert(rows);
  return { error };
}

// acknowledgeAlerts(userId, { ids: [1,2] })  or  acknowledgeAlerts(userId, { all: true, deviceId })
export async function acknowledgeAlerts(userId, { ids, all, deviceId }) {
  let query = getAdminClient().from('alerts').update({ acknowledged: true }).eq('user_id', userId);

  if (all) {
    if (deviceId) query = query.eq('device_id', deviceId);
  } else {
    query = query.in('id', ids ?? []);
  }

  const { error } = await query;
  if (error) throw new Error(error.message);
}

// ── Preferences (server-only) ──

export async function getAlertPreferences(userId) {
  const { data } = await getAdminClient()
    .from('alert_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return data ?? null;
}

export async function saveAlertPreferences(userId, prefs) {
  const { error } = await getAdminClient()
    .from('alert_preferences')
    .upsert({ ...prefs, user_id: userId });
  if (error) throw new Error(error.message);
}

// ── Keep-alive (server-only) ──

// A real query, so the free project counts as active.
export async function pingDatabase() {
  const { error } = await getAdminClient().from('devices').select('device_id').limit(1);
  if (error) throw new Error(error.message);
}

// ── Proxy Session (proxy.js) ──

// Refreshes the Supabase login cookie on every request.
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

  await supabase.auth.getUser();
  return response;
}
