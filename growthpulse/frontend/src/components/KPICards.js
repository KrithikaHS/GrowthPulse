// // frontend/src/components/KPICards.js
// import "./KPICards.css";

// export default function KPICards({ kpi }) {
//   if (!kpi) return null;

//   const cards = [
//     { label: "💰 Total Sales", value: kpi.total_sales },
//     { label: "📊 Average Sales", value: kpi.average_sales },
//     { label: "🏆 Best Month", value: `${kpi.best_month} (${kpi.best_month_sales})` },
//     { label: "📉 Worst Month", value: `${kpi.worst_month} (${kpi.worst_month_sales})` },
//     { label: "🚀 Growth %", value: `${kpi.growth_percentage}%` },
//   ];

//   return (
//     <div className="kpi-grid">
//       {cards.map((c, i) => (
//         <div key={i} className="kpi-card">
//           <h3>{c.label}</h3>
//           <p>{c.value}</p>
//         </div>
//       ))}
//     </div>
//   );
// }
// src/components/KPICards.js
export default function KPICards({ kpi }) {
  if (!kpi || Object.keys(kpi).length === 0) return <p>No KPI data available.</p>;

  const cardStyle = {
    padding: "10px",
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    textAlign: "center",
    flex: "1",
    margin: "0 10px",
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px" }}>
      <div style={cardStyle}>
        <h3>This Month</h3>
        <p style={{ fontSize: "20px", fontWeight: "bold" }}>{kpi.this_month}</p>
      </div>
      <div style={cardStyle}>
        <h3>MoM Growth</h3>
        <p style={{ fontSize: "20px", fontWeight: "bold", color: kpi.mom_growth >= 0 ? "green" : "red" }}>
          {kpi.mom_growth}%
        </p>
      </div>
      <div style={cardStyle}>
        <h3>YoY Growth</h3>
        <p style={{ fontSize: "20px", fontWeight: "bold", color: kpi.yoy_growth >= 0 ? "green" : "red" }}>
          {kpi.yoy_growth !== null ? `${kpi.yoy_growth}%` : "N/A"}
        </p>
      </div>
    </div>
  );
}
