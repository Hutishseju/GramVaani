import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("YOUR_API_URL/forecast?crop=wheat")
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>GramVaani Dashboard</h1>
      <h2>Crop: {data.crop}</h2>
      <p>Predicted Price: ₹{data.forecast.predicted_price}</p>
      <p>Advisory: {data.advisory}</p>
    </div>
  );
}

export default App;