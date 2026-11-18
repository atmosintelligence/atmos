import { getEmailForUsername } from '@/lib/server/db';

// POST { username } → { email }. Used by the login form to sign in with a username.
export async function POST(request) {
  try {
    const { username } = (await request.json().catch(() => null)) ?? {};
    if (typeof username !== 'string' || !username.trim() || username.length > 64) {
      return Response.json({ error: 'Enter your username' }, { status: 400 });
    }
    const email = await getEmailForUsername(username);
    if (!email) return Response.json({ error: 'No account found with that username.' }, { status: 404 });
    return Response.json({ email });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
