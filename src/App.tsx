import { Routes, Route } from "react-router-dom";
import GraphPage from "@/pages/Graph";
import HomePage from "@/pages/Home";
import EnginePage from "@/pages/Engine";


function App() {
  return (
    <main>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="/graph" element={<GraphPage />} />
        <Route path="/engine" element={<EnginePage />} />
      </Routes>
    </main>
  );
}

export default App;
