import { pingDatabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Called daily by the Vercel cron in vercel.json. If CRON_SECRET is set,
// Vercel sends it as a Bearer token and anything else is rejected.
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await pingDatabase();
    return Response.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
