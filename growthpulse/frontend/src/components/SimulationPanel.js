// src/components/SimulationPanel.js
import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function SimulationPanel() {
  const [growthRate, setGrowthRate] = useState(5); // %
  const [months, setMonths] = useState(6);
  const [data, setData] = useState([]);

  const runSimulation = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/simulate-sales/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          growth_rate: growthRate / 100, // Convert % to decimal
          months: months
        }),
      });
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Simulation error:", err);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <label>
          Growth Rate (%):{" "}
          <input
            type="number"
            value={growthRate}
            onChange={(e) => setGrowthRate(Number(e.target.value))}
            style={{ width: "80px" }}
          />
        </label>
        <label style={{ marginLeft: "20px" }}>
          Forecast Months:{" "}
          <input
            type="number"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            style={{ width: "80px" }}
          />
        </label>
        <button
          onClick={runSimulation}
          style={{
            marginLeft: "20px",
            padding: "5px 10px",
            background: "blue",
            color: "white",
            border: "none",
            borderRadius: "5px"
          }}
        >
          Run Simulation
        </button>
      </div>

      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="#ff7300" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
