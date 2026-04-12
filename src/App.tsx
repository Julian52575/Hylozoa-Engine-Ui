import { Routes, Route } from "react-router-dom";
import GraphPage from "@/pages/Graph";
import HomePage from "@/pages/Home";
import EditorPage from "@/pages/Editor";


function App() {



  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="/graph" element={<GraphPage />} />
      <Route path="/editor" element={<EditorPage />} />
    </Routes>
  );
}

export default App;
