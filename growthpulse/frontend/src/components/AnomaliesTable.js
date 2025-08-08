import "../styles/AnomaliesTable.css";

export default function AnomaliesTable({ anomalies }) {
  if (!anomalies || anomalies.length === 0) return null;

  return (
    <div className="anomalies-container">
      <h3>Detected Anomalies</h3>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Sales</th>
          </tr>
        </thead>
        <tbody>
          {anomalies.map((a, i) => (
            <tr key={i}>
              <td>{a.month}</td>
              <td>{a.sales}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
