import { EntitiesTree } from "../Hierarchie/EntitieesTree";
import { useEngineStore } from "@/store/engineStore";
import { useMemo } from "react";

type NodeData = {
    id: string;
    name: string;
    type: string;
    children?: NodeData[];
};

export function PrefabsManager() {
    const prefabs = useEngineStore((state) => state.prefabs);

    const treeData: NodeData[] = useMemo(() => {
        if (!prefabs) return [];
    
        return Object.values(prefabs).map((prefab: any) => ({
          id: prefab.id,
          name: prefab.name,
          type: "prefab",
          children: Object.values(prefab.components).map((comp: any) => ({
            id: comp.id,
            name: comp.name,
            type: comp.type,
          })),
        }));
      }, [prefabs]);

    const handleAddPrefab = async () => {
        await useEngineStore.getState().addPrefab(`Prefab ${Object.keys(useEngineStore.getState().prefabs).length + 1}`, {
            name: `Prefab ${Object.keys(useEngineStore.getState().prefabs).length + 1}`,
            type: "prefab",
            components: {},
        });
    };

    return (
        <div className="flex-1 h-full flex flex-col bg-secondary items-start">
            <EntitiesTree 
                addText="Add Prefab"
                treeData={treeData}
                onAddEntity={handleAddPrefab}
            />
        </div>
    );
}