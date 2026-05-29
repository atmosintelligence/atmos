import fs from 'fs/promises';
import path from 'path';

const CACHE_DURATION = 5 * 60 * 1000;

let cached = null;
let lastFetched = 0;

export async function GET() {
  const now = Date.now();

  if (cached && now - lastFetched < CACHE_DURATION) {
    return Response.json(cached);
  }

  try {
    const demoPath1 = path.join(process.cwd(), 'public', 'demo.json');
    const demoPath2 = path.join(process.cwd(), 'public', 'demo_2.json');

    const [file1, file2] = await Promise.all([
      fs.readFile(demoPath1, 'utf-8'),
      fs.readFile(demoPath2, 'utf-8'),
    ]);

    const data1 = JSON.parse(file1);
    const data2 = JSON.parse(file2);

    const readings = [...data1, ...data2];

    if (!readings.length) {
      return Response.json({
        temperature: null,
        humidity: null,
        power: null,
        light: null,
      });
    }

    function avg(key) {
      const vals = readings
        .map(r => parseFloat(r[key]))
        .filter(v => !isNaN(v));

      if (!vals.length) return null;

      return Number(
        vals.reduce((a, b) => a + b, 0) / vals.length
      ).toFixed(1);
    }

    const data = {
      temperature: avg('temperature'),
      humidity: avg('humidity'),
      power: avg('power'),
      light: avg('light'),
    };

    cached = data;
    lastFetched = now;

    return Response.json(data);
  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}