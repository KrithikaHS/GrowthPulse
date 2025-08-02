import ForecastChart from "../components/ForecastChart";
import SalesChart from "../components/SalesChart";
import SimulationPanel from "../components/SimulationPanel";
import UploadSales from "../components/UploadSales";

export default function Dashboard() {
  return (
    <div>
      {/* Upload Sales Data */}
      <section style={{ marginBottom: "40px" }}>
        <h2>Upload Sales Data</h2>
        <UploadSales />
      </section>

      {/* Sales Overview */}
      <section style={{ marginBottom: "40px" }}>
        <h2>Sales Overview</h2>
        <div style={{ width: "100%", height: 400 }}>
          <SalesChart />
        </div>
      </section>

      {/* Forecast Chart */}
      <section style={{ marginBottom: "40px" }}>
        <h2>Sales Forecast</h2>
        <div style={{ width: "100%", height: 400 }}>
          <ForecastChart />
        </div>
      </section>

      {/* Simulation Panel */}
      <section>
        <h2>Sales Simulation</h2>
        <SimulationPanel />
      </section>
    </div>
  );
}
