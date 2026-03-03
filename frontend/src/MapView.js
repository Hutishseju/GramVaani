function MapView({ risk }) {

  const getRiskColor = () => {
    if (risk >= 4) return "#d32f2f";
    if (risk >= 2) return "#fbc02d";
    return "#388e3c";
  };

  const getRiskLabel = () => {
    if (risk >= 4) return "High Risk";
    if (risk >= 2) return "Moderate Risk";
    return "Low Risk";
  };

  return (
    <div className="card">
      <h3>India Risk Indicator</h3>

      <div className="risk-visual">
        <div 
          className="risk-circle"
          style={{ backgroundColor: getRiskColor() }}
        >
          {risk}
        </div>

        <p className="risk-label">
          {getRiskLabel()}
        </p>
      </div>
    </div>
  );
}

export default MapView;