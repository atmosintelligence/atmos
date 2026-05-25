import { createClient } from '@/utils/supabase/server';

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { ids, all, deviceId } = await request.json();

  if (all) {
    let query = supabase
      .from('alerts')
      .update({ acknowledged: true })
      .eq('user_id', user.id);
    if (deviceId) query = query.eq('device_id', deviceId);
    const { error } = await query;
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  }

  const { error } = await supabase
    .from('alerts')
    .update({ acknowledged: true })
    .eq('user_id', user.id)
    .in('id', ids);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}