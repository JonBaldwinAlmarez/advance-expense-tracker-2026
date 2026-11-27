import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashbroard from "./pages/Dashbroard";
import { useState } from "react";

/* ---------- Types ---------- */

// Shape of the logged-in user (matches PublicUser from the backend)

type User = {
  id: string;
  name: string;
  email: string;
};

function App() {
  // null means "not logged in"
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  // Removes saved login data from both storages and resets the state
  const clearAuth = (): void => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
    } catch (error) {
      console.error("ClearAuth error: ", error); // Console error
    }
    // Re set token and user account
    setUser(null);
    setToken(null);
  };
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashbroard />} />
      </Route>
    </Routes>
  );
}

export default App;
