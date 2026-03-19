import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { temporal } from "zundo";
import { v4 as uuidv4 } from 'uuid';

export interface Component {
  id?: string;
  name: string;
  type: string;
  props: Record<string, any>;
}

export interface Entity {
  id?: string;
  name: string;
  type: string;
  components: Record<string, Component>;
}

interface SceneState {
  id?: string;
  name: string;
  entities: Record<string, Entity>;
}

interface EngineState {
  version: string;
  scenes: Record<string, SceneState>;

  addScene: (name: string) => string;
  removeScene: (id: string) => void;
  addEntityToScene: (sceneId: string, entity: Entity) => void;
  removeEntityFromScene: (sceneId: string, entityId: string) => void;
  addComponentToEntity: (
    sceneId: string,
    entityId: string,
    component: Component,
  ) => void;
  removeComponentFromEntity: (
    sceneId: string,
    entityId: string,
    componentId: string,
  ) => void;
  updateComponentProps: (
    sceneId: string,
    entityId: string,
    componentId: string,
    newProps: Record<string, any>,
  ) => void;
}

export const serializeEngineState = (state: EngineState): object => {
  return {
    version: state.version,
    scenes: Object.values(state.scenes).map((scene) => ({
      id: scene.id,
      name: scene.name,
      Entities: Object.values(scene.entities).map((entity) => ({
        id: entity.id,
        name: entity.name,
        components: entity.components,
      })),
    })),
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
        type: entityData.type,
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
    scenes,
  });
};
export const useEngineStore = create<EngineState>()(
  temporal(
    persist(
      immer((set, _) => ({
        version: "1.0.0",
        scenes: {},
        currentSceneId: null,

        addScene: (name: string) => {
          const id = uuidv4();
          set((state: EngineState) => {
            state.scenes[id] = { id, name, entities: {} };
          })
          return id;
        },
        addEntityToScene: (sceneId: string, entity: Entity) =>
          set((state: EngineState) => {
            const scene = state.scenes[sceneId];
            if (!scene)return;
            const entityId = uuidv4();
            const processedComponents: Record<string, Component> = {};
            if (entity.components) {
              Object.values(entity.components).forEach((comp) => {
                const compId = uuidv4();
                processedComponents[compId] = { ...comp, id: compId };
              });
            }
            const newEntity = { ...entity, id: entityId, components: processedComponents };
            scene.entities[entityId] = newEntity;
          }),
        removeScene: (id: string) =>
          set((state: EngineState) => {
            delete state.scenes[id];
          }),
        removeEntityFromScene: (sceneId: string, entityId: string) =>
          set((state: EngineState) => {
            const scene = state.scenes[sceneId];
            if (scene) {
              delete scene.entities[entityId];
            }
          }),
        addComponentToEntity: (
          sceneId: string,
          entityId: string,
          component: Component,
        ) =>
          set((state: EngineState) => {
            const scene = state.scenes[sceneId];
            if (scene) {
              const entity = scene.entities[entityId];
              if (entity) {
                const id = uuidv4();
                const newComponent = { ...component, id };
                entity.components[newComponent.id] = newComponent;
              }
            }
          }),
        removeComponentFromEntity: (
          sceneId: string,
          entityId: string,
          componentId: string,
        ) =>
          set((state: EngineState) => {
            const scene = state.scenes[sceneId];
            if (scene) {
              const entity = scene.entities[entityId];
              if (entity) {
                delete entity.components[componentId];
              }
            }
          }),
        updateComponentProps: (
          sceneId: string,
          entityId: string,
          componentId: string,
          newProps: Record<string, any>,
        ) =>
          set((state: EngineState) => {
            console.log(`Updating props`);
            const scene = state.scenes[sceneId];
            if (scene) {
              console.log(`Found scene ${sceneId}`);
              const entity = scene.entities[entityId];
              if (entity) {
                console.log(`Found entity ${entityId}`);
                const component = entity.components[componentId];
                if (component) {
                  console.log(`Found component ${componentId}`);
                  component.props = { ...component.props, ...newProps };
                  console.log(
                    `Updated props for component ${componentId} of entity ${entityId} in scene ${sceneId}`,
                    component.props,
                  );
                }
              }
            }
          }),
      })),
      {
        name: "engine-storage",
      },
    ),
    {
      limit: 50,
      partialize: (state) => ({ version: state.version, scenes: state.scenes }),
    },
  ),
);
