// // src/components/SimulationPanel.js
// import { useState } from "react";
// import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// export default function SimulationPanel() {
//   const [growthRate, setGrowthRate] = useState(5); // %
//   const [months, setMonths] = useState(6);
//   const [data, setData] = useState([]);

//   const runSimulation = async () => {
//     try {
//       const res = await fetch("http://127.0.0.1:8000/api/simulate-sales/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           growth_rate: growthRate / 100, // Convert % to decimal
//           months: months
//         }),
//       });
//       const result = await res.json();
//       setData(result);
//     } catch (err) {
//       console.error("Simulation error:", err);
//     }
//   };

//   return (
//     <div>
//       <div style={{ marginBottom: "20px" }}>
//         <label>
//           Growth Rate (%):{" "}
//           <input
//             type="number"
//             value={growthRate}
//             onChange={(e) => setGrowthRate(Number(e.target.value))}
//             style={{ width: "80px" }}
//           />
//         </label>
//         <label style={{ marginLeft: "20px" }}>
//           Forecast Months:{" "}
//           <input
//             type="number"
//             value={months}
//             onChange={(e) => setMonths(Number(e.target.value))}
//             style={{ width: "80px" }}
//           />
//         </label>
//         <button
//           onClick={runSimulation}
//           style={{
//             marginLeft: "20px",
//             padding: "5px 10px",
//             background: "blue",
//             color: "white",
//             border: "none",
//             borderRadius: "5px"
//           }}
//         >
//           Run Simulation
//         </button>
//       </div>

//       {data.length > 0 && (
//         <ResponsiveContainer width="100%" height={300}>
//           <LineChart data={data}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="month" />
//             <YAxis />
//             <Tooltip />
//             <Line type="monotone" dataKey="sales" stroke="#ff7300" />
//           </LineChart>
//         </ResponsiveContainer>
//       )}
//     </div>
//   );
// }
// src/components/SimulationPanel.js
import axios from "axios";
import { useState } from "react";

export default function SimulationPanel() {
  const [growthRate, setGrowthRate] = useState(0.05);
  const [months, setMonths] = useState(6);
  const [results, setResults] = useState([]);

  const runSimulation = () => {
    axios
      .post("http://localhost:8000/api/simulate-sales/", {
        growth_rate: growthRate,
        months: months,
      })
      .then((res) => setResults(res.data))
      .catch((err) => console.error("Simulation error", err));
  };

  return (
    <div>
      <label>Growth Rate (%): </label>
      <input
        type="number"
        step="0.01"
        value={growthRate}
        onChange={(e) => setGrowthRate(parseFloat(e.target.value))}
      />

      <label style={{ marginLeft: "10px" }}>Months: </label>
      <input
        type="number"
        value={months}
        onChange={(e) => setMonths(parseInt(e.target.value))}
      />

      <button onClick={runSimulation} style={{ marginLeft: "10px" }}>
        Run Simulation
      </button>

      {results.length > 0 && (
        <ul style={{ marginTop: "10px" }}>
          {results.map((r, idx) => (
            <li key={idx}>
              {r.month}: {r.sales}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
