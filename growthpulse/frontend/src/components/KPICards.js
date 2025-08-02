// frontend/src/components/KPICards.js
import "./KPICards.css";

export default function KPICards({ kpi }) {
  if (!kpi) return null;

  const cards = [
    { label: "💰 Total Sales", value: kpi.total_sales },
    { label: "📊 Average Sales", value: kpi.average_sales },
    { label: "🏆 Best Month", value: `${kpi.best_month} (${kpi.best_month_sales})` },
    { label: "📉 Worst Month", value: `${kpi.worst_month} (${kpi.worst_month_sales})` },
    { label: "🚀 Growth %", value: `${kpi.growth_percentage}%` },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((c, i) => (
        <div key={i} className="kpi-card">
          <h3>{c.label}</h3>
          <p>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
