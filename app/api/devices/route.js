import { fetchUserDevices } from '@/lib/sheets';
import { resolveApiUser } from '@/lib/apiAuth';

export async function GET(request) {
  const resolved = await resolveApiUser(request);

  if (!resolved) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { profile } = resolved;

  if (!profile) {
    return Response.json(
      { error: 'Profile not found' },
      { status: 404 }
    );
  }

  try {
    const devices = await fetchUserDevices(
      profile.username
    );

    return Response.json({ devices });
  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}