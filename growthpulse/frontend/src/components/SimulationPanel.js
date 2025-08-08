import { useState } from "react";
import "../styles/SimulationPanel.css";

export default function SimulationPanel({ onSimulation }) {
  const [scenario, setScenario] = useState("base");
  const [growthRate, setGrowthRate] = useState(0.05);
  const [priceChange, setPriceChange] = useState(0);
  const [months, setMonths] = useState(6);
  const [campaigns, setCampaigns] = useState([]);
  const [results, setResults] = useState([]);

  const handleSimulate = async () => {
    try {
      const payload = { scenario };

      if (scenario === "custom") {
        payload.growth_rate = growthRate;
        payload.price_change = priceChange;
        payload.months = months;
        payload.campaigns = campaigns;
      }

      const data = await onSimulation(payload);
      setResults(data.results || []);
    } catch (err) {
      console.error("Simulation failed", err);
    }
  };

  const addCampaign = () => {
    setCampaigns([...campaigns, { name: "", start_month: "", end_month: "", lift: 0 }]);
  };

  const updateCampaign = (index, field, value) => {
    const updated = [...campaigns];
    updated[index][field] = value;
    setCampaigns(updated);
  };

  return (
    <div className="simulation-panel">
      <h3>What-if Simulation</h3>

      <label>Scenario:</label>
      <select value={scenario} onChange={(e) => setScenario(e.target.value)}>
        <option value="base">Base Case</option>
        <option value="best">Best Case</option>
        <option value="worst">Worst Case</option>
        <option value="custom">Custom</option>
      </select>

      {scenario === "custom" && (
        <>
          <label>Growth Rate (% per month):</label>
          <input type="number" step="0.01" value={growthRate}
            onChange={(e) => setGrowthRate(parseFloat(e.target.value) || 0)} />

          <label>Price Change (%):</label>
          <input type="number" step="0.01" value={priceChange}
            onChange={(e) => setPriceChange(parseFloat(e.target.value) || 0)} />

          <label>Months Ahead:</label>
          <input type="number" value={months}
            onChange={(e) => setMonths(parseInt(e.target.value) || 0)} />

          <h4>Campaigns</h4>
          {campaigns.map((camp, idx) => (
            <div key={idx} className="campaign-row">
              <input placeholder="Name" value={camp.name}
                onChange={(e) => updateCampaign(idx, "name", e.target.value)} />
              <input type="month" value={camp.start_month}
                onChange={(e) => updateCampaign(idx, "start_month", e.target.value)} />
              <input type="month" value={camp.end_month}
                onChange={(e) => updateCampaign(idx, "end_month", e.target.value)} />
              <input type="number" step="0.01" placeholder="Lift %"
                value={camp.lift} onChange={(e) => updateCampaign(idx, "lift", e.target.value)} />
            </div>
          ))}
          <button onClick={addCampaign}>+ Add Campaign</button>
        </>
      )}

      <button onClick={handleSimulate}>Simulate</button>

      {results.length > 0 && (
        <div className="simulation-results">
          <h4>Simulation Results</h4>
          <ul>
            {results.map((item, idx) => (
              <li key={idx}>{item.month}: {item.sales}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
