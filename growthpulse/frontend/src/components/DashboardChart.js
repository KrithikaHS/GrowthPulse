// frontend/src/pages/Dashboard.js
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ReferenceDot,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import SimulationPanel from "../components/SimulationPanel";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [kpi, setKpi] = useState({});
  const [anomalies, setAnomalies] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/forecast-sales/")
      .then((res) => {
        console.log("Forecast API Response:", res.data);

        const historical = res.data.historical.map((d) => ({
          month: dayjs(d.month).format("MMM YYYY"),
          sales: d.sales,
        }));

        const forecast = res.data.forecast.map((d) => ({
          month: dayjs(d.month).format("MMM YYYY"),
          forecast: d.forecast,
        }));

        // Merge historical + forecast
        const merged = [...historical, ...forecast];

        setData(merged);
        setKpi(res.data.kpi || {});
        setAnomalies(
          (res.data.anomalies || []).map((a) => ({
            ...a,
            month: dayjs(a.month).format("MMM YYYY"),
          }))
        );
      })
      .catch((err) => {
        console.error("Error fetching forecast data", err);
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>📊 Sales Overview & Forecast</h2>

      {/* KPI Cards */}
      <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px", flexWrap: "wrap" }}>
        <KpiCard title="This Month" value={kpi.this_month} />
        <KpiCard title="MoM Growth" value={`${kpi.mom_growth}%`} color={kpi.mom_growth >= 0 ? "green" : "red"} />
        <KpiCard title="YoY Growth" value={kpi.yoy_growth !== null ? `${kpi.yoy_growth}%` : "N/A"} />
        <KpiCard title="Best Month" value={`${kpi.best_month || "-"} (${kpi.best_month_sales || "-"})`} />
        <KpiCard title="Worst Month" value={`${kpi.worst_month || "-"} (${kpi.worst_month_sales || "-"})`} />
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />

          {/* Historical Sales */}
          <Line type="monotone" dataKey="sales" stroke="#8884d8" name="Historical Sales" />

          {/* Forecast Sales */}
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#82ca9d"
            name="Forecast"
            strokeDasharray="5 5"
          />

          {/* Average Sales Reference Line */}
          {data.length > 0 && (
            <ReferenceLine
              y={averageSales(data)}
              label={{ value: "Average Sales", position: "right" }}
              stroke="orange"
              strokeDasharray="3 3"
            />
          )}

          {/* Anomaly Markers */}
          {anomalies.map((a, index) => (
            <ReferenceDot
              key={index}
              x={a.month}
              y={a.sales}
              r={6}
              fill="red"
              stroke="none"
              label={{ value: "⚠", position: "top" }}
            />
          ))}

          {/* Spike & Drop Annotations */}
          {spikeAnnotations(data).map((ann, index) => (
            <ReferenceDot
              key={`spike-${index}`}
              x={ann.month}
              y={ann.sales}
              r={6}
              fill={ann.type === "spike" ? "green" : "blue"}
              label={{ value: ann.label, position: "top" }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Simulation Panel */}
      <section style={{ marginTop: "40px" }}>
        <h2>What-if Simulation</h2>
        <SimulationPanel />
      </section>
    </div>
  );
}

function KpiCard({ title, value, color }) {
  return (
    <div style={cardStyle}>
      <h3>{title}</h3>
      <p style={{ fontSize: "20px", fontWeight: "bold", color: color || "black" }}>{value}</p>
    </div>
  );
}

const cardStyle = {
  padding: "10px",
  background: "white",
  borderRadius: "8px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  textAlign: "center",
  flex: "1",
  margin: "10px",
  minWidth: "150px"
};

function averageSales(data) {
  const salesValues = data.map((d) => d.sales).filter(Boolean);
  return salesValues.reduce((a, b) => a + b, 0) / salesValues.length || 0;
}

function spikeAnnotations(data) {
  let annotations = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i].sales && data[i - 1].sales) {
      let change = ((data[i].sales - data[i - 1].sales) / data[i - 1].sales) * 100;
      if (change >= 20) {
        annotations.push({ month: data[i].month, sales: data[i].sales, type: "spike", label: "📈 Spike" });
      } else if (change <= -20) {
        annotations.push({ month: data[i].month, sales: data[i].sales, type: "drop", label: "📉 Drop" });
      }
    }
  }
  return annotations;
}
