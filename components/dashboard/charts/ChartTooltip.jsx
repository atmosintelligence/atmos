'use client';

// Hover card shared by every chart. `fmt(value, seriesName)` formats each number.
export default function ChartTooltip({ active, payload, label, fmt, labelFmt }) {
  if (!active || !payload?.length) return null;
  const title = labelFmt ? labelFmt(label, payload) : label;

  return (
    <div role="status" style={{
      background: 'rgba(17,17,17,0.96)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.625rem',
      padding: '0.625rem 0.875rem', fontSize: '0.75rem', pointerEvents: 'none', maxWidth: '16rem',
      boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
    }}>
      {title && <div style={{ color: '#a3a3a3', marginBottom: '0.375rem', fontSize: '0.7rem', fontWeight: 500 }}>{title}</div>}
      {payload.filter(p => p.value != null).map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: i ? '0.25rem' : 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color ?? p.stroke ?? p.fill, flexShrink: 0 }} />
          <span style={{ color: '#a3a3a3' }}>{p.name}</span>
          <span style={{ color: '#f5f5f5', fontWeight: 600, marginLeft: 'auto', paddingLeft: '0.75rem' }}>
            {fmt ? fmt(p.value, p.name) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}
