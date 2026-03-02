import { useState } from "react";
import { crops, states } from "./data";
import { translations } from "./translations";
import ChartView from "./ChartView";
import MapView from "./MapView";

const API_BASE = process.env.REACT_APP_API_URL;

function Dashboard({ user }) {

  const [lang, setLang] = useState("en");
  const t = translations[lang];

  const [selectedCrop, setSelectedCrop] = useState("Wheat");
  const [selectedState, setSelectedState] = useState("Gujarat");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/forecast?crop=${selectedCrop}&state=${selectedState}`
      );
      const result = await res.json();
      setData(result);
    } catch (err) {
      alert("API Error");
    }
    setLoading(false);
  };

  return (
    <div className="container">

      <div className="topbar">
        <button onClick={() => setLang("en")}>EN</button>
        <button onClick={() => setLang("hi")}>HI</button>
        <span>{t.role}: {user.role}</span>
      </div>

      <h1>{t.title}</h1>

      <div className="selectors">
        <select value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}>
          {crops.map(crop => (
            <option key={crop}>{crop}</option>
          ))}
        </select>

        <select value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}>
          {states.map(state => (
            <option key={state}>{state}</option>
          ))}
        </select>

        <button onClick={fetchForecast}>
          {t.forecast}
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {data && (
        <>
          <div className="dashboard-grid">
            <div className="card">
              <h2>₹ {data.forecast.predicted_price}</h2>
              <p>Rainfall: {data.forecast.rainfall_mm} mm</p>
              <p>Temperature: {data.forecast.temperature_c} °C</p>
              <p>Humidity: {data.forecast.humidity_percent}%</p>
              <p>Risk Score: {data.forecast.weather_risk_score}</p>
            </div>

            <ChartView price={data.forecast.predicted_price} />
            <MapView />
          </div>

          <div className="card advisory">
            <h3>{t.advisory}</h3>
            <p>{data.advisory}</p>
          </div>
        </>
      )}

    </div>
  );
}

export default Dashboard;