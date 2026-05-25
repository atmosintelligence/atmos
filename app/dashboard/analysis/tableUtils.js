export function getColStats(rows, key) {
  const vals = rows.map(r => parseFloat(r[key])).filter(v => !isNaN(v));
  if (!vals.length) return { min: 0, max: 1 };
  return { min: Math.min(...vals), max: Math.max(...vals) };
}

export function scaleColor(value, stats) {
  const { min, max } = stats;
  if (max === min || isNaN(parseFloat(value))) return {};
  const ratio = (parseFloat(value) - min) / (max - min);
  const light = Math.round(160 + ratio * 80);
  return { color: `rgb(${light},${light},${light})` };
}

export function fmtDate(str) {
  return new Date(str).toLocaleString('en-GB', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).replace('am', 'AM').replace('pm', 'PM');
}

export function tdBase(extra = {}) {
  return { padding: '0.6rem 1rem', whiteSpace: 'nowrap', ...extra };
}