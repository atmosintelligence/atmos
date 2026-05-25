import { createClient } from '@/utils/supabase/client';

export async function getTariff() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 10;
  const { data } = await supabase
    .from('profiles')
    .select('tariff_rate')
    .eq('id', user.id)
    .single();
  return data?.tariff_rate ?? 10;
}

export async function saveTariff(rate) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase
    .from('profiles')
    .update({ tariff_rate: rate })
    .eq('id', user.id);
  return !error;
}