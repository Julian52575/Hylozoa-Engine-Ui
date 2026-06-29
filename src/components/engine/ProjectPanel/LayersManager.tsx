import { useEngineStore } from "@/store/engineStore";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

function LayerItem({
  layer,
  forbiddenLayers,
  onRemove,
  onRename,
  isDeletable,
}: {
  layer: string;
  forbiddenLayers?: string[];
  onRemove: () => void;
  onRename: (newLayer: string) => void;
  isDeletable: boolean;
}) {
  const [cpyName, setCopyName] = useState(layer);
  const [isRenaming, setIsRenaming] = useState(false);

  const handleRename = () => {
    if (cpyName.trim() === "" || cpyName.trim() === layer || forbiddenLayers?.includes(cpyName.trim())) {
      setCopyName(layer);
      setIsRenaming(false);
      return;
    }
    setIsRenaming(false);
    onRename(cpyName.trim());
  };

  useEffect(() => {
    setCopyName(layer);
  }, [layer]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild onContextMenu={(e) => e.stopPropagation()}>
        <div
          onDoubleClick={() => setIsRenaming(true)}
          className={`px-4 py-2 bg-primary/5 rounded-md w-full flex items-center gap-2 
        `}
        >
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
                    setCopyName(layer);
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
            <span>Rename</span>
          </ContextMenuItem>
          <ContextMenuItem
            className={`
                flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer
                ${!isDeletable ? "opacity-50 pointer-events-none" : ""}
            `}
            onClick={(e) => {
              e.preventDefault();
              onRemove();
            }}
          >
            <Icon icon="lucide:trash-2" className="w-4 h-4 shrink-0" />
            <span>Delete</span>
          </ContextMenuItem>
        </div>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function LayersManager() {
  const layers = useEngineStore((state) => state.layers);
  const addLayer = useEngineStore((state) => state.addLayer);
  const removeLayer = useEngineStore((state) => state.removeLayer);
  const renameLayer = useEngineStore((state) => state.renameLayer);

  return (
    <div className="flex-1 h-full flex flex-col items-start">
      <ContextMenu>
        <ContextMenuTrigger asChild onContextMenu={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-1.5 w-full p-2 overflow-auto h-full">
            {layers.length === 0 && (
              <div className="text-muted-foreground text-sm select-none">
                Right click to add a layer
              </div>
            )}
            {layers.map((layer) => (
              <LayerItem
                key={layer}
                layer={layer}
                forbiddenLayers={layers.filter((l) => l !== layer)}
                onRemove={() => removeLayer(layer)}
                onRename={(newLayer) => renameLayer(layer, newLayer)}
                isDeletable={layers.length > 1}
              />
            ))}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <div className="p-0.5 flex flex-col gap-1">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => addLayer(`Layer ${layers.length + 1}`)}
            >
              Add Layer
            </Button>
          </div>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
