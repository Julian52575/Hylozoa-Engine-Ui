import { Icon } from "@iconify/react";
import { useEngineStore } from "@/store/engineStore";
import { useSelectionStore } from "@/store/useSelectionStore";

export function SceneList() {
  const scenes = useEngineStore().scenes;
  const currentSceneId = useSelectionStore().selectedSceneId;

  const invisibleScenes = useSelectionStore().invisibleSceneIds;

  const setSelectedSceneId = useSelectionStore().selectScene;
  const setSelectedEntityId = useSelectionStore().selectEntity;
  const setInvisibleScenes = useSelectionStore().setInvisibleScenes;

  return (
    <div className="w-full flex items-start justify-start h-full">
      <div className="bg-gray-200 px-2 py-1 border border-primary/10 flex items-center h-8">
        <Icon icon="fa-solid:plus" className="cursor-pointer w-4 h-4" />
      </div>
      <div className="w-[83%] flex flex-row overflow-scroll scrollbar-hide">
        {Object.values(scenes)
          .filter((scene) => !invisibleScenes.includes(scene.id || ""))
          .map((scene) => (
            <div
              key={scene.id}
              onClick={() => {
                if (scene.id) {
                  setSelectedSceneId(scene.id);
                  setSelectedEntityId(null);
                }
              }}
              className={`
                  select-none
                  px-2 py-1 border-r border-primary/10 flex items-center gap-1 h-full
                  ${currentSceneId === scene.id ? "bg-primary/20" : "bg-primary/5 hover:bg-primary/10 cursor-pointer"}
              `}
            >
              <span className="text-nowrap">{scene.name}</span>
              <Icon
                icon="ion:close"
                className="cursor-pointer w-5 h-5"
                color="red"
                onClick={(e) => {
                  e.stopPropagation();
                  if (scene.id) {
                    setInvisibleScenes([...invisibleScenes, scene.id]);
                    if (currentSceneId === scene.id) {
                      setSelectedSceneId(null);
                      setSelectedEntityId(null);
                    }
                  }
                }}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
