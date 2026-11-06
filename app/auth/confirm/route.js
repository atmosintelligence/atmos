import { exchangeCodeForSession } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  if (code) {
    const { error } = await exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/dashboard`);
  }
  return NextResponse.redirect(`${origin}/auth/error`);
}
