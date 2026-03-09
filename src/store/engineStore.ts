import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface Entity {
    id: string;
    name: string;
    components:any[];
}

interface SceneState {
    id: string;
    name: string;
    entities: Record<string, Entity>;
}

interface EngineState {
    version: string;
    scenes: Record<string, SceneState>;
    currentSceneId: string | null;

    addScene: (id:string, name: string) => void;
    removeScene: (id:string) => void;
    addEntity: (sceneId: string, entity: Entity) => void;
    removeEntity: (sceneId: string, entityId: string) => void;
}


export const serializeEngineState = (state: EngineState): object => {
    return {
        version: state.version,
        scenes : Object.values(state.scenes).map(scene => ({
            id: scene.id,
            name: scene.name,
            Entities: Object.values(scene.entities).map(entity => ({
                id: entity.id,
                name: entity.name,
                components: entity.components,
            })),
        }))
    };
};

export const loadEngineState = (data: any): void => {
    const scenes: Record<string, SceneState> = {};
    data.scenes.forEach((sceneData: any) => {
        const entities: Record<string, Entity> = {};
        sceneData.Entities.forEach((entityData: any) => {
            entities[entityData.id] = {
                id: entityData.id,
                name: entityData.name,
                components: entityData.components,
            };
        });
        scenes[sceneData.id] = {
            ...sceneData,
            entities,
        };
    });
    useEngineStore.setState({
        version: data.version,
        scenes
    });
};
export const useEngineStore = create<EngineState>()(
    persist(
        immer((set, _) => ({
            version: "1.0.0",
            scenes: {},
            currentSceneId: null,

            addScene: (id : string, name: string) => 
                set((state: EngineState) => {
                    state.scenes[id] = { id, name, entities: {} };
                    state.currentSceneId = id;
                }),
            addEntity: (sceneId: string, entity: Entity) => 
                set((state: EngineState) => {
                    const scene = state.scenes[sceneId];
                    if (scene) {
                        scene.entities[entity.id] = entity;
                    }
                }),
            removeScene: (id : string) => 
                set((state: EngineState) => {
                    delete state.scenes[id];
                    if (state.currentSceneId === id) {
                        const remainingIds = Object.keys(state.scenes);
                        state.currentSceneId = remainingIds.length > 0 ? remainingIds[0] : null;
                    }
                }),
            removeEntity: (sceneId: string, entityId: string) => 
                set((state: EngineState) => {
                    const scene = state.scenes[sceneId];
                    if (scene) {
                        delete scene.entities[entityId];
                    }
                }),
        })),
        {
            name: 'engine-storage',
        }
    )
);

