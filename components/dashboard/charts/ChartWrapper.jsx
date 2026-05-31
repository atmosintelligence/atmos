'use client';

export default function ChartWrapper({ title, subtitle, children, height }) {
  return (
    <div>
      <div style={{ marginBottom: subtitle ? '0.375rem' : '1rem' }}>
        <div className="dash-section-title" style={{ marginBottom: 0 }}>{title}</div>
      </div>
      {subtitle && (
        <p style={{ fontSize: '0.75rem', color: '#737373', marginBottom: '1rem', lineHeight: 1.55 }}>
          {subtitle}
        </p>
      )}
      <div className="card" style={{ padding: '1.25rem 1rem 0.875rem', height: height ?? 'auto' }}>
        {children}
      </div>
    </div>
  );
}