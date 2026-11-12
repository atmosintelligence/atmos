import OptCard from './OptCard';

// Recommendations always sit at the bottom of an analysis page.
export default function Recommendations({ items, empty }) {
  return (
    <section aria-labelledby="recs-title">
      <div className="dash-section-title" id="recs-title">Recommendations</div>
      {items.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {items.map((opt, i) => <OptCard key={i} opt={opt} />)}
        </div>
      ) : (
        <div className="dash-empty">{empty}</div>
      )}
    </section>
  );
}
