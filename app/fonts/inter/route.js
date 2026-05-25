import { readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'app/fonts/Inter.ttf');

  const buffer = await readFile(filePath);

  return new Response(buffer, {
    headers: {
      'Content-Type': 'font/ttf',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}