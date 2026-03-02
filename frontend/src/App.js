import { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import "./App.css";

function App() {

  const [user, setUser] = useState(null);

  if (!user) {
    return <Login setUser={setUser} />;
  }

  return <Dashboard user={user} />;
}

export default App;