import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { Routes, Route } from 'react-router-dom';

import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { useEngineStore,serializeEngineState } from "@/store/engineStore";
import { save } from '@tauri-apps/plugin-dialog';

import GraphPage from './pages/Graph';
import HomePage from './pages/Home';
import EditorPage from '@/pages/Editor';
import { useSchemaStore } from './store/useSchemaStore';
import { useEffect } from 'react';
import { useSelectionStore } from './store/useSelectionStore';


function Temp() {
  const engineStore = useEngineStore();

  const [listScenesId, setListScenesId] = useState<string[]>([]);
  const addRandomScene = () => {
    const id = (Math.random() * 10000).toFixed(0);
    engineStore.addScene(id, `Scene ${id}`);
    setListScenesId([...listScenesId, id]);
    alert(`Added Scene with ID: ${id}`);
  }

  const addRandomEntityToRandomScene = () => {
    if (listScenesId.length === 0) {
      alert("No scenes available. Please add a scene first.");
      return;
    }
    const randomSceneId = listScenesId[Math.floor(Math.random() * listScenesId.length)];
    const entityId = (Math.random() * 10000).toFixed(0);
    engineStore.addEntityToScene(randomSceneId, { id: entityId, name: `Entity ${entityId}`, type: "default", components: {} });
    alert(`Added Entity with ID: ${entityId} to Scene ID: ${randomSceneId}`);
  }

  const handleSaveHlz = async () => {
    const state = engineStore;
    const serialized = JSON.stringify(serializeEngineState(state));

    const filePath = await save({
      title: 'Save HLZ File',
      defaultPath: 'project.hlz',
      filters: [{ name: 'HLZ Files', extensions: ['hlz'] }],
    });
    if (!filePath) return;

    try {
      await invoke('save_compressed_project', { path: filePath, data: serialized });
      alert(`Project saved successfully to ${filePath}`);
    }
    catch (error) {
      alert(`Failed to save project: ${error}`);
    }
  };

  return (
    <main className="h-screen w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <h1>Engine State Management Test</h1>
        <Button onClick={addRandomScene}>Add Random Scene</Button>
        <Button onClick={addRandomEntityToRandomScene}>Add Random Entity to Random Scene</Button>
        <Button onClick={handleSaveHlz}>Save Project as .hlz</Button>
        <pre className="h-max overflow-auto">{JSON.stringify(engineStore, null, 2)}</pre>
      </div>
    </main>
  );
};

const OpenWindowButton = () => {
  const createNewWindow = async () => {
    const webview = new WebviewWindow('graph-window', {
      url: '/graph',
      title: 'Graph',
      width: 800,
      height: 600
    });
    webview.once('tauri://created', () => {
      console.log('Graph window created');
    });

    webview.once('tauri://error', (e) => {
      console.error("Erreur lors de la création de la fenêtre:", e);
    });
  };
  return (
    <button onClick={createNewWindow} className="p-2 bg-blue-500 text-white rounded">
      Open Graph Window
    </button>
  );
};

function App() {
  const loadSchemas = useSchemaStore((s) => s.loadSchemas);
  const addScene = useEngineStore((s) => s.addScene);
  const setSelectedSceneId = useSelectionStore((s) => s.selectScene);
  
  useEffect(() => {
    loadSchemas();
  }, [loadSchemas]);
  
  // Temporary code to add a scene and an entity for testing purposes
  useEffect(() => {
    addScene("1", "Scene 1");
    setSelectedSceneId("1");
  }, [addScene, setSelectedSceneId]);



  return (
    <Routes>
      <Route path='/home' element={<HomePage />} />
      <Route path="/graph" element={<GraphPage />} />
      <Route index element={<EditorPage />} />
    </Routes>
  );
}


export default App;
