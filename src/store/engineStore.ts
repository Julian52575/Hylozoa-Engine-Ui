import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { temporal } from "zundo";
import { Component } from "lucide-react";
import { generateUint64Id } from "@/lib/engineAPI";

import { writeTextFile } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";

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

  addScene: (name: string) => Promise<string>;
  removeScene: (id: string) => void;
  addEntityToScene: (sceneId: string, entity: Entity) => Promise<void>;
  removeEntityFromScene: (sceneId: string, entityId: string) => void;
  addComponentToEntity: (
    sceneId: string,
    entityId: string,
    component: Component,
  ) => Promise<void>;
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

export const saveEngineStateToFile = async (folderPath: string, projectName: string): Promise<void> => {
  const state = useEngineStore.getState();
  const formattedData = exportToEngine(state);
  const jsonString = JSON.stringify(formattedData, null, 2);
  const fileName = `${projectName}.hlz`;
  const filePath = await join(folderPath, fileName);
  await writeTextFile(filePath, jsonString);
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
              acc[comp.name] = { ...comp.props };
            }
            return acc;
          },
          {} as Record<string, any>,
        );
        if (!transformedComponents["Name"]) {
          transformedComponents["Name"] = { name: entity.name };
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
  if (!data || !data.scenes) {
    useEngineStore.setState({ version: "1.0.0", scenes: {} });
    return;
  }

  data.scenes.forEach((sceneData: any) => {
    const entities: Record<string, Entity> = {};
    const entitiesList = sceneData.Entities || sceneData.entities || [];
    entitiesList.forEach((entityData: any) => {
      const entityId = entityData.UUID || entityData.id;
      const components: Record<string, Component> = {};
      const rawComponents = entityData.Components || entityData.components || {};

      let name = "Unnamed Entity";
      Object.entries(rawComponents).forEach(([compName, compProps] : [string, any]) => {
        if (compName.toLowerCase() === "name") {
          name = compProps.name;
          return;
        }
        const compId = compProps.id || compName.toLowerCase();
        components[compId] = {
          id: `${entityId}-${compId}`,
          name: compName,
          type: compName.toLowerCase(),
          props: compProps,
        };
      });
      
      entities[entityId] = {
        id: entityId,
        name: name,
        type: "entity",
        components,
      };
    });

    const sceneId = sceneData.sceneID || sceneData.id;
    scenes[sceneId] = {
      id: sceneId,
      name: sceneData.sceneName || sceneData.name || "Unnamed Scene",
      entities,
    };
  });

  useEngineStore.setState({ version: data.version || "1.0.0", scenes });
};



export const useEngineStore = create<EngineState>()(
  temporal(
    persist(
      immer((set, _) => ({
        version: "1.0.0",
        scenes: {},

        addScene: async (name: string) => {
          const id = await generateUint64Id();
          set((state: EngineState) => {
            state.scenes[id] = { id, name, entities: {} };
          });
          return id;
        },
        addEntityToScene: async (sceneId: string, entity: Entity) => {
          // 1. Préparation de l'ID de l'entité
          const entityId = await generateUint64Id();

          // 2. Préparation des composants (en parallèle pour la performance)
          const processedComponents: Record<string, Component> = {};
          if (entity.components) {
            const entries = await Promise.all(
              Object.values(entity.components).map(async (comp) => {
                const compId = await generateUint64Id();
                return [compId, { ...comp, id: compId }];
              }),
            );
            Object.assign(processedComponents, Object.fromEntries(entries));
          }

          // 3. Mutation finale de l'état
          set((state: EngineState) => {
            const scene = state.scenes[sceneId];
            if (!scene) return;
            scene.entities[entityId] = {
              ...entity,
              id: entityId,
              components: processedComponents,
            };
          });
        },
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
        addComponentToEntity: async (
          sceneId: string,
          entityId: string,
          component: Component,
        ) => {
          const id = await generateUint64Id();

          set((state: EngineState) => {
            const scene = state.scenes[sceneId];
            const entity = scene?.entities[entityId];
            if (entity) {
              entity.components[id] = { ...component, id };
            }
          });
        },
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
