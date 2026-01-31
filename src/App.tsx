import { Button } from "@/components/ui/button";
import { useEngineStore,serializeEngineState } from "@/store/engineStore";
import { useState } from "react";

import { save } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

function App() {
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
    engineStore.addEntity(randomSceneId, { id: entityId, name: `Entity ${entityId}`, components: [] });
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
    <main className="h-screen w-screen flex flex-col items-center justify-center space-y-4">
      <h1>Welcome to using global state branch</h1>

      <Button onClick={addRandomScene}>Add Random Scene</Button>
      <Button onClick={addRandomEntityToRandomScene}>Add Random Entity to Random Scene</Button>
      <Button onClick={handleSaveHlz}>Save Project as .hlz</Button>
      <pre className="h-max overflow-auto">{JSON.stringify(engineStore, null, 2)}</pre>

    </main>
  );
}

export default App;
