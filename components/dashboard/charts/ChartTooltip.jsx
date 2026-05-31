'use client';

export default function ChartTooltip({ active, payload, label, fmt }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:    'rgba(15,15,15,0.95)',
      border:        '1px solid rgba(255,255,255,0.08)',
      borderRadius:  '0.5rem',
      padding:       '0.625rem 0.875rem',
      fontSize:      '0.72rem',
      boxShadow:     '0 4px 24px rgba(0,0,0,0.5)',
      pointerEvents: 'none',
      maxWidth:      '200px',
    }}>
      {label && (
        <div style={{ color: '#737373', marginBottom: '0.375rem', fontSize: '0.68rem', fontWeight: 500 }}>
          {label}
        </div>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: i > 0 ? '0.25rem' : 0 }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '2px', background: p.color, flexShrink: 0 }} />
          <span style={{ color: '#737373' }}>{p.name}:</span>
          <span style={{ color: '#e8e8e8', fontWeight: 600 }}>
            {fmt ? fmt(p.value, p.name) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}