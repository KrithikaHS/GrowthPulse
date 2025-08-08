// src/components/SalesChart.js
import { Area, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function SalesChart({ historical, forecast, trend, seasonality, yoy_comparison }) {
  // Forecast chart data
  const forecastChartData = [
    ...(historical || []).map(h => ({
      month: new Date(h.month).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      historical: h.sales,
    })),
    ...(forecast || []).map(f => ({
      month: new Date(f.month).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      forecast: f.forecast,
      lower_bound: f.lower_bound,
      upper_bound: f.upper_bound,
    }))
  ];

  // Trend
  const trendData = (trend || []).map(t => ({
    month: new Date(t.ds).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    trend: t.trend
  }));

  // Seasonality
  const seasonalityData = (seasonality || []).map(s => ({
    month: new Date(s.ds).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    seasonal: s.seasonal
  }));

  // YoY
  const yoyData = (yoy_comparison || []).map(y => ({
    month: y.month,
    yoy_growth: y.yoy_growth
  }));

  return (
    <div>
      {/* Forecast */}
      <h3>Sales Forecast</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={forecastChartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />

          {/* Confidence interval shading */}
          <Area type="monotone" dataKey="upper_bound" stroke={false} fill="#82ca9d" fillOpacity={0.2} />
          <Area type="monotone" dataKey="lower_bound" stroke={false} fill="#ffffff" fillOpacity={1} />

          <Line type="monotone" dataKey="historical" stroke="#8884d8" name="Historical Sales" />
          <Line type="monotone" dataKey="forecast" stroke="#82ca9d" name="Forecast" />
        </LineChart>
      </ResponsiveContainer>

      {/* Trend */}
      <h3>Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="trend" stroke="#ff7300" />
        </LineChart>
      </ResponsiveContainer>

      {/* Seasonality */}
      <h3>Seasonality</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={seasonalityData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="seasonal" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>

      {/* YoY */}
      <h3>Year-over-Year Growth</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={yoyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis unit="%" />
          <Tooltip />
          <Line type="monotone" dataKey="yoy_growth" stroke="#d9534f" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
