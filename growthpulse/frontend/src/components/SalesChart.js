import axios from "axios";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from "recharts";

function SalesChart({ refresh }) {  // ✅ add { refresh }
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/sales-data/")
      .then(res => setSalesData(res.data))
      .catch(err => console.error(err));
  }, [refresh]); // ✅ re-fetch when refresh changes

  return (
    <div style={{ margin: "20px" }}>
      <h2>📈 Sales Trends</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={salesData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="units_sold" stroke="#8884d8" name="Units Sold" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SalesChart;
