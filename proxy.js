import { updateSession } from '@/lib/supabase';

// Runs on every page request and keeps the Supabase login cookie fresh.
export async function proxy(request) {
  return updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
