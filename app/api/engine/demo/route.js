import { runEngine } from '@/lib/engine/index.js';

export async function POST(request) {
  try {
    const body     = await request.json();
    const { readings, location, roomAreaM2, tariff } = body;

    if (!readings?.length) {
      return Response.json({ optimizations: [], environmental: null, readings: [], analysis: null });
    }

    const result = await runEngine({
      readings,
      location:   location   ?? { lat: 28.6139, lon: 77.2090 },
      roomAreaM2: roomAreaM2 ?? 20,
      tariff:     tariff     ?? 10,
    });

    return Response.json({ ...result, readings });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}