import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function ChartView({ forecast }) {

  const labels = ["Day 1","Day 2","Day 3","Day 4","Day 5","Day 6","Day 7"];

  const data = {
    labels,
    datasets: [
      {
        label: "Forecast Price",
        data: Array(7).fill(forecast.predicted_price),
        borderColor: "green",
        tension: 0.4
      }
    ]
  };

  return (
    <div className="card">
      <h2>📊 Trend Forecast</h2>
      <Line data={data} />
    </div>
  );
}

export default ChartView;