import { Routes, Route } from "react-router-dom";
import GraphPage from "@/pages/Graph";
import HomePage from "@/pages/Home";
import EnginePage from "@/pages/Engine";


function App() {



  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="/graph" element={<GraphPage />} />
      <Route path="/engine" element={<EnginePage />} />
    </Routes>
  );
}

export default App;
