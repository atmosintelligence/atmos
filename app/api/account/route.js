import { getSessionUser, deleteOwnAccount } from '@/lib/server/db';

// DELETE /api/account → deletes the signed-in account. Session only, never an API key.
export async function DELETE() {
  try {
    const user = await getSessionUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    await deleteOwnAccount();
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
