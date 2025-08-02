import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export default function ForecastChart() {
  const [forecastData, setForecastData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/forecast-sales/")
      .then((res) => res.json())
      .then((data) => {
        console.log("Forecast API Response:", data);
        if (Array.isArray(data) && data.length > 0) {
          // Ensure proper date format
          const formatted = data.map((d) => ({
            month: new Date(d.month).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            }),
            forecast: Number(d.forecast),
          }));
          setForecastData(formatted);
        }
      })
      .catch((err) => console.error("Error fetching forecast:", err));
  }, []);

  return (
    <div style={{ width: "100%", height: 400 }}>
      <h2>📈 Sales Forecast</h2>
      <ResponsiveContainer>
        <LineChart data={forecastData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
