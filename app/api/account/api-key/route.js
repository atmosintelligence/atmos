import { randomBytes } from 'node:crypto';
import { resolveApiUser, hasApiKey, setApiKey } from '@/lib/server/db';

// Keys are managed from a signed-in session only, so a key cannot replace itself.
async function owner(request) {
  return resolveApiUser(request, { sessionOnly: true });
}

// GET → { hasKey }
export async function GET(request) {
  try {
    const resolved = await owner(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    return Response.json({ hasKey: await hasApiKey(resolved.user.id) });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST → { key }  (replaces any existing key; shown once)
export async function POST(request) {
  try {
    const resolved = await owner(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const key = `atmos_${randomBytes(24).toString('hex')}`;
    await setApiKey(resolved.user.id, key);
    return Response.json({ key });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE → { ok }
export async function DELETE(request) {
  try {
    const resolved = await owner(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    await setApiKey(resolved.user.id, null);
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
