import { useEngineStore } from "@/store/engineStore";
import { useSelectionStore } from "@/store/useSelectionStore";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Button } from "../ui/button";
import { Icon } from "@iconify/react";
import { useState } from "react";

function Header({ onAddScene }: { onAddScene: () => Promise<string> }) {
  return (
    <div className="w-full bg-primary/10 px-4 py-2 flex items-center justify-between gap-2 shrink-0">
      <span>Scènes</span>
      <Button variant="ghost" size={"icon-sm"} className="cursor-pointer" onClick={onAddScene}>
        <Icon icon="lucide:plus" className="w-4 h-4" />
      </Button>
    </div>
  );
}

function SceneItem({
  sceneId,
  name,
  isMain = false,
  isDeletable = true,
}: {
  sceneId: string | undefined;
  name: string;
  isMain?: boolean;
  isDeletable?: boolean;
}) {
  const currentSceneId = useSelectionStore((state) => state.selectedSceneId);
  const setCurrentSceneId = useSelectionStore((state) => state.selectScene);
  const renameScene = useEngineStore((state) => state.renameScene);
  const removeScene = useEngineStore((state) => state.removeScene);
  const duplicateScene = useEngineStore((state) => state.duplicateScene);

  const [cpyName, setCopyName] = useState(name);
  const [isRenaming, setIsRenaming] = useState(false);

  const handleRename = () => {
    if (cpyName.trim() === "") {
      setCopyName(name);
      return;
    }
    setIsRenaming(false);
    renameScene(sceneId, cpyName);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild onContextMenu={(e) => e.stopPropagation()}>
        <div
          onClick={() => setCurrentSceneId(sceneId || null)}
          onDoubleClick={() => setIsRenaming(true)}
          className={`px-4 py-2 bg-primary/5 rounded-md w-full flex items-center gap-2 
        ${currentSceneId === sceneId ? "bg-primary/20" : "hover:bg-primary/10 cursor-pointer"}
      `}
        >
          {isMain && (
            <Icon icon="ri:star-fill" className="w-4 h-4 text-yellow-500" />
          )}
          {isRenaming ? (
            <form onSubmit={handleRename}>
              <input
                autoFocus
                value={cpyName}
                onChange={(e) => setCopyName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsRenaming(false);
                    setCopyName(name);
                  }
                }}
                className="w-full bg-transparent border-b border-primary focus:outline-none"
              />
            </form>
          ) : (
            <span className="select-none text-ellipsis whitespace-nowrap overflow-hidden">
              {cpyName}
            </span>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="p-1 w-56">
        <div className="flex flex-col text-sm">
          <ContextMenuItem
            className={`
                flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer
                ${isMain ? "text-gray-500 pointer-events-none" : ""}
              `}
            onClick={() => useEngineStore.getState().setMainScene(sceneId)}
          >
            <Icon icon="lucide:star" className="w-4 h-4 shrink-0" />
            <span>Définir comme scène principale</span>
          </ContextMenuItem>
          <ContextMenuItem
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              document.dispatchEvent(
                new KeyboardEvent("keydown", { key: "Escape" }),
              );
              setTimeout(() => {
                setIsRenaming(true);
              }, 0);
            }}
          >
            <Icon icon="lucide:edit" className="w-4 h-4 shrink-0" />
            <span>Renommer</span>
          </ContextMenuItem>
          <ContextMenuItem
            className={`
              flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer
              ${!isDeletable ? "text-gray-500 pointer-events-none" : ""}
            `}
            onClick={() => {
              if (isDeletable) {
                removeScene(sceneId);
              }
            }}
          >
            <Icon icon="lucide:trash-2" className="w-4 h-4 shrink-0" />
            <span>Supprimer</span>
          </ContextMenuItem>
          <ContextMenuItem
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
            onClick={() => {
              duplicateScene(sceneId);
            }}
          >
            <Icon icon="lucide:copy" className="w-4 h-4 shrink-0" />
            <span>Dupliquer</span>
          </ContextMenuItem>
        </div>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function SceneManager() {
  const scenes = useEngineStore((state) => state.scenes);
  const addScene = useEngineStore((state) => state.addScene);
  const mainSceneId = useEngineStore((state) => state.mainSceneId);

  return (
    <div className="flex-1 h-full flex flex-col bg-secondary items-start">
      <Header onAddScene={async () => await addScene(`Scene ${Object.keys(scenes).length + 1}`)} />
      <ContextMenu>
        <ContextMenuTrigger asChild onContextMenu={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-1.5 w-full p-2 overflow-auto h-full">
            {Object.values(scenes).map((scene) => (
              <SceneItem
                key={scene.id}
                sceneId={scene.id}
                name={scene.name}
                isMain={scene.id === mainSceneId}
                isDeletable={Object.values(scenes).length > 1}
              />
            ))}
            {Object.values(scenes).length === 0 && (
              <div className="px-4 py-2 text-gray-500">No scenes available</div>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <div className="p-0.5 flex flex-col gap-1">
            <Button
              variant="ghost"
              className="w-full"
              onClick={async () =>
                await addScene(`Scene ${Object.keys(scenes).length + 1}`)
              }
            >
              Add Scene
            </Button>
          </div>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
