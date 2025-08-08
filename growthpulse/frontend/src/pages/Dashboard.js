// src/pages/Dashboard.js
import { useEffect, useState } from "react";
import { clearSalesData, fetchForecastData, runSimulation, uploadSalesFile } from "../api";
import Chart from "../components/SalesChart";
import SimulationPanel from "../components/SimulationPanel";
import "./Dashboard.css";

export default function Dashboard() {
  const [forecastData, setForecastData] = useState(null);
  const [kpi, setKpi] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const forecast = await fetchForecastData();
      setForecastData(forecast);
      if (forecast && forecast.kpi) {
        setKpi(forecast.kpi);
      }
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");
    setLoading(true);
    try {
      await uploadSalesFile(file);
      await loadAllData();
    } catch (err) {
      console.error("Upload failed", err);
    }
    setLoading(false);
  };

  return (
    <div className="dashboard">
      {/* Upload Section */}
      <div className="upload-section">
        <h3>Upload Sales Data</h3>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
        <button
          onClick={async () => {
            if (window.confirm("Are you sure you want to clear all sales data?")) {
              await clearSalesData();
              setForecastData(null);
              setKpi(null);
            }
          }}
        >
          Clear Data
        </button>
      </div>

      {/* KPI Section */}
      {kpi && (
        <div className="kpi-container">
          <div className="kpi-card"><strong>Total Sales:</strong> {kpi.total_sales ?? "-"}</div>
          <div className="kpi-card"><strong>Average Sales:</strong> {kpi.average_sales ?? "-"}</div>
          <div className="kpi-card"><strong>Median Sales:</strong> {kpi.median_sales ?? "-"}</div>
          <div className="kpi-card"><strong>Sales Variance:</strong> {kpi.variance_sales ?? "-"}</div>
          <div className="kpi-card"><strong>Std. Dev.:</strong> {kpi.std_dev_sales ?? "-"}</div>
          <div className="kpi-card"><strong>Rolling 3-Month Avg:</strong> {kpi.rolling_3m_avg_last ?? "-"}</div>
          <div className="kpi-card">
            <strong>Best Month:</strong>{" "}
            {kpi.best_month ? `${kpi.best_month} (${kpi.best_month_sales})` : "-"}
          </div>
          <div className="kpi-card">
            <strong>Worst Month:</strong>{" "}
            {kpi.worst_month ? `${kpi.worst_month} (${kpi.worst_month_sales})` : "-"}
          </div>
          <div className="kpi-card"><strong>Growth %:</strong> {kpi.growth_percentage ?? "-"}</div>
          {kpi.yoy_growth !== null && kpi.yoy_growth !== undefined && (
            <div className="kpi-card"><strong>YoY Growth %:</strong> {kpi.yoy_growth}</div>
          )}
          {kpi.target_vs_actual_percentage && (
            <div className="kpi-card"><strong>Target vs Actual:</strong> {kpi.target_vs_actual_percentage}%</div>
          )}
          {kpi.customer_acquisition_cost && (
            <div className="kpi-card"><strong>CAC:</strong> {kpi.customer_acquisition_cost}</div>
          )}
        </div>
      )}

      {/* Chart */}

      {forecastData && (
        
<Chart
  historical={forecastData.historical}
  forecast={forecastData.forecast}
  moving_average={forecastData.moving_average}

  trend={forecastData.trend}
  seasonality={forecastData.seasonality}
  yoy_comparison={forecastData.yoy_comparison}

/>
      )}

      {/* Anomalies */}
      {forecastData?.anomalies?.length > 0 && (
        <div className="anomalies-section">
          <h3>Detected Anomalies</h3>
          <table>
            <thead>
              <tr><th>Month</th><th>Sales</th></tr>
            </thead>
            <tbody>
              {forecastData.anomalies.map((a, i) => (
                <tr key={i}>
                  <td>{new Date(a.month).toLocaleDateString()}</td>
                  <td>{a.sales}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Simulation */}
<SimulationPanel
  onSimulation={async (payload) => {
    const res = await runSimulation(payload); // updated API
    await loadAllData();
    return res;
  }}
/>



    </div>
  );
}
