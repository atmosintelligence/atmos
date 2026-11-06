import {
  resolveApiUser, getSchedules, insertSchedules, updateSchedule, deleteSchedule, getAutomationLogs,
} from '@/lib/supabase';
import { cleanSchedule, MAX_SCHEDULES_PER_DEVICE } from '@/lib/schedules';

// GET /api/automation/schedules?deviceId=ATM-001 → { schedules, logs }
export async function GET(request) {
  try {
    const resolved = await resolveApiUser(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const deviceId = new URL(request.url).searchParams.get('deviceId');
    if (!deviceId) return Response.json({ error: 'deviceId required' }, { status: 400 });

    const { id: userId } = resolved.user;
    const { username }   = resolved.profile;
    const [schedules, logs] = await Promise.all([
      getSchedules(userId, username, deviceId),
      getAutomationLogs(username, deviceId).catch(() => []),
    ]);
    return Response.json({ schedules, logs });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST { deviceId, target, action, days, time, tz? } → { schedule }
export async function POST(request) {
  try {
    const resolved = await resolveApiUser(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    if (!body.deviceId) return Response.json({ error: 'deviceId required' }, { status: 400 });

    const { value, error } = cleanSchedule(body);
    if (error) return Response.json({ error }, { status: 400 });

    const { id: userId } = resolved.user;
    const { username }   = resolved.profile;

    const existing = await getSchedules(userId, username, body.deviceId);
    if (existing.length >= MAX_SCHEDULES_PER_DEVICE) {
      return Response.json({ error: `A device can have at most ${MAX_SCHEDULES_PER_DEVICE} rules` }, { status: 400 });
    }

    const [schedule] = await insertSchedules(userId, username, body.deviceId, [{ ...value, source: 'manual' }]);
    return Response.json({ schedule });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// PATCH { id, ...fields } → { schedule }. The rule becomes the user's own.
export async function PATCH(request) {
  try {
    const resolved = await resolveApiUser(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, ...fields } = await request.json();
    if (!id) return Response.json({ error: 'id required' }, { status: 400 });

    const { value, error } = cleanSchedule(fields, { partial: true });
    if (error) return Response.json({ error }, { status: 400 });

    const schedule = await updateSchedule(resolved.user.id, id, value);
    if (!schedule) return Response.json({ error: 'Rule not found' }, { status: 404 });
    return Response.json({ schedule });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE ?id=... → { ok }
export async function DELETE(request) {
  try {
    const resolved = await resolveApiUser(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const id = new URL(request.url).searchParams.get('id');
    if (!id) return Response.json({ error: 'id required' }, { status: 400 });

    await deleteSchedule(resolved.user.id, id);
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
