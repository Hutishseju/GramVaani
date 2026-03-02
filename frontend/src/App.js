import { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  return user
    ? <Dashboard user={user} />
    : <Login setUser={setUser} />;
}

export default App;