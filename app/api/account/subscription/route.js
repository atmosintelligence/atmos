import { resolveApiUser, getSubscription, setPlan } from '@/lib/server/db';

// Plans a person can switch to themselves. Enterprise is arranged with us.
const SELF_SERVE = ['spark', 'basic', 'premium'];

// GET /api/account/subscription → { subscription }
export async function GET(request) {
  try {
    const resolved = await resolveApiUser(request);
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const subscription = await getSubscription(resolved.user.id);
    if (!subscription) return Response.json({ error: 'No subscription found' }, { status: 404 });
    return Response.json({ subscription });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// PATCH { plan } → { subscription }
export async function PATCH(request) {
  try {
    const resolved = await resolveApiUser(request, { sessionOnly: true });
    if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { plan } = (await request.json().catch(() => null)) ?? {};
    if (!SELF_SERVE.includes(plan)) return Response.json({ error: 'Choose Spark, Basic or Premium' }, { status: 400 });

    const subscription = await setPlan(resolved.user.id, plan);
    return Response.json({ subscription });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
