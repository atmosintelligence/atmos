'use client';

import Icon from '@/components/Icon';

const GROUP_ICON = {
  Lighting: 'lightbulb', HVAC: 'ac', Humidity: 'droplet', Standby: 'plug', Power: 'plug', Trends: 'trendsAnalysis', General: 'info',
};

function formatReadingTime(value) {
  if (!value) return null;
  return new Date(value)
    .toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })
    .replace('am', 'AM')
    .replace('pm', 'PM');
}

// One recommendation. Pass onAcknowledge to show a "Mark as done" button: acknowledged
// recommendations are what count as savings on the Overview.
export default function OptCard({ opt, onAcknowledge, acknowledged = false }) {
  const readingTime = formatReadingTime(opt.timestamp);
  const saving = opt.saving?.inr != null ? Number(opt.saving.inr) : null;

  return (
    <article className={`dash-opt-card ${opt.severity}${acknowledged ? ' acked' : ''}`}>
      <div className="dash-opt-head">
        <span className={`dash-opt-badge ${opt.group}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <Icon name={GROUP_ICON[opt.group] ?? 'info'} size={12} strokeWidth={2.25} />
          {opt.group}
        </span>
        <h3 className="dash-opt-title">{opt.title}</h3>
        {readingTime && <span className="dash-opt-time" title="Time of the sensor reading">{readingTime}</span>}
      </div>
      <p className="dash-opt-message">{opt.message}</p>
      <div className="dash-opt-foot">
        <span className="dash-opt-saving">
          {saving ? `Estimated saving: ₹${saving.toFixed(saving < 10 ? 2 : 0)}` : ''}
        </span>
        {onAcknowledge && (
          acknowledged
            ? <span className="dash-opt-saving" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Icon name="check" size={14} /> Done</span>
            : <button type="button" className="dash-btn ghost sm" onClick={onAcknowledge}><Icon name="check" size={14} /> Mark as done</button>
        )}
      </div>
    </article>
  );
}
