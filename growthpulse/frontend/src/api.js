const BASE_URL = "http://localhost:8000/api";

export async function fetchForecastData() {
  const res = await fetch(`${BASE_URL}/forecast-sales/`);
  if (!res.ok) throw new Error("Failed to fetch forecast");
  return res.json();
}

export async function uploadSalesFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/upload-sales/`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload file");
  return res.json();
}

export async function runSimulation(payload) {
  const res = await fetch("http://localhost:8000/api/simulate-sales/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Simulation failed");
  return await res.json();
}




export async function fetchKPI() {
  const res = await fetch(`${BASE_URL}/sales-data/`);
  if (!res.ok) throw new Error("Failed to fetch KPI");
  return res.json();
}

export async function clearSalesData() {
  const res = await fetch(`${BASE_URL}/clear-sales/`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to clear sales data");
  return res.json();
}
