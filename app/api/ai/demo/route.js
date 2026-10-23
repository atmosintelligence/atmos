import { generateAIOptimizations } from '@/lib/ai/groq';
import { runEngine } from '@/lib/engine/index.js';

export async function POST(request) {
  try {
    const { readings, location, roomAreaM2, tariff, deviceId } = await request.json();

    if (!readings?.length) {
      return Response.json({ optimizations: [], source: 'empty' });
    }

    const engineResult = await runEngine({
      readings,
      location:   location   ?? { lat: 28.6139, lon: 77.2090 },
      roomAreaM2: roomAreaM2 ?? 20,
      tariff:     tariff     ?? 10,
    });

    let ai = [];
    let source = 'ai';

    try {
      ai = await generateAIOptimizations({
        profile: {
          latitude:    location?.lat ?? 28.6139,
          longitude:   location?.lon ?? 77.2090,
          tariff_rate: tariff ?? 10,
          plan:        'enterprise',
        },
        readings,
        engineResult,
        priorAlerts: [],
        interval:    '10 minutes',
      });
    } catch (err) {
      console.error('[Atmos AI Demo] Generation failed:', err.message);
    }

    if (!ai.length) {
      source = 'js_fallback';
      ai = (engineResult.optimizations ?? []).map(o => ({
        group:      o.group,
        severity:   o.severity,
        title:      o.title,
        message:    o.message,
        saving_inr: o.saving?.inr ? parseFloat(o.saving.inr) : null,
      }));
    }

    const stamp = Date.now();
    const optimizations = ai.map((o, i) => ({
      id:           `demo-${stamp}-${i}`,
      device_id:    deviceId ?? 'ATM-DEMO',
      group_name:   o.group,
      severity:     o.severity,
      title:        o.title,
      message:      o.message,
      saving_inr:   o.saving_inr ?? null,
      acknowledged: false,
      created_at:   new Date(stamp - i * 1000).toISOString(),
    }));

    return Response.json({ optimizations, source });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
