import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function ChartView({ price }) {

  const data = {
    labels: ["Day1","Day2","Day3","Day4","Day5","Day6","Day7"],
    datasets: [{
      label: "Price Trend",
      data: Array(7).fill(price),
      borderColor: "green",
      tension: 0.4
    }]
  };

  return (
    <div className="card">
      <h3>Price Trend</h3>
      <Line data={data} />
    </div>
  );
}

export default ChartView;