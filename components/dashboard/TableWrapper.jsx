// A simple table. headers: array of column names; rows go in as <tr> children.
export default function TableWrapper({ headers, children, caption }) {
  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>{headers.map(h => <th key={h} scope="col">{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
