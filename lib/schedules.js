// Pure helpers for automation schedules. No database access here;
// see lib/supabase.js for that.

export const TARGETS = ['light', 'fan', 'ac'];
export const ACTIONS = ['on', 'off'];
export const MAX_SCHEDULES_PER_DEVICE = 40;

// 0 = Sunday ... 6 = Saturday (same as Date#getDay)
const DAY_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const TIME_RE   = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidTimeZone(tz) {
  if (typeof tz !== 'string' || !tz) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

// Minutes east of UTC for a time zone right now (India = 330).
export function utcOffsetMinutes(tz, date = new Date()) {
  try {
    const part = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' })
      .formatToParts(date)
      .find(p => p.type === 'timeZoneName')?.value ?? 'GMT';
    const m = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(part);
    if (!m) return 0;
    const minutes = Number(m[2]) * 60 + Number(m[3] ?? 0);
    return m[1] === '-' ? -minutes : minutes;
  } catch {
    return 0;
  }
}

// Validates user input for create/update. `partial` allows missing fields.
// Returns { value } or { error }.
export function cleanSchedule(input, { partial = false } = {}) {
  const out = {};
  const body = input && typeof input === 'object' ? input : {};

  if (!partial || body.target !== undefined) {
    if (!TARGETS.includes(body.target)) return { error: 'target must be light, fan or ac' };
    out.target = body.target;
  }
  if (!partial || body.action !== undefined) {
    if (!ACTIONS.includes(body.action)) return { error: 'action must be on or off' };
    out.action = body.action;
  }
  if (!partial || body.days !== undefined) {
    const days = Array.isArray(body.days) ? [...new Set(body.days.map(Number))] : [];
    if (!days.length || days.some(d => !Number.isInteger(d) || d < 0 || d > 6)) {
      return { error: 'days must be a list of weekdays (0 = Sunday to 6 = Saturday)' };
    }
    out.days = days.sort((a, b) => a - b);
  }
  if (!partial || body.time !== undefined) {
    if (typeof body.time !== 'string' || !TIME_RE.test(body.time)) return { error: 'time must be HH:MM (24-hour)' };
    out.time = body.time;
  }
  if (body.tz !== undefined || !partial) {
    const tz = body.tz ?? 'Asia/Kolkata';
    if (!isValidTimeZone(tz)) return { error: 'invalid time zone' };
    out.tz = tz;
  }
  if (body.enabled !== undefined) out.enabled = Boolean(body.enabled);
  if (body.reason !== undefined) out.reason = body.reason ? String(body.reason).slice(0, 200) : null;

  return { value: out };
}

// What the sensor receives: only enabled rules, with the UTC offset it needs
// to compare against its own clock.
export function toDevicePayload(rows, now = new Date()) {
  return (rows ?? [])
    .filter(r => r.enabled)
    .map(r => ({
      id:             r.id,
      target:         r.target,
      action:         r.action,
      days:           r.days,
      time:           r.time,
      utc_offset_min: utcOffsetMinutes(r.tz, now),
    }));
}

function parseDays(text) {
  const t = text.toLowerCase().replace(/\s+/g, '');
  if (!t) return [];
  if (t === 'daily' || t === 'everyday' || t === 'all') return [0, 1, 2, 3, 4, 5, 6];
  if (t === 'weekdays') return [1, 2, 3, 4, 5];
  if (t === 'weekends') return [0, 6];

  const days = new Set();
  for (const chunk of t.split(/[,;/]/)) {
    const range = /^([a-z]{3})[a-z]*-([a-z]{3})[a-z]*$/.exec(chunk);
    if (range) {
      const from = DAY_NAMES.indexOf(range[1]);
      const to   = DAY_NAMES.indexOf(range[2]);
      if (from < 0 || to < 0) continue;
      for (let d = from; ; d = (d + 1) % 7) {
        days.add(d);
        if (d === to) break;
      }
      continue;
    }
    const single = DAY_NAMES.indexOf(chunk.slice(0, 3));
    if (single >= 0) days.add(single);
  }
  return [...days].sort((a, b) => a - b);
}

// Parses the model's output: TARGET|ACTION|DAYS|HH:MM|Reason
export function parseAiSchedule(content) {
  return String(content ?? '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/```[a-z]*/gi, '')
    .split(/\r?\n/)
    .map(line => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter(line => line.split('|').length >= 4)
    .map(line => {
      const [rawTarget, rawAction, rawDays, rawTime, ...rest] = line.split('|').map(p => p.trim());
      const target = rawTarget.toLowerCase();
      const action = rawAction.toLowerCase();
      const days   = parseDays(rawDays);
      const time   = /^\d:\d{2}$/.test(rawTime) ? `0${rawTime}` : rawTime;

      if (!TARGETS.includes(target) || !ACTIONS.includes(action)) return null;
      if (!days.length || !TIME_RE.test(time)) return null;

      return { target, action, days, time, reason: rest.join(' ').slice(0, 200) || null };
    })
    .filter(Boolean);
}

// True when two rules would fire the same command at the same minute on a shared day.
export function overlaps(a, b) {
  return a.target === b.target && a.time === b.time && a.days.some(d => b.days.includes(d));
}
