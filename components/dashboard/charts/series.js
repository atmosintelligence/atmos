// Turns raw readings into chart points for a time range. Points are averaged into buckets
// (15 minutes, 1 hour or 4 hours) so a month of data stays light and readable. The range
// ends at the newest reading, so a device that went quiet still shows its last stretch.

const RANGE_MS  = { '24h': 86_400_000, '7d': 7 * 86_400_000, '30d': 30 * 86_400_000 };
const BUCKET_MS = { '24h': 15 * 60_000, '7d': 3_600_000, '30d': 4 * 3_600_000 };

const timeOf = r => new Date(r.timestamp).getTime();
const num = v => (v === null || v === undefined || v === '' || Number.isNaN(parseFloat(v)) ? null : parseFloat(v));

export function bucketReadings(readings, range = '24h') {
  if (!readings?.length) return [];
  const end    = Math.max(...readings.map(timeOf));
  const start  = end - RANGE_MS[range];
  const bucket = BUCKET_MS[range];
  const groups = new Map();

  for (const r of readings) {
    const t = timeOf(r);
    if (t < start || Number.isNaN(t)) continue;
    const key = Math.floor(t / bucket) * bucket;
    const g = groups.get(key) ?? { t: key, temp: [], hum: [], lux: [], occ: [] };
    const temp = num(r.temperature ?? r.temp_c), hum = num(r.humidity ?? r.humidity_pct), lux = num(r.light ?? r.light_lux);
    if (temp !== null) g.temp.push(temp);
    if (hum  !== null) g.hum.push(hum);
    if (lux  !== null) g.lux.push(lux);
    if (r.occupancy === true || r.occupancy === 'true' || r.occupancy === 1) g.occ.push(1);
    else if (r.occupancy === false || r.occupancy === 'false' || r.occupancy === 0) g.occ.push(0);
    groups.set(key, g);
  }

  const avg = a => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : null);
  return [...groups.values()].sort((a, b) => a.t - b.t).map(g => ({
    t:    g.t,
    temp: avg(g.temp) === null ? null : Number(avg(g.temp).toFixed(1)),
    hum:  avg(g.hum)  === null ? null : Math.round(avg(g.hum)),
    lux:  avg(g.lux)  === null ? null : Math.round(avg(g.lux)),
    occupied: avg(g.occ) === null ? null : Math.round(avg(g.occ)),   // 1 when the room was mostly occupied
  }));
}

export const tickFormat = range => ts =>
  range === '24h'
    ? new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
    : new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export const fullTime = ts =>
  new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })
    .replace('am', 'AM').replace('pm', 'PM');
