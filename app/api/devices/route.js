import { createClient } from '@/utils/supabase/server';
import { fetchUserDevices } from '@/lib/sheets';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });

  try {
    const devices = await fetchUserDevices(profile.username);
    return Response.json({ devices });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}