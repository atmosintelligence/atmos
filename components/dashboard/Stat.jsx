export default function Stat({ label, value, sub, accent }) {
  return (
    <div className="dash-stat">
      <div className="dash-stat-value" style={accent ? { color: 'var(--color-primary-dark)' } : {}}>{value}</div>
      <div className="dash-stat-label">{label}</div>
      {sub && <div style={{ fontSize: '0.65rem', color: '#a3a3a3', marginTop: '0.1rem' }}>{sub}</div>}
    </div>
  );
}