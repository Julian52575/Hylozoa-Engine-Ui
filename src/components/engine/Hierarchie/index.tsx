import { useSelectionStore } from "@/store/useSelectionStore";
import { useEngineStore } from "@/store/engineStore";
import { useSchemaStore } from "@/store/useSchemaStore";
import { useMemo } from "react";
import { EntitiesTree } from "./EntitieesTree";

type NodeData = {
  id: string;
  name: string;
  type: string;
  children?: NodeData[];
};

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

  const handleAddEntity = async () => {
    const createDefaultComponent =
      useSchemaStore.getState().createDefaultComponent;
    const newTransform = createDefaultComponent("localtransform");
    await addEntityToScene(currentSceneId!, {
      name: `Entity ${Object.keys(useEngineStore.getState().scenes[currentSceneId!].entities).length + 1}`,
      type: "entity",
      components: {
        default: {
          name: "localtransform",
          type: newTransform?.type || "localtransform",
          props: newTransform?.values || {},
        },
      },
    });
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-secondary items-start">
      <div className="w-full bg-primary/10 px-4 py-2 shrink-0">Entities</div>
      <EntitiesTree 
        onAddEntity={handleAddEntity} 
        treeData={treeData} 
      />
    </div>
  );
}
