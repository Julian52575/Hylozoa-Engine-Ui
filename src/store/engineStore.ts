import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { temporal } from "zundo";
import { Component } from "lucide-react";

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

export const exportToEngine = (state: EngineState) => {
  return {
    version: state.version,
    scenes: Object.values(state.scenes).map((scene) => ({
      sceneID: scene.id,
      sceneName: scene.name,
      Entities: Object.values(scene.entities).map((entity) => {
        const transformedComponents = Object.values(entity.components).reduce(
          (acc, comp) => {
            const capitalizedName =
              comp.name.charAt(0).toUpperCase() + comp.name.slice(1);
            if (capitalizedName === "Camera") {
              acc[capitalizedName] = {
                ...comp.props,
                cullingMask: Array.isArray(comp.props.cullingMask)
                  ? comp.props.cullingMask
                  : ["Default"],
              };
            } else {
              acc[capitalizedName] = { ...comp.props };
            }
            return acc;
          },
          {} as Record<string, any>,
        );
        if (!transformedComponents["Name"]) {
          transformedComponents["Name"] = { "name": entity.name };
        }
        return {
          UUID: entity.id,
          Parent: null,
          Components: transformedComponents,
        };
      }),
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

const generateUint64Id = (): string => {
  const array = new Uint32Array(2);
  window.crypto.getRandomValues(array);
  const high = BigInt(array[0]);
  const low = BigInt(array[1]);
  const uuid64 = (high << 32n) | low;
  return uuid64.toString();
};
export const useEngineStore = create<EngineState>()(
  temporal(
    persist(
      immer((set, _) => ({
        version: "1.0.0",
        scenes: {},

        addScene: (name: string) => {
          const id = generateUint64Id();
          set((state: EngineState) => {
            state.scenes[id] = { id, name, entities: {} };
          });
          return id;
        },
        addEntityToScene: (sceneId: string, entity: Entity) =>
          set((state: EngineState) => {
            const scene = state.scenes[sceneId];
            if (!scene) return;
            const entityId = generateUint64Id();
            const processedComponents: Record<string, Component> = {};
            if (entity.components) {
              Object.values(entity.components).forEach((comp) => {
                const compId = generateUint64Id();
                processedComponents[compId] = { ...comp, id: compId };
              });
            }
            const newEntity = {
              ...entity,
              id: entityId,
              components: processedComponents,
            };
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
                const id = generateUint64Id();
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
            const scene = state.scenes[sceneId];
            if (scene) {
              const entity = scene.entities[entityId];
              if (entity) {
                const component = entity.components[componentId];
                if (component) {
                  component.props = { ...component.props, ...newProps };
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
