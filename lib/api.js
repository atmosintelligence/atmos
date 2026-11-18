// Browser helpers for the account endpoints. Each one calls our own API route, which
// checks who is asking and then uses lib/server/db.js. Every helper returns { data, error }.

async function call(url, { method = 'GET', body } = {}) {
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { data: null, error: { message: json.error || 'Something went wrong. Try again.' } };
    return { data: json, error: null };
  } catch {
    return { data: null, error: { message: 'Could not reach Atmos. Check your connection.' } };
  }
}

// { id, username, display_name, latitude, longitude, optimization_mode, plan } or null
export async function getProfile() {
  const { data } = await call('/api/account/profile');
  return data?.profile ?? null;
}

// updateProfile({ display_name }) or updateProfile({ optimization_mode: 'rule' })
export async function updateProfile(patch) {
  const { data, error } = await call('/api/account/profile', { method: 'PATCH', body: patch });
  return { profile: data?.profile ?? null, error };
}

export async function getSubscription() {
  const { data } = await call('/api/account/subscription');
  return data?.subscription ?? null;
}

export async function changePlan(plan) {
  const { data, error } = await call('/api/account/subscription', { method: 'PATCH', body: { plan } });
  return { subscription: data?.subscription ?? null, error };
}

export async function hasApiKey() {
  const { data } = await call('/api/account/api-key');
  return Boolean(data?.hasKey);
}

// Creates a new key (replacing any old one). The key is shown once.
export async function createApiKey() {
  const { data, error } = await call('/api/account/api-key', { method: 'POST' });
  return { key: data?.key ?? null, error };
}

export async function revokeApiKey() {
  const { error } = await call('/api/account/api-key', { method: 'DELETE' });
  return { error };
}

// Login with a username: the server finds the email for it.
export async function getEmailForUsername(username) {
  const { data } = await call('/api/account/lookup', { method: 'POST', body: { username } });
  return data?.email ?? null;
}

export async function deleteAccount() {
  const { error } = await call('/api/account', { method: 'DELETE' });
  return { error };
}
