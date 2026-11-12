import Icon from '@/components/Icon';

// One number with a label. Give it an icon and a tone for the larger tile.
export default function Stat({ label, value, sub, icon, tone, accent }) {
  return (
    <div className={`dash-stat${icon ? ' big' : ''}`} style={tone ? { '--tone': tone } : undefined}>
      {icon && <div className="dash-stat-icon"><Icon name={icon} size={22} /></div>}
      <div className="dash-stat-label">{label}</div>
      <div className="dash-stat-value" style={accent ? { color: 'var(--color-primary-dark)' } : undefined}>{value}</div>
      {sub && <div className="dash-stat-sub">{sub}</div>}
    </div>
  );
}
