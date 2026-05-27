import { createClient } from '@/utils/supabase/server';

export async function resolveApiUser(request) {
  const supabase = await createClient();

  const authHeader = request.headers.get('Authorization');

  // API key auth
  if (authHeader?.startsWith('Bearer ')) {
    const key = authHeader.slice(7);

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('api_key', key)
      .single();

    if (error || !profile) {
      return null;
    }

    return {
      user: { id: profile.id },
      profile,
      supabase,
    };
  }

  // Session auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return {
    user,
    profile,
    supabase,
  };
}