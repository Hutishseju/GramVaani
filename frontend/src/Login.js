import { useState } from "react";
import logo from "./assets/Team_logo.png";

function Login({ setUser }) {
  const [role, setRole] = useState("Farmer");

  return (
    <div className="login-page">
      <div className="login-card">

        <img src={logo} alt="Team Logo" className="login-logo" />

        <h2>GramVaani Rural Intelligence</h2>

        <div className="login-controls">
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option>Farmer</option>
            <option>Rural Cooperative</option>
          </select>

          <button onClick={() => setUser({ role })}>
            Enter Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}

export default Login;