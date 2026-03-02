import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/india/india-states.json";

function MapView() {
  return (
    <div className="card">
      <h3>India Map</h3>
      <ComposableMap width={400} height={400}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#E0F2F1"
                stroke="#004D40"
              />
            ))
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}

export default MapView;