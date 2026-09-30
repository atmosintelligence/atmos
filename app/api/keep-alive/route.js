import { keepSupabaseAlive } from "@/lib/keep-alive";

export async function GET() {
  try {
    const result = await keepSupabaseAlive();

    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
