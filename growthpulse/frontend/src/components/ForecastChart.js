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

function ForecastChart({ refresh }) {  // ✅ add { refresh }
  const [forecastData, setForecastData] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/forecast-sales/")
      .then(res => setForecastData(res.data))
      .catch(err => console.error(err));
  }, [refresh]);


  return (
    <div style={{ margin: "20px" }}>
      <h2>🔮 Forecasted Sales (Next 30 Days)</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={forecastData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="predicted_sales" stroke="#82ca9d" name="Predicted Sales" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ForecastChart;
