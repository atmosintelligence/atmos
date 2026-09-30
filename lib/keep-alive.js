const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function keepSupabaseAlive() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase environment variables are missing.");
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: "GET",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Supabase keep-alive failed: ${response.status} ${response.statusText}`
    );
  }

  return {
    success: true,
    status: response.status,
    timestamp: new Date().toISOString(),
  };
}
