import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css"; // optional global styles
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>GrowthPulse Dashboard</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
