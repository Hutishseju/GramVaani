import { useState, useRef } from "react";
import { crops, states } from "./data";
import ChartView from "./ChartView";
import MapView from "./MapView";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const API_BASE = "https://26cksw3tae.execute-api.us-east-1.amazonaws.com";

function Dashboard({ user, setUser }) {

  const [selectedCrop, setSelectedCrop] = useState("Wheat");
  const [selectedState, setSelectedState] = useState("Andhra Pradesh");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportRef = useRef();

  const fetchForecast = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/forecast?crop=${encodeURIComponent(selectedCrop)}&state=${encodeURIComponent(selectedState)}`
      );

      const result = await res.json();
      setData(result);
    } catch (err) {
      alert("API Error");
    }

    setLoading(false);
  };

  // ✅ Robust advisory parser
  const renderAdvisory = () => {
    if (!data?.advisory) return null;

    const lines = data.advisory.split("\n").filter(l => l.trim() !== "");

    const sections = [];
    let current = null;

    lines.forEach(line => {
      const match = line.trim().match(/^(\d+)[\.\s]+(.*)/);

      if (match) {
        if (current) sections.push(current);

        current = {
          number: match[1],
          text: match[2] || ""
        };
      } else if (current) {
        current.text += " " + line.trim();
      }
    });

    if (current) sections.push(current);

    return sections.map((section, index) => {

      const cleaned = section.text.trim();

      let title = null;
      let description = cleaned;

      if (cleaned.includes(":")) {
        const parts = cleaned.split(":");
        title = parts[0];
        description = parts.slice(1).join(":");
      }

      return (
        <div key={index} className="advisory-card">
          <div className="advisory-index">{section.number}</div>

          <div className="advisory-text">
            {title && (
              <strong className="advisory-title">
                {title.trim()}:
              </strong>
            )}
            <span> {description.trim()}</span>
          </div>
        </div>
      );
    });
  };

  // ✅ PDF DOWNLOAD (Full Dashboard Section)
  const downloadReport = async () => {
    const element = reportRef.current;
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`${selectedCrop}_${selectedState}_Report.pdf`);
  };

  return (
    <div className="container">

      {/* 🔹 Top Bar */}
      <div className="topbar">
        <span>Role: {user.role}</span>

        <button
          className="logout-btn"
          onClick={() => setUser(null)}
        >
          Logout
        </button>
      </div>

      <h1>GramVaani Rural Intelligence Dashboard</h1>

      {/* 🔹 Selection Controls */}
      <div className="selectors">
        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
        >
          {crops.map(crop => (
            <option key={crop}>{crop}</option>
          ))}
        </select>

        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
        >
          {states.map(state => (
            <option key={state}>{state}</option>
          ))}
        </select>

        <button onClick={fetchForecast}>
          Get Forecast
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {/* 🔹 Forecast Section */}
      {data && (
        <div ref={reportRef}>
          <div className="dashboard-grid">

            {/* Forecast Card */}
            <div className="card highlight">
              <h2>₹ {data.forecast.predicted_price} / quintal</h2>
              <p>Rainfall: {data.forecast.rainfall_mm} mm</p>
              <p>Temperature: {data.forecast.temperature_c} °C</p>
              <p>Humidity: {data.forecast.humidity_percent}%</p>
              <p>Risk Score: {data.forecast.weather_risk_score}</p>
            </div>

            {/* Chart */}
            <ChartView price={data.forecast.predicted_price} />

            {/* Risk Indicator */}
            <MapView risk={data.forecast.weather_risk_score} />

          </div>

          {/* 🔹 Advisory Section */}
          <div className="card advisory">
            <div className="advisory-header">
              <h3>🌾 AI Advisory</h3>
              <div className="price-badge">
                ₹ {data.forecast.predicted_price} / quintal
              </div>
            </div>

            <div className="advisory-body">
              {renderAdvisory()}
            </div>
          </div>

          {/* 🔹 Cooperative Panel */}
          {user.role === "Rural Cooperative" && (
            <div className="card cooperative-panel">
              <h3>Cooperative Insights</h3>

              <p>⚠ Monitor high-risk zones proactively.</p>
              <p>📈 Track price trends for procurement.</p>
              <p>📊 Optimize storage & logistics planning.</p>

              <button
                className="download-btn"
                onClick={downloadReport}
              >
                Download Full Report (PDF)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;