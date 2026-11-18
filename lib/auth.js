// Browser-side sign-in only: log in, sign up, log out, change password.
// No table is read or written here. Account data goes through our API routes
// (see lib/api.js), which use lib/server/db.js.

import { createBrowserClient } from '@supabase/ssr';

let client = null;
function auth() {
  if (!client) client = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return client.auth;
}

export async function getCurrentUser() {
  try {
    const { data: { user } } = await auth().getUser();
    return user ?? null;
  } catch {
    return null;
  }
}

export async function signIn(email, password) {
  const { error } = await auth().signInWithPassword({ email, password });
  return { error };
}

export async function signUp({ email, password, metadata }) {
  const { error } = await auth().signUp({ email, password, options: { data: metadata } });
  return { error };
}

export async function signOut() {
  await auth().signOut();
}

// Returns an unsubscribe function.
export function onAuthChange(callback) {
  const { data } = auth().onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

// Re-checks the current password, then sets the new one.
export async function changePassword(currentPassword, newPassword) {
  const user = await getCurrentUser();
  if (!user) return { error: { message: 'Not signed in.' } };

  const { error: wrong } = await auth().signInWithPassword({ email: user.email, password: currentPassword });
  if (wrong) return { error: { message: 'Current password is incorrect.' } };

  const { error } = await auth().updateUser({ password: newPassword });
  return { error };
}
