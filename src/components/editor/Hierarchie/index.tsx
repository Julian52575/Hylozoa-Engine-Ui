import { Tree, NodeRendererProps } from "react-arborist";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import { useSelectionStore } from "@/store/useSelectionStore";
import { useState } from "react";

import ComponentModal from "./ComponentModal";
import IconDisplayer from "../IconDisplayer";
import { useEngineStore } from "@/store/engineStore";
import { useSchemaStore } from "@/store/useSchemaStore";

type NodeData = {
  id: string;
  name: string;
  type: string; // e.g. "camera", "light", "mesh", etc.
  children?: NodeData[]; // Optional for leaf nodes
};

function Node({ node, style, dragHandle }: NodeRendererProps<NodeData>) {
  const handleNodeClick = () => {
    if (node.isLeaf) {
      useSelectionStore.getState().selectComponent(node.data.id);

      //Temporary code to select entity if it's a leaf node (to be removed when we can select components in the inspector)
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
          <IconDisplayer type={node.data.type} size={12} />
          <div
            className={`
                            font-normal text-sm px-1 py-0.5 rounded-md
                            hover:bg-primary/10 hover:cursor-pointer
                            ${useSelectionStore.getState().selectedComponentId === node.data.id ? "bg-gray-200" : "bg-transparent"}
                        `}
            onClick={handleNodeClick}
          >
            {node.data.name}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <div>{node.data.type} Options</div>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function Hierarchie() {
  const engineStore = useEngineStore();
  const currentSceneId = engineStore.currentSceneId;
  const currentEntities = currentSceneId
    ? engineStore.scenes[currentSceneId]?.entities
    : null;
  const initialData: NodeData[] = currentEntities
    ? [Object.values(currentEntities)[0] as NodeData]
    : [];
  const [data, setData] = useState<NodeData[]>(() => {
    if (!initialData || initialData.length === 0) {
      return [];
    }
    const root = {
      ...initialData[0],
      children: initialData[0].children || [],
    };
    return [root];
  });
  useSelectionStore.getState().selectEntity(initialData[0]?.id || null);

  const handleAddComponent = (componentType: string) => {
    const Component: NodeData = {
      id: `entity-${Date.now()}`,
      name: componentType,
      type: componentType,
    };
    setData((prev) => {
      if (prev.length === 0) return [Component];

      const newData = [...prev];
      const sceneNode = { ...newData[0] };
      sceneNode.children = [...(sceneNode.children || []), Component];
      newData[0] = sceneNode;
      return newData;
    });
    const componentSchema =
      useSchemaStore.getState().schemas[componentType].properties;
    engineStore.addComponentToEntity(currentSceneId!, initialData[0].id, {
      id: Component.id,
      name: Component.name,
      type: Component.type,
      props: componentSchema,
    });
  };

  const handleMove = ({
    dragIds,
    parentId,
    index,
  }: {
    dragIds: string[];
    parentId: string | null;
    index: number;
  }) => {
    const newData = JSON.parse(JSON.stringify(data));
    let draggedNode: NodeData | null = null;
    const removeNode = (list: NodeData[]) => {
      for (let i = 0; i < list.length; i++) {
        if (list[i].id === dragIds[0]) {
          draggedNode = list.splice(i, 1)[0];
          return true;
        }
        if (list[i].children) {
          if (removeNode(list[i].children!)) return true;
        }
      }
      return false;
    };
    removeNode(newData);
    if (draggedNode) {
      if (parentId === null) {
        newData.splice(index, 0, draggedNode);
      } else {
        const insertNode = (list: NodeData[]) => {
          for (let node of list) {
            if (node.id === parentId) {
              if (!node.children) node.children = [];
              node.children.splice(index, 0, draggedNode!);
              return true;
            }
            if (node.children) {
              if (insertNode(node.children)) return true;
            }
          }
          return false;
        };
        insertNode(newData);
      }
    }
    setData(newData);
  };

  return (
    <div className="bg-secondary h-full">
      <div className="p-2 bg-primary/10">Scene</div>
      <ContextMenu>
        <ContextMenuTrigger asChild onContextMenu={(e) => e.stopPropagation()}>
          <div className="flex h-full px-2 py-1 overflow-auto">
            <Tree data={data} onMove={handleMove}>
              {Node}
            </Tree>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ComponentModal onValidate={handleAddComponent} />
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
