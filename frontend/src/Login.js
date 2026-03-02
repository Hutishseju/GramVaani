import { useState } from "react";

function Login({ setUser }) {

  const [role, setRole] = useState("Farmer");

  const handleLogin = () => {
    setUser({ role });
  };

  return (
    <div className="login-container">
      <h2>GramVaani Login</h2>

      <select onChange={(e) => setRole(e.target.value)}>
        <option>Farmer</option>
        <option>Rural Cooperative</option>
      </select>

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;