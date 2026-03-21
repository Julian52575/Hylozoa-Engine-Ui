import { Routes, Route } from "react-router-dom";
import GraphPage from "@/pages/Graph";
import HomePage from "@/pages/Home";
import EditorPage from "@/pages/Editor";


function App() {



  return (
    <Routes>
      <Route path="/home" element={<HomePage />} />
      <Route path="/graph" element={<GraphPage />} />
      <Route index element={<EditorPage />} />
    </Routes>
  );
}

export default App;
