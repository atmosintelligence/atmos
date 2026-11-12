import { resolveApiUser, linkDeviceByKey } from '@/lib/supabase';
import { clearEngineCache } from '@/lib/server/engine';

// A few wrong guesses in a row lock the account out for a while, so the private key
// cannot be brute-forced through this form.
const MAX_MISSES = 5;
const LOCK_MS    = 10 * 60_000;
const misses     = new Map();   // username -> { count, until }

// POST { privateKey } → { device } (the unit is now linked to the signed-in account)
export async function POST(request) {
  try {
    const resolved = await resolveApiUser(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { username } = resolved.profile;
    const state = misses.get(username);
    if (state?.until > Date.now()) {
      return Response.json({ error: 'Too many wrong keys. Try again in a few minutes.' }, { status: 429 });
    }

    const { privateKey } = await request.json();
    const key = typeof privateKey === 'string' ? privateKey.trim() : '';
    if (key.length < 8 || key.length > 200) {
      return Response.json({ error: 'Enter the private key printed on your device.' }, { status: 400 });
    }

    const result = await linkDeviceByKey(username, key);
    if (result.error) {
      if (result.status === 404) {
        const count = (state?.count ?? 0) + 1;
        misses.set(username, { count, until: count >= MAX_MISSES ? Date.now() + LOCK_MS : 0 });
      }
      return Response.json({ error: result.error }, { status: result.status });
    }

    misses.delete(username);
    clearEngineCache(username);
    return Response.json({ device: { device_id: result.device.device_id }, already: Boolean(result.already) });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
