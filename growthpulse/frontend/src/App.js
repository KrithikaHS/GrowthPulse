// // frontend/src/App.js
// import { useState } from "react";
// import ForecastChart from "./components/ForecastChart";
// import KPICards from "./components/KPICards";
// import SalesChart from "./components/SalesChart";
// import SimulationPanel from "./components/SimulationPanel";
// import UploadSales from "./components/UploadSales";
// import DashboardChart from "./pages/Dashboard";

// function App() {
//   const [kpi, setKpi] = useState(null);

//   return (
//     <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
//       <h1>📊 Trend Analysis Dashboard</h1>

//       {/* Upload Section */}
//       <section>
//         <h2>Upload Sales Data</h2>
//         <UploadSales onKPIUpdate={setKpi} />
//       </section>

//       {/* KPI Summary */}
//       <section>
//         <h2>KPI Summary</h2>
//         <KPICards kpi={kpi} />
//       </section>

//       {/* Charts */}
//       <section>
//         <h2>Sales Overview</h2>
//         <SalesChart />
//       </section>

//       <section>
//         <h2>Sales Forecast</h2>
//         <ForecastChart />
//       </section>

//       <section>
//         <h2>Simulation</h2>
//         <SimulationPanel />
//       </section>
//        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
//       <h1 style={{ textAlign: "center" }}>📈 GrowthPulse Analytics</h1>

//       {/* Upload Section */}
//       <section style={{ marginBottom: "40px" }}>
//         <h2>Upload Sales Data</h2>
//         <UploadSales />
//       </section>

//       {/* Combined Historical + Forecast Dashboard */}
//       <section>
//         <DashboardChart />
//       </section>
//     </div>
//     </div>
//   );
// }

// export default App;
// frontend/src/App.js
// src/App.js
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <Dashboard />
    </div>
  );
}

export default App;

