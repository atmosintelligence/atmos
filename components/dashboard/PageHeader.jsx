// Title block at the top of every dashboard page.
export default function PageHeader({ title, sub, actions, id = 'page-title' }) {
  return (
    <header className="dash-greeting">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 id={id} className="dash-greeting-name">{title}</h1>
          {sub && <p className="dash-greeting-sub">{sub}</p>}
        </div>
        {actions && <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>{actions}</div>}
      </div>
    </header>
  );
}
