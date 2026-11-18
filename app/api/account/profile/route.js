import { resolveApiUser, updateProfile, cleanProfilePatch } from '@/lib/server/db';

// GET /api/account/profile → { profile }
export async function GET(request) {
  try {
    const resolved = await resolveApiUser(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    return Response.json({ profile: resolved.profile });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// PATCH { display_name?, latitude?, longitude?, optimization_mode? } → { profile }
export async function PATCH(request) {
  try {
    const resolved = await resolveApiUser(request, { sessionOnly: true });
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { value, error } = cleanProfilePatch(await request.json().catch(() => null));
    if (error) return Response.json({ error }, { status: 400 });

    const updated = await updateProfile(resolved.user.id, value);
    return Response.json({ profile: { ...resolved.profile, ...updated } });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
