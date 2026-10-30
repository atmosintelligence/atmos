import { runEngine }               from '@/lib/engine/index.js';
import { fetchUserReadings }       from '@/lib/supabase-readings';
import { resolveApiUser }          from '@/lib/apiAuth';
import { generateAIOptimizations } from '@/lib/ai/groq';
import { GENERATION_COOLDOWN_SECONDS } from '@/lib/engine/constants.js';

export async function GET(request) {
  const resolved = await resolveApiUser(request);
  if (!resolved) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { user, supabase } = resolved;
  const { searchParams }   = new URL(request.url);
  const deviceId           = searchParams.get('deviceId');

  let query = supabase
    .from('alerts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (deviceId) query = query.eq('device_id', deviceId);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ alerts: data });
}


export async function POST(request) {
  const resolved = await resolveApiUser(request);

  if (!resolved) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { user, profile, supabase } = resolved;
    const body = await request.json();
    const deviceId = body.deviceId;

    const { data: lastAlert } = await supabase
      .from('alerts')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastAlert?.created_at) {
      const elapsed = (Date.now() - new Date(lastAlert.created_at).getTime()) / 1000;
      if (elapsed < GENERATION_COOLDOWN_SECONDS) {
        return Response.json({
          synced: 0,
          reason: 'cooldown',
          retryAfter: Math.ceil(GENERATION_COOLDOWN_SECONDS - elapsed),
        });
      }
    }

  const raw = await fetchUserReadings(profile.username);
  const filtered = deviceId
    ? raw.filter(r => r.device_id === deviceId)
    : raw;

  if (!filtered.length) {
    return Response.json({ synced: 0 });
  }

  const { data: prefs } = await supabase
    .from('alert_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const now = new Date();
  const hour = now.getHours();

  if (prefs?.quiet_hours_enabled) {
    const { quiet_hours_start: start, quiet_hours_end: end } = prefs;

    const inQuiet = start > end
      ? hour >= start || hour < end
      : hour >= start && hour < end;

    if (inQuiet) {
      return Response.json({
        synced: 0,
        reason: 'quiet_hours',
      });
    }
  }

  const engineResult = await runEngine({
    readings: filtered,
    location: {
      lat: profile.latitude,
      lon: profile.longitude,
    },
    roomAreaM2: body.roomAreaM2 ?? 20,
    tariff: profile.tariff_rate ?? 10,
    thresholdOverrides: {
      consecutiveEmpty: prefs?.min_consecutive_empty ?? 3,
      phantomLoadHours: prefs?.phantom_load_hours ?? 4,
      spikeZScore: prefs?.spike_zscore ?? 2.5,
      weekOverWeekPct: prefs?.week_over_week_pct ?? 8,
    },
  });

  const { data: priorAlerts } = await supabase
    .from('alerts')
    .select('title, severity, explanation, message, created_at')
    .eq('user_id', user.id)
    .eq('device_id', deviceId)
    .order('created_at', { ascending: false })
    .limit(20);

  const { data: recentAlerts } = await supabase
    .from('alerts')
    .select('title')
    .eq('user_id', user.id)
    .eq('device_id', deviceId)
    .gte(
      'created_at',
      new Date(Date.now() - 3600000).toISOString()
    );

  const existingTitles = new Set(
    (recentAlerts ?? []).map(a => a.title)
  );

  function prepareAlerts(optimizations, source) {
    return (optimizations ?? [])
      .map(opt => {
        if (typeof opt === 'string') {
          const message = opt.trim();

          if (!message) return null;

          const title = message.length > 80
            ? `${message.slice(0, 77).trimEnd()}…`
            : message;

          return {
            user_id: user.id,
            device_id: deviceId,
            group_name: 'General',
            severity: 'info',
            title,
            message,
            explanation: null,
            saving_inr: null,
          };
        }

        if (!opt || typeof opt !== 'object' || !opt.title) {
          return null;
        }

        return {
          user_id: user.id,
          device_id: deviceId,
          group_name: opt.group ?? opt.group_name ?? 'General',
          severity: opt.severity ?? 'info',
          title: opt.title,
          message: opt.message ?? opt.title,
          explanation: opt.explanation ?? null,
          saving_inr: opt.saving_inr ??
            (opt.saving?.inr != null
              ? Number.parseFloat(opt.saving.inr)
              : null),
        };
      })
      .filter(Boolean)
      .filter(opt => !existingTitles.has(opt.title));
  }

  let optimizationsToInsert = [];
  let source = 'ai';

  try {
    const interval =
      profile.plan === 'premium' || profile.plan === 'enterprise'
        ? '30 seconds'
        : '10 minutes';

    const aiOptimizations = await generateAIOptimizations({
      profile: {
        ...profile,
        plan: profile.plan ?? 'spark',
      },
      readings: filtered,
      engineResult,
      priorAlerts: priorAlerts ?? [],
      interval,
    });

    optimizationsToInsert = prepareAlerts(
      aiOptimizations,
      'ai'
    );

    if (!optimizationsToInsert.length) {
      source = 'js_fallback_ai_empty';
    }
  } catch (aiError) {
    console.error(
      '[Atmos AI] Generation failed; using JS fallback:',
      aiError
    );

    source = 'js_fallback_ai_error';
  }

  if (source !== 'ai') {
    optimizationsToInsert = prepareAlerts(
      engineResult.optimizations,
      'js'
    );
  }

  if (!optimizationsToInsert.length) {
    return Response.json({
      synced: 0,
      source,
      reason: 'no_new_optimizations',
    });
  }

  let { error } = await supabase
    .from('alerts')
    .insert(optimizationsToInsert);

  if (error && source === 'ai') {
    console.error(
      '[Atmos Alerts] AI alert insertion failed; retrying with JS fallback:',
      error
    );

    source = 'js_fallback_ai_insert_error';

    optimizationsToInsert = prepareAlerts(
      engineResult.optimizations,
      'js'
    );

    if (!optimizationsToInsert.length) {
      return Response.json({
        synced: 0,
        source,
        reason: 'no_new_optimizations',
      });
    }

    const fallbackInsert = await supabase
      .from('alerts')
      .insert(optimizationsToInsert);

    error = fallbackInsert.error;
  }

  if (error) {
    console.error(
      '[Atmos Alerts] JS fallback insertion failed:',
      error
    );

    return Response.json(
      {
        error: error.message,
        source,
      },
      { status: 500 }
    );
  }

  return Response.json({
    synced: optimizationsToInsert.length,
    source,
  });
}
