// src/components/SalesChart.js
import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function SalesChart({ refreshTrigger }) {
  const [data, setData] = useState([]);

  useEffect(() => {
  fetch("http://localhost:8000/api/sales-data/")
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setData(data);
      } else {
        setData([]);
      }
    })
    .catch(() => setData([]));
}, []);
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="sales" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
