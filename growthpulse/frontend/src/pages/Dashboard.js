// import ForecastChart from "../components/ForecastChart";
// import SalesChart from "../components/SalesChart";
// import SimulationPanel from "../components/SimulationPanel";
// import UploadSales from "../components/UploadSales";
// // src/components/DashboardChart.js
// import axios from "axios";
// import { useEffect, useState } from "react";
// import {
//   CartesianGrid,
//   Legend,
//   Line,
//   LineChart,
//   ReferenceDot,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";

// export default function Dashboard() {

//   const [data, setData] = useState([]);
//   const [kpi, setKpi] = useState({});
//   const [anomalies, setAnomalies] = useState([]);

//   useEffect(() => {
//     axios
//       .get("http://localhost:8000/api/forecast-sales/")
//       .then((res) => {
//         console.log("Forecast API Response:", res.data);

//         const historical = res.data.historical.map((d) => ({
//           month: d.month,
//           sales: d.sales,
//         }));

//         const forecast = res.data.forecast.map((d) => ({
//           month: d.month,
//           forecast: d.forecast,
//         }));

//         // Merge historical + forecast
//         const merged = [...historical, ...forecast];

//         setData(merged);
//         setKpi(res.data.kpi);
//         setAnomalies(res.data.anomalies || []);
//       })
//       .catch((err) => {
//         console.error("Error fetching forecast data", err);
//       });
//   }, []);
  
//   return (
//     <div>
//       {/* Upload Sales Data */}
//       <section style={{ marginBottom: "40px" }}>
//         <h2>Upload Sales Data</h2>
//         <UploadSales />
//       </section>

//       {/* Sales Overview */}
//       <section style={{ marginBottom: "40px" }}>
//         <h2>Sales Overview</h2>
//         <div style={{ width: "100%", height: 400 }}>
//           <SalesChart />
//         </div>
//       </section>

//       {/* Forecast Chart */}
//       <section style={{ marginBottom: "40px" }}>
//         <h2>Sales Forecast</h2>
//         <div style={{ width: "100%", height: 400 }}>
//           <ForecastChart />
//         </div>
//       </section>

//       {/* Simulation Panel */}
//       <section>
//         <h2>Sales Simulation</h2>
//         <SimulationPanel />
//       </section>
//     <div style={{ padding: "20px" }}>
//       <h2 style={{ textAlign: "center" }}>📊 Sales Overview & Forecast</h2>

//       {/* KPI Cards */}
//       <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px" }}>
//         <div style={cardStyle}>
//           <h3>This Month</h3>
//           <p style={{ fontSize: "20px", fontWeight: "bold" }}>{kpi.this_month}</p>
//         </div>
//         <div style={cardStyle}>
//           <h3>MoM Growth</h3>
//           <p style={{ fontSize: "20px", fontWeight: "bold", color: kpi.mom_growth >= 0 ? "green" : "red" }}>
//             {kpi.mom_growth}%
//           </p>
//         </div>
//         <div style={cardStyle}>
//           <h3>YoY Growth</h3>
//           <p style={{ fontSize: "20px", fontWeight: "bold", color: kpi.yoy_growth >= 0 ? "green" : "red" }}>
//             {kpi.yoy_growth !== null ? `${kpi.yoy_growth}%` : "N/A"}
//           </p>
//         </div>
//       </div>

//       {/* Combined Chart */}
//       <ResponsiveContainer width="100%" height={400}>
//         <LineChart data={data}>
//           <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
//           <XAxis dataKey="month" />
//           <YAxis />
//           <Tooltip />
//           <Legend />

//           {/* Historical Line */}
//           <Line type="monotone" dataKey="sales" stroke="#8884d8" name="Historical Sales" />

//           {/* Forecast Line */}
//           <Line type="monotone" dataKey="forecast" stroke="#82ca9d" name="Forecast" strokeDasharray="5 5" />

//           {/* Anomaly Points */}
//           {anomalies.map((a, index) => (
//             <ReferenceDot
//               key={index}
//               x={a.month}
//               y={a.sales}
//               r={6}
//               fill="red"
//               stroke="none"
//               label={{ value: "⚠", position: "top" }}
//             />
//           ))}
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//     </div>
//   );
// }
// const cardStyle = {
//   padding: "10px",
//   background: "white",
//   borderRadius: "8px",
//   boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
//   textAlign: "center",
//   flex: "1",
//   margin: "0 10px",
// };
// frontend/src/pages/Dashboard.js
// src/pages/Dashboard.js
import axios from "axios";
import { useEffect, useState } from "react";
import DashboardChart from "../components/DashboardChart";
import KPICards from "../components/KPICards";
import SimulationPanel from "../components/SimulationPanel";
import UploadSales from "../components/UploadSales";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [kpi, setKpi] = useState({});
  const [anomalies, setAnomalies] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios
      .get("http://localhost:8000/api/forecast-sales/")
      .then((res) => {
        const historical = res.data.historical.map((d) => ({
          month: d.month,
          sales: d.sales,
        }));

        const forecast = res.data.forecast.map((d) => ({
          month: d.month,
          forecast: d.forecast,
        }));

        setData([...historical, ...forecast]);
        setKpi(res.data.kpi);
        setAnomalies(res.data.anomalies || []);
      })
      .catch((err) => console.error("Error fetching forecast data", err));
  };

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>📈 GrowthPulse Analytics</h1>

      <section style={{ marginBottom: "40px" }}>
        <h2>Upload Sales Data</h2>
        <UploadSales onUploadComplete={fetchData} />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>KPI Summary</h2>
        <KPICards kpi={kpi} />
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2>Sales Overview + Forecast</h2>
        <DashboardChart data={data} anomalies={anomalies} />
      </section>

      <section>
        <h2>What-if Simulation</h2>
        <SimulationPanel />
      </section>
    </div>
  );
}
