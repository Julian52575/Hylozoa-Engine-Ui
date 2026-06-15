import { EntitiesTree } from "../Hierarchie/EntitieesTree";

export function PrefabsManager() {
    return (
        <div className="flex-1 h-full flex flex-col bg-secondary items-start">
            <EntitiesTree 
                addText="Add Prefab"
            />
        </div>
    );
}