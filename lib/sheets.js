const SHEETS_URL = process.env.SHEETS_API_URL;

export async function fetchUserReadings(username) {
  if (!SHEETS_URL) throw new Error('SHEETS_API_URL not set');
  const res = await fetch(`${SHEETS_URL}?username=${encodeURIComponent(username)}&sheet=Hardware`, {
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Sheets request failed: ${res.status}`);
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return json.data ?? [];
  } catch {
    throw new Error(`Sheets returned non-JSON: ${text.slice(0, 200)}`);
  }
}

export async function fetchUserDevices(username) {
  if (!SHEETS_URL) throw new Error('SHEETS_API_URL not set');
  const res = await fetch(`${SHEETS_URL}?username=${encodeURIComponent(username)}&sheet=Devices`, {
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Sheets request failed: ${res.status}`);
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return json.data ?? [];
  } catch {
    throw new Error(`Sheets returned non-JSON: ${text.slice(0, 200)}`);
  }
}

export async function postReading(payload) {
  if (!SHEETS_URL) throw new Error('SHEETS_API_URL not set');
  const res = await fetch(SHEETS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'addReading', ...payload }),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error('Failed to post to Google Sheets');
  return res.json();
}