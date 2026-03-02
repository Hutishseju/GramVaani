import { useState } from "react";
import ChartView from "./ChartView";
import MapView from "./MapView";
import { translations } from "./translations";

function Dashboard({ user }) {

  const [lang, setLang] = useState("en");
  const t = translations[lang];

  const [data, setData] = useState(null);

  const fetchData = async () => {
    const response = await fetch("YOUR_API_URL/forecast?crop=Wheat&state=Gujarat");
    const result = await response.json();
    setData(result);
  };

  return (
    <div className="container">

      <div className="top-bar">
        <button onClick={() => setLang("en")}>EN</button>
        <button onClick={() => setLang("hi")}>हिंदी</button>
        <span>Role: {user.role}</span>
      </div>

      <h1>{t.title}</h1>

      <button onClick={fetchData}>{t.forecast}</button>

      {data && (
        <>
          <div className="dashboard-grid">

            <div className="card">
              <h2>₹ {data.forecast.predicted_price}</h2>
              <p>{t.rainfall}: {data.forecast.rainfall_mm}</p>
              <p>{t.temperature}: {data.forecast.temperature_c}</p>
              <p>{t.humidity}: {data.forecast.humidity_percent}</p>
              <p>{t.risk}: {data.forecast.weather_risk_score}</p>
            </div>

            <ChartView forecast={data.forecast} />
            <MapView />

          </div>

          <div className="card advisory">
            <h2>{t.advisory}</h2>
            <p>{data.advisory}</p>
          </div>
        </>
      )}

    </div>
  );
}

export default Dashboard;