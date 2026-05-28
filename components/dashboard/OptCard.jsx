const GROUP_COLORS = {
  Lighting: 'bg-yellow-500/10 text-yellow-500',
  HVAC:     'bg-blue-400/10 text-blue-400',
  Humidity: 'bg-blue-400/10 text-blue-400',
  Power:    'bg-red-500/10 text-red-500',
  Trends:   'bg-purple-400/10 text-purple-400',
};

const SEVERITY_BORDER = {
  critical: 'text-red-500 bg-red-500/8 border-red-500/20',
  warning:  'text-yellow-500 bg-yellow-500/8 border-yellow-500/20',
  info:     'text-blue-400 bg-blue-400/8 border-blue-400/20',
};

export default function OptCard({ opt, lastContacted }) {
  return (
    <div className={`dash-opt-card ${opt.severity} ${SEVERITY_BORDER[opt.group]}`}>
      <div className="dash-opt-meta">
        <span className={`dash-opt-badge ${GROUP_COLORS[opt.group] ?? 'bg-neutral-500/10 text-neutral-500'} text-xs font-semibold px-2 py-0.5 rounded-full`}>
          {opt.group}
        </span>
        <span className="dash-opt-rule">{opt.title}</span>
        <span className="dash-opt-time">{lastContacted ?? 'Never'}</span>
      </div>
      <p className="dash-opt-message">{opt.message}</p>
      {opt.saving && (
        <p className="dash-opt-saving">Estimated saving: ₹{opt.saving.inr}{opt.saving.kwh ? ` · ${opt.saving.kwh} kWh` : ''}</p>
      )}
    </div>
  );
}