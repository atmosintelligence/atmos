import { createClient } from '@/utils/supabase/server';

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { deviceId } = await request.json();
  if (!deviceId) return Response.json({ error: 'deviceId required' }, { status: 400 });

  const SHEETS_URL = process.env.SHEETS_API_URL;
  const res = await fetch(SHEETS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'clearHistory', device_id: deviceId }),
    redirect: 'follow',
  });

  if (!res.ok) return Response.json({ error: 'Failed to clear history' }, { status: 500 });
  return Response.json({ success: true });
}