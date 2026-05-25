export default function TableWrapper({ headers, children }) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: '0.875rem', border: '1px solid rgba(0,0,0,0.08)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            {headers.map(h => (
              <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#737373', background: 'rgba(0,0,0,0.02)', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}