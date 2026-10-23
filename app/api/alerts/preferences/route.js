import { resolveApiUser } from '@/lib/apiAuth';

export async function GET(request) {
  const resolved = await resolveApiUser(request);
  if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { user, supabase } = resolved;

  const { data, error } = await supabase
    .from('alert_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ preferences: data });
}

export async function POST(request) {
  const resolved = await resolveApiUser(request);
  if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { user, supabase } = resolved;
  const body = await request.json();

  const { error } = await supabase
    .from('alert_preferences')
    .upsert({ user_id: user.id, ...body });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
