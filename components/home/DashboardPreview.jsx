// A small, drawn-in-code picture of the Atmos dashboard for the home page. It keeps the
// green-glow grid background of the old placeholder and needs no image download.

const ALERTS = [
  { tone: '#f59e0b', tag: 'HVAC',    title: 'AC running in an empty room', saving: '₹8.40' },
  { tone: '#ef4444', tag: 'Standby', title: 'Idle devices left on',         saving: '₹11.02' },
  { tone: '#60a5fa', tag: 'Trends',  title: 'Less waste than last week',     saving: null },
];

// Avoidable energy per day, last 7 days (kWh), falling as habits change.
const WEEK = [2.9, 2.6, 2.7, 2.1, 1.8, 1.5, 1.2];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function Bars() {
  const max = Math.max(...WEEK);
  return (
    <div className="flex items-end gap-[6%] h-full">
      {WEEK.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
          <div
            className="w-full rounded-[3px]"
            style={{
              height: `${(v / max) * 78}%`,
              background: i === WEEK.length - 1 ? '#4ADE80' : 'rgba(74,222,128,0.35)',
            }}
          />
          <span className="text-[8px] sm:text-[9px] leading-none" style={{ color: 'rgba(255,255,255,0.45)' }}>{DAYS[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPreview() {
  return (
    <div
      role="img"
      aria-label="The Atmos dashboard: money and energy saved, a chart of waste falling over the week, and the alerts to act on next."
      className="relative w-full overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 sm:aspect-[16/10]"
      style={{
        background:
          'radial-gradient(60% 70% at 50% 0%, rgba(74,222,128,0.16), transparent), linear-gradient(#101311, #101311)',
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(rgba(74,222,128,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.07) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div aria-hidden="true" className="relative h-full flex flex-col gap-2.5 sm:gap-3 p-3.5 sm:p-5 text-white">
        {/* window bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-heading text-[11px] sm:text-xs font-black tracking-tight">ATMOS<span style={{ color: '#4ADE80' }}>.</span></span>
            <span className="text-[10px] sm:text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Overview · Main office</span>
          </div>
          <span className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-semibold rounded-full px-2 py-0.5" style={{ background: 'rgba(74,222,128,0.12)', color: '#4ADE80' }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#4ADE80' }} /> Live
          </span>
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Money saved', value: '₹1,240', tone: '#4ADE80' },
            { label: 'Energy saved', value: '124 kWh', tone: '#fbbf24' },
            { label: 'CO₂ avoided', value: '90 kg', tone: '#2dd4bf' },
          ].map(s => (
            <div key={s.label} className="rounded-lg px-2.5 py-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-[8px] sm:text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
              <div className="font-heading text-sm sm:text-base font-bold leading-tight mt-0.5" style={{ color: s.tone }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* chart and alerts */}
        <div className="flex-1 grid grid-cols-[38%_1fr] gap-2 min-h-0">
          <div className="rounded-lg p-2.5 flex flex-col" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-[8px] sm:text-[9px] uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Waste this week</div>
            <div className="flex-1 min-h-[4.5rem]"><Bars /></div>
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="text-[8px] sm:text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Do this next</div>
            {ALERTS.map(a => (
              <div key={a.title} className="flex items-center gap-2 rounded-md px-2 py-1.5 min-w-0" style={{ background: 'rgba(255,255,255,0.05)', borderLeft: `2px solid ${a.tone}` }}>
                <span className="text-[7px] sm:text-[8px] font-bold uppercase rounded-full px-1.5 py-0.5 shrink-0" style={{ background: `${a.tone}26`, color: a.tone }}>{a.tag}</span>
                <span className="text-[10px] sm:text-[11px] truncate flex-1" style={{ color: 'rgba(255,255,255,0.85)' }}>{a.title}</span>
                {a.saving && <span className="text-[9px] sm:text-[10px] font-semibold shrink-0" style={{ color: '#4ADE80' }}>{a.saving}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
