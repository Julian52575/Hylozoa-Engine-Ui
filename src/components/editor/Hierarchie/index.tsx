import { Tree, NodeRendererProps } from "react-arborist";
import {
  AutoSizer,
  type AutoSizerChildProps,
} from "react-virtualized-auto-sizer";
import { Icon } from "@iconify/react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import { useSelectionStore } from "@/store/useSelectionStore";

import ComponentModal from "./ComponentModal";
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
  const schemas = useSchemaStore((state) => state.schemas);

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
          <Icon icon={getIcon()} className="w-4 h-4" />
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
              const createDefaultComponent =
                useSchemaStore.getState().createDefaultComponent;
              const newComponentProps =
                createDefaultComponent(componentType)?.values || {};
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
  const entities = useEngineStore((state) =>
    currentSceneId ? state.scenes[currentSceneId]?.entities : EMPTY_ENTITIES,
  );

  const treeData: NodeData[] = useMemo(() => {
    if (!currentSceneId || !entities) return [];

    return Object.values(entities).map((entity: any) => ({
      id: entity.id,
      name: entity.name,
      type: "entity",
      children: Object.values(entity.components).map((comp: any) => ({
        id: comp.id,
        name: comp.name,
        type: comp.type,
      })),
    }));
  }, [entities, currentSceneId]);

  const addEntityToScene = useEngineStore((state) => state.addEntityToScene);

  const handleAddEntity = () => {
    const createDefaultComponent =
      useSchemaStore.getState().createDefaultComponent;
    const newTransform = createDefaultComponent("localTransform");
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
    <div className="flex-1 h-full flex flex-col bg-secondary items-start overflow-hidden">
      <div className="w-full bg-primary/10 px-4 py-2 shrink-0">Hierarchy</div>
      <ContextMenu>
        <ContextMenuTrigger asChild onContextMenu={(e) => e.stopPropagation()}>
          <div className="flex-1 w-full min-h-0 px-2">
            <AutoSizer
              renderProp={({ height, width }: AutoSizerChildProps) => (
                <Tree data={treeData} height={height} width={width}>
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
            onClick={handleAddEntity}
          >
            Add Entity
          </Button>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
