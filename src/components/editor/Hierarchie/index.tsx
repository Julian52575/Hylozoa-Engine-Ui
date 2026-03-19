import { Tree, NodeRendererProps } from "react-arborist";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import { useSelectionStore } from "@/store/useSelectionStore";

import ComponentModal from "./ComponentModal";
import IconDisplayer from "../IconDisplayer";
import { useEngineStore } from "@/store/engineStore";
import { useSchemaStore } from "@/store/useSchemaStore";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";



type NodeData = {
  id: string;
  name: string;
  type: string;
  children?: NodeData[];
};

function Node({ node, style, dragHandle }: NodeRendererProps<NodeData>) {
  const isSelected = useSelectionStore(
    (state) => state.selectedEntityId === node.data.id,
  );
  const handleNodeClick = () => {
    if (!node.isLeaf) {
        useSelectionStore.getState().selectEntity(node.data.id);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild onContextMenu={(e) => e.stopPropagation()}>
        <div
          style={style}
          ref={dragHandle}
          className="flex items-center gap-1 cursor-default select-none"
        >
          {!node.isLeaf && node.isOpen && (
            <FaChevronDown
              size={10}
              onClick={() => node.toggle()}
              className="cursor-pointer"
            />
          )}
          {!node.isLeaf && !node.isOpen && (
            <FaChevronRight
              size={10}
              onClick={() => node.toggle()}
              className="cursor-pointer"
            />
          )}
          <IconDisplayer type={node.data.type} size={14} />
          <div
            className={`
                font-normal text-sm px-1 py-0.5 rounded-md
                hover:bg-primary/10 hover:cursor-pointer
                ${isSelected ? "bg-gray-200" : "bg-transparent"}
            `}
            onClick={handleNodeClick}
          >
            {node.data.name}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {node.data.type === "entity" ? (
          <ComponentModal
            onValidate={(componentType) => {
              const createDefaultComponent = useSchemaStore.getState().createDefaultComponent;
              const newComponentProps = createDefaultComponent(componentType)?.values || {};
              useEngineStore
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
        ) : (
          <div>{node.data.type} Options</div>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

const EMPTY_ENTITIES = {};
export function Hierarchie() {
  const currentSceneId = useSelectionStore((state) => state.selectedSceneId);
  const entities = useEngineStore((state) => (
    currentSceneId ? state.scenes[currentSceneId]?.entities : EMPTY_ENTITIES
  ));

  const treeData: NodeData[] = useMemo(() => {
    if (!currentSceneId || !entities) return [];

    return Object.values(entities).map((entity : any) => ({
      id: entity.id,
      name: entity.name,
      type: "entity",
      children: Object.values(entity.components).map((comp : any) => ({
        id: comp.id,
        name: comp.name,
        type: comp.type,
      })),
    }));
  }, [entities, currentSceneId]);

  const addEntityToScene = useEngineStore((state) => state.addEntityToScene);

  const handleAddEntity = () => {
    const createDefaultComponent = useSchemaStore.getState().createDefaultComponent;
    const newTransform = createDefaultComponent('localTransform');
    addEntityToScene(currentSceneId!, {
      name: `Entity ${Object.keys(useEngineStore.getState().scenes[currentSceneId!].entities).length + 1}`,
      type: "entity",
      components: {
        default: {
          name: "localTransform",
          type: newTransform?.type || "localTransform",
          props: newTransform?.values || {},
        },
      },
    });
  };

  return (
    <div className="bg-secondary h-full">
      <div className="p-2 bg-primary/10">Scene</div>
      <ContextMenu>
        <ContextMenuTrigger asChild onContextMenu={(e) => e.stopPropagation()}>
          <div className="flex h-full px-2 py-1 overflow-auto">
            <Tree data={treeData}>{Node}</Tree>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <Button
            variant={"ghost"}
            className="cursor-pointer w-full"
            onClick={handleAddEntity}
          >
            Add Entity
          </Button>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
