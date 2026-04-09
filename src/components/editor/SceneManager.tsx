import { useEngineStore } from "@/store/engineStore";
import { useSelectionStore } from "@/store/useSelectionStore";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Button } from "../ui/button";

export function SceneManager() {
  const scenes = useEngineStore((state) => state.scenes);
  const currentSceneId = useSelectionStore((state) => state.selectedSceneId);
  const setCurrentSceneId = useSelectionStore((state) => state.selectScene);
  const addScene = useEngineStore((state) => state.addScene);


  return (
    <div className="flex-1 h-full flex flex-col bg-secondary items-start">
      <div className="w-full bg-primary/10 px-4 py-2">Scenes</div>
      <ContextMenu>
        <ContextMenuTrigger asChild onContextMenu={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-1.5 w-full p-2 overflow-auto">
            {Object.values(scenes).map((scene) => (
              <div
                key={scene.id}
                onClick={() => setCurrentSceneId(scene.id || null)}
                className={`px-4 py-2 bg-primary/5 rounded-md w-full max-w-70 
                  ${currentSceneId === scene.id ? 'bg-primary/20' : 'hover:bg-primary/10 cursor-pointer'}
                `}
              >
                <span>
                  {scene.name}
                </span>
              </div>
            ))}
            {Object.values(scenes).length === 0 && (
              <div className="px-4 py-2 text-gray-500">No scenes available</div>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <div className="p-0.5 flex flex-col gap-1">
            <Button variant="ghost" className="w-full" onClick={async () => await addScene(`Scene ${Object.keys(scenes).length + 1}`)}>
              Add Scene
            </Button>
          </div>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
