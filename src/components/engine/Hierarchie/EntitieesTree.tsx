import { Tree, NodeRendererProps } from "react-arborist";
import {
  AutoSizer,
  type AutoSizerChildProps,
} from "react-virtualized-auto-sizer";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import ComponentModal from "./ComponentModal";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { useState } from "react";

import { useSelectionStore } from "@/store/useSelectionStore";
import { useEngineStore } from "@/store/engineStore";
import { useSchemaStore } from "@/store/useSchemaStore";

type NodeData = {
  id: string;
  name: string;
  type: string;
  children?: NodeData[];
};

function Node({ node, style, dragHandle }: NodeRendererProps<NodeData>) {
  const schemas = useSchemaStore((state) => state.schemas);
  const renameEntity = useEngineStore((state) => state.renameEntity);

  const isSelected = useSelectionStore(
    (state) => state.selectedEntityId === node.data.id,
  );

  const handleNodeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const idToSelect = node.isLeaf ? node.parent?.data.id : node.data.id;
    if (idToSelect) {
      useSelectionStore.getState().selectEntity(idToSelect);
    }
  };

  const getIcon = () => {
    if (node.data.type === "entity") {
      return "lucide:box";
    }
    const schema = schemas[node.data.type];
    return schema?.icon || "lucide:puzzle";
  };

  const [isRenaming, setIsRenaming] = useState(false);
  const [cpyName, setCopyName] = useState(
    schemas[node.data.type]?.label || node.data.name,
  );

  const handleRename = () => {
    if (cpyName.trim() === "") {
      setCopyName(node.data.name);
      return;
    }
    setIsRenaming(false);
    if (node.data.type === "entity") {
      renameEntity(
        useSelectionStore.getState().selectedSceneId!,
        node.data.id,
        cpyName,
      );
    }
  };

  const getAllComponnentOfEntity = () => {
    if (node.data.type !== "entity") return [];
    const scene =
      useEngineStore.getState().scenes[
        useSelectionStore.getState().selectedSceneId!
      ];
    const entity = scene?.entities[node.data.id];
    if (!entity) return [];
    return Object.values(entity.components).map((comp: any) => ({
      id: comp.id,
      name: comp.name,
      type: comp.type,
    })) as NodeData[];
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild onContextMenu={(e) => e.stopPropagation()}>
        <div
          style={style}
          ref={dragHandle}
          className="flex items-center gap-1 cursor-default select-none"
          onClick={handleNodeClick}
        >
          {!node.isLeaf && (
            <div className="w-4 h-4">
              <Icon
                icon={
                  node.isOpen ? "lucide:chevron-down" : "lucide:chevron-right"
                }
                className="w-4 h-4 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  node.toggle();
                }}
              />
            </div>
          )}
          <div
            className={`
                  flex flex-row overflow-hidden 
                  text-sm px-1 py-0.5 text-ellipsis whitespace-nowrap 
                  items-center gap-1 justify-start font-normal  rounded-md
                  hover:bg-primary/10 hover:cursor-pointer
                  ${isSelected ? "bg-gray-200" : "bg-transparent"}
              `}
            onClick={handleNodeClick}
          >
            <Icon icon={getIcon()} className="w-4 h-4 min-w-4 min-h-4" />
            {!isRenaming && (
              <div
                className="overflow-hidden text-ellipsis whitespace-nowrap"
                onDoubleClick={() => {
                  if (node.data.type === "entity") setIsRenaming(true);
                }}
              >
                {cpyName}
              </div>
            )}
            {isRenaming && node.data.type === "entity" && (
              <input
                autoFocus
                value={cpyName}
                onChange={(e) => {
                  setCopyName(e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Escape") {
                    setIsRenaming(false);
                    setCopyName(node.data.name);
                  }
                }}
                className="w-full bg-transparent border-b border-primary focus:outline-none"
              />
            )}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {node.data.type === "entity" ? (
          <div className="flex flex-col gap-1 items-start w-full">
            <ComponentModal
              componentsDisallowed={getAllComponnentOfEntity().map(
                (c) => c.type,
              )}
              onValidate={async (componentType) => {
                const createDefaultComponent =
                  useSchemaStore.getState().createDefaultComponent;
                const newComponentProps =
                  createDefaultComponent(componentType)?.values || {};
                await useEngineStore
                  .getState()
                  .addComponentToEntity(
                    useSelectionStore.getState().selectedSceneId!,
                    node.data.id,
                    {
                      name: componentType,
                      type: componentType,
                      props: newComponentProps,
                    },
                  );
                node.open();
              }}
            />
            <Button
              variant={"ghost"}
              className=""
              onClick={() => {
                useEngineStore
                  .getState()
                  .removeEntityFromScene(
                    useSelectionStore.getState().selectedSceneId!,
                    node.data.id,
                  );
              }}
            >
              Remove Entity
            </Button>
          </div>
        ) : (
          <Button
            variant={"ghost"}
            className="cursor-pointer w-full"
            onClick={() => {
              const parentEntityId = node.parent?.data.id;
              if (parentEntityId) {
                useEngineStore
                  .getState()
                  .removeComponentFromEntity(
                    useSelectionStore.getState().selectedSceneId!,
                    parentEntityId,
                    node.data.id,
                  );
              }
            }}
          >
            Remove {node.data.type}
          </Button>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function EntitiesTree({
  onAddEntity = () => {},
  treeData = [],
  addText = "Add Entity",
}: {
  onAddEntity?: () => void;
  treeData?: NodeData[];
  addText?: string;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild onContextMenu={(e) => e.stopPropagation()}>
        <div className="flex-1 w-full min-h-0 px-2 py-1">
          <AutoSizer
            renderProp={({ height, width }: AutoSizerChildProps) => (
              <Tree
                data={treeData}
                height={height}
                width={width}
                idAccessor="id"
              >
                {Node}
              </Tree>
            )}
          />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <Button
          variant={"ghost"}
          className="cursor-pointer w-full"
          onClick={onAddEntity}
        >
          {addText}
        </Button>
      </ContextMenuContent>
    </ContextMenu>
  );
}
