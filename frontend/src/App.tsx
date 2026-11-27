import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashbroard from "./pages/Dashbroard";

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashbroard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
