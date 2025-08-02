import axios from "axios";
import { useEffect, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function SimulationPanel() {
  const [factorsConfig, setFactorsConfig] = useState({});
  const [formValues, setFormValues] = useState({});
  const [forecastData, setForecastData] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/simulation-factors/")
      .then(res => {
        setFactorsConfig(res.data);
        // Initialize default values
        const defaults = {};
        Object.entries(res.data).forEach(([key, cfg]) => {
          defaults[key] = cfg.type === "slider" ? 0 : "No Change";
        });
        setFormValues(defaults);
      })
      .catch(err => console.error(err));
  }, []);

  const runSimulation = () => {
    axios.post("http://127.0.0.1:8000/api/forecast-sales-simulation/", formValues)
      .then(res => setForecastData(res.data))
      .catch(err => console.error(err));
  };

  const handleChange = (key, value) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>🔮 What‑If Simulation</h2>

      {Object.entries(factorsConfig).map(([key, cfg]) => (
        <div key={key} style={{ marginBottom: "15px" }}>
          <label>{cfg.label}: </label>
          {cfg.type === "slider" ? (
            <>
              <input
                type="range"
                min={cfg.min}
                max={cfg.max}
                value={formValues[key]}
                onChange={(e) => handleChange(key, Number(e.target.value))}
              />
              <span>{formValues[key]}%</span>
            </>
          ) : cfg.type === "dropdown" ? (
            <select value={formValues[key]} onChange={(e) => handleChange(key, e.target.value)}>
              {cfg.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : null}
        </div>
      ))}

      <button onClick={runSimulation} style={{ marginTop: "10px" }}>Run Simulation</button>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={forecastData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="predicted_sales" stroke="#ff7300" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SimulationPanel;
