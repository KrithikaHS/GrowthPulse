import "../styles/KPICards.css";

export default function KpiSummary({ kpis }) {
  if (!kpis) return null;

  return (
    <div className="kpi-grid">
      <div className="kpi-card">Total Sales: {kpis.total_sales}</div>
      <div className="kpi-card">Average Sales: {kpis.average_sales}</div>
      <div className="kpi-card">Best Month: {kpis.best_month} ({kpis.best_month_sales})</div>
      <div className="kpi-card">Worst Month: {kpis.worst_month} ({kpis.worst_month_sales})</div>
      <div className="kpi-card">Growth %: {kpis.growth_percentage}%</div>
      {kpis.yoy_growth !== null && (
        <div className="kpi-card">YoY Growth: {kpis.yoy_growth}%</div>
      )}
    </div>
  );
}
