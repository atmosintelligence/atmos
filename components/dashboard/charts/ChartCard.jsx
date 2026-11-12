'use client';

import Segmented from '../Segmented';

// Frame for one chart: title, a short plain-English line on how to read it, optional range
// switch, and an optional legend. Charts are hidden from screen readers and described by
// `summary` instead.
export default function ChartCard({ title, subtitle, summary, range, onRange, ranges, legend, children }) {
  return (
    <section className="dash-card chart-card" aria-label={title}>
      <div className="dash-card-head" style={{ marginBottom: '0.75rem', paddingInline: '0.25rem' }}>
        <div>
          <h3 className="dash-card-title">{title}</h3>
          {subtitle && <p className="dash-card-sub">{subtitle}</p>}
        </div>
        {ranges && <Segmented label={`${title} time range`} value={range} options={ranges} onChange={onRange} />}
      </div>
      {summary && <p className="sr-only">{summary}</p>}
      <div aria-hidden="true">{children}</div>
      {legend && (
        <div className="chart-legend">
          {legend.map(l => <span key={l.label}><i style={{ background: l.color }} />{l.label}</span>)}
        </div>
      )}
    </section>
  );
}

export const RANGES = [
  { value: '24h', label: '24 hours' },
  { value: '7d',  label: '7 days'   },
  { value: '30d', label: '30 days'  },
];
