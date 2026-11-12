// Alert generation pipeline. Called by POST /api/alerts.
// Order: cooldown → quiet hours → engine → AI → fallback to engine text → de-duplicate → save.

import { getEngine } from '@/lib/server/engine';
import { generateAIOptimizations } from '@/lib/ai/groq';
import { GENERATION_COOLDOWN_SECONDS } from '@/lib/engine/constants.js';
import {
  getAlertPreferences,
  getLastGeneratedAt,
  getPriorAlerts,
  getRecentAlertTitles,
  insertAlerts,
} from '@/lib/supabase';

function isQuietHour(prefs, hour) {
  if (!prefs?.quiet_hours_enabled) return false;
  const { quiet_hours_start: start, quiet_hours_end: end } = prefs;
  return start > end ? hour >= start || hour < end : hour >= start && hour < end;
}

function toIso(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
}

function latestTimestamp(readings) {
  return readings.reduce((max, r) => (new Date(r.timestamp) > new Date(max) ? r.timestamp : max), readings[0].timestamp);
}

function toAlertRow(opt, userId, deviceId, readingTime, groupTimes = {}) {
  const group = opt.group ?? opt.group_name ?? 'General';
  return {
    user_id:    userId,
    device_id:  deviceId,
    group_name: group,
    severity:   opt.severity ?? 'info',
    title:      opt.title,
    message:    opt.message ?? opt.title,
    saving_inr: opt.saving_inr ?? (opt.saving?.inr != null ? Number.parseFloat(opt.saving.inr) : null),
    when:       toIso(opt.timestamp) ?? toIso(groupTimes[group.toLowerCase()]) ?? readingTime,
  };
}

function timesByGroup(engineOptimizations) {
  const times = {};
  for (const o of engineOptimizations ?? []) {
    const group = (o.group ?? o.group_name ?? '').toLowerCase();
    if (!group || !o.timestamp) continue;
    if (!times[group] || new Date(o.timestamp) > new Date(times[group])) times[group] = o.timestamp;
  }
  return times;
}

function buildRows(optimizations, userId, deviceId, existingTitles, readingTime, groupTimes) {
  return (optimizations ?? [])
    .filter(opt => opt?.title && !existingTitles.has(opt.title))
    .map(opt => toAlertRow(opt, userId, deviceId, readingTime, groupTimes));
}

// Returns { synced, source?, reason?, retryAfter? }. Throws on a database error.
export async function syncAlerts({ userId, profile, deviceId, roomAreaM2 }) {
  // 1. Cooldown (per user)
  const lastAt = await getLastGeneratedAt(userId);
  if (lastAt) {
    const elapsed = (Date.now() - new Date(lastAt).getTime()) / 1000;
    if (elapsed < GENERATION_COOLDOWN_SECONDS) {
      return { synced: 0, reason: 'cooldown', retryAfter: Math.ceil(GENERATION_COOLDOWN_SECONDS - elapsed) };
    }
  }

  // 2. Quiet hours
  const prefs = await getAlertPreferences(userId);
  if (isQuietHour(prefs, new Date().getHours())) {
    return { synced: 0, reason: 'quiet_hours' };
  }

  // 3. Engine
  const engineResult = await getEngine({
    profile,
    deviceId,
    roomAreaM2,
    thresholdOverrides: {
      consecutiveEmpty: prefs?.min_consecutive_empty ?? 3,
      phantomLoadHours: prefs?.phantom_load_hours    ?? 4,
    },
  });
  if (!engineResult.readings.length) return { synced: 0 };

  const readingTime = toIso(latestTimestamp(engineResult.readings));
  const groupTimes  = timesByGroup(engineResult.optimizations);

  const [priorAlerts, existingTitles] = await Promise.all([
    getPriorAlerts(userId, deviceId),
    getRecentAlertTitles(userId, deviceId),
  ]);

  // 4. AI, with the engine's own text as the fallback
  let source = 'ai';
  let rows   = [];

  try {
    const aiOptimizations = await generateAIOptimizations({
      profile: {
        ...profile,
        // this device's own settings, with the account's values as the fallback
        tariff_rate: engineResult.settings?.tariff    ?? profile.tariff_rate,
        latitude:    engineResult.settings?.latitude  ?? profile.latitude,
        longitude:   engineResult.settings?.longitude ?? profile.longitude,
        plan:        profile.plan ?? 'spark',
      },
      readings: engineResult.readings,
      engineResult,
      priorAlerts,
      interval: profile.plan === 'premium' || profile.plan === 'enterprise' ? '30 seconds' : '10 minutes',
    });
    rows = buildRows(aiOptimizations, userId, deviceId, existingTitles, readingTime, groupTimes);
    if (!rows.length) source = 'js_fallback_ai_empty';
  } catch (err) {
    console.error('[Atmos AI] Generation failed; using JS fallback:', err);
    source = 'js_fallback_ai_error';
  }

  if (source !== 'ai') {
    rows = buildRows(engineResult.optimizations, userId, deviceId, existingTitles, readingTime, groupTimes);
  }
  if (!rows.length) return { synced: 0, source, reason: 'no_new_optimizations' };

  // 5. Save (if the AI rows are rejected by the database, retry with engine rows)
  let { error } = await insertAlerts(rows);

  if (error && source === 'ai') {
    console.error('[Atmos Alerts] AI alert insert failed; retrying with JS fallback:', error);
    source = 'js_fallback_ai_insert_error';
    rows = buildRows(engineResult.optimizations, userId, deviceId, existingTitles, readingTime, groupTimes);
    if (!rows.length) return { synced: 0, source, reason: 'no_new_optimizations' };
    ({ error } = await insertAlerts(rows));
  }

  if (error) throw new Error(error.message);
  return { synced: rows.length, source };
}
