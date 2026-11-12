// Small helpers shared by the analysis tables.

export function fmtDate(str) {
  return new Date(str).toLocaleString('en-IN', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).replace('am', 'AM').replace('pm', 'PM');
}

export const rupees = n => `₹${Number(n).toFixed(Number(n) < 10 ? 2 : 0)}`;
export const sum = (rows, key) => rows.reduce((total, r) => total + Number(r[key] || 0), 0);

// Groups events by calendar day and adds up `key`. Returns [{ day, value }] oldest first.
export function byDay(events, key, valueName = 'value') {
  const map = new Map();
  for (const e of events) {
    const label = new Date(e.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    map.set(label, (map.get(label) ?? 0) + Number(e[key] || 0));
  }
  return [...map.entries()].map(([day, value]) => ({ day, [valueName]: Number(value.toFixed(2)) }));
}

// The most recent `n` rows, newest first.
export const latest = (rows, n = 12) => [...rows].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, n);
