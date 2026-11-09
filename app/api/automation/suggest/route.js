import { resolveApiUser, getSchedules, replaceAiSchedules } from '@/lib/supabase';
import { getEngine } from '@/lib/server/engine';
import { generateAISchedule } from '@/lib/ai/schedule';
import { isValidTimeZone, overlaps, MAX_SCHEDULES_PER_DEVICE } from '@/lib/schedules';

const COOLDOWN_MS = 30_000;
const lastRun = new Map();

// POST { deviceId, tz } → { schedules, added }
// Replaces this device's AI rules. The user's own rules are never touched.
export async function POST(request) {
  try {
    const resolved = await resolveApiUser(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { deviceId, tz } = await request.json();
    if (!deviceId) return Response.json({ error: 'deviceId required' }, { status: 400 });
    const timeZone = isValidTimeZone(tz) ? tz : 'Asia/Kolkata';

    const { id: userId } = resolved.user;
    const { username }   = resolved.profile;

    const wait = COOLDOWN_MS - (Date.now() - (lastRun.get(userId) ?? 0));
    if (wait > 0) {
      return Response.json({ error: `Please wait ${Math.ceil(wait / 1000)} seconds before planning again` }, { status: 429 });
    }
    lastRun.set(userId, Date.now());

    const all    = await getSchedules(userId, username, deviceId);
    const manual = all.filter(r => r.source === 'manual');

    const engineResult = await getEngine({ profile: resolved.profile, deviceId });
    const planned = await generateAISchedule({
      readings: engineResult.readings,
      timeZone,
      existingRules: manual,
      profile: resolved.profile,
      engineResult
    });

    const room = Math.max(0, MAX_SCHEDULES_PER_DEVICE - manual.length);
    const rows = [];
    for (const rule of planned) {
      if (rows.length >= room) break;
      if ([...manual, ...rows].some(r => overlaps(r, rule))) continue;
      rows.push({ ...rule, tz: timeZone, source: 'ai', enabled: true });
    }

    await replaceAiSchedules(userId, username, deviceId, rows);
    const schedules = await getSchedules(userId, username, deviceId);
    return Response.json({ schedules, added: rows.length });
  } catch (err) {
    const status = /Not enough data/.test(err.message) ? 422 : 500;
    return Response.json({ error: err.message }, { status });
  }
}
