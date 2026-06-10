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
  mainSceneId: string;

  setMainScene: (sceneId: string | undefined) => void;
  renameScene: (sceneId: string | undefined, newName: string) => void;
  addScene: (name: string) => Promise<string>;
  removeScene: (id: string | undefined) => void;
  duplicateScene: (id: string | undefined) => Promise<string | undefined>;

  renameEntity: (sceneId: string, entityId: string, newName: string) => void;
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

function unflattenProps(props: Record<string, any>) {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(props)) {
    const parts = key.split(".");
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

export const exportToEngine = (state: EngineState) => {
  return {
    version: state.version,
    MainScene: state.mainSceneId,
    scenes: Object.values(state.scenes).map((scene) => ({
      sceneID: scene.id,
      sceneName: scene.name,
      Entities: Object.values(scene.entities).map((entity) => {
        const transformedComponents = Object.values(entity.components).reduce(
          (acc, comp) => {
            const capitalizedName =
              comp.name.charAt(0).toUpperCase() + comp.name.slice(1);
            const props = unflattenProps(comp.props);
            if (capitalizedName === "Camera") {
              acc[capitalizedName] = {
                ...props,
                cullingMask: Array.isArray(comp.props.cullingMask)
                  ? props.cullingMask
                  : ["Default"],
              };
            } else {
              acc[comp.name] = props;
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
  useEngineStore.setState({ version: data.version || "1.0.0", scenes: {},mainSceneId: data.MainScene || "" });

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
        const componentId = `${entityId}-${compId}`;
        components[componentId] = {
          id: componentId,
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
        mainSceneId: "",

        addScene: async (name: string) => {
          const id = await generateUint64Id();
          set((state: EngineState) => {
            state.scenes[id] = { id, name, entities: {} };
          });
          return id;
        },
        duplicateScene: async (id: string | undefined) => {
          if (!id) return;
          const sceneToDuplicate = useEngineStore.getState().scenes[id];
          if (!sceneToDuplicate) return;

          const newId = await generateUint64Id();
          set((state: EngineState) => {
            state.scenes[newId] = {
              id: newId,
              name: `${sceneToDuplicate.name} Copy`,
              entities: JSON.parse(JSON.stringify(sceneToDuplicate.entities)),
            };
          });
          return newId;
        },
        setMainScene: (sceneId: string | undefined) => {
          set((state: EngineState) => {
            if (!sceneId || !state.scenes[sceneId]) return;
            state.mainSceneId = sceneId;
          });
        },
        renameScene: (sceneId: string | undefined, newName: string) => {
          set((state: EngineState) => {
            if (!sceneId) return;
            const scene = state.scenes[sceneId];
            if (scene) {
              scene.name = newName;
            }
          });
        },
        renameEntity: (sceneId: string, entityId: string, newName: string) => {
          set((state: EngineState) => {
            const scene = state.scenes[sceneId];
            if (!scene) return;
            const entity = scene.entities[entityId];
            if (entity) {
              entity.name = newName;
            }
          });
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
        removeScene: (id: string | undefined) =>
          set((state: EngineState) => {
            if (id && state.scenes[id]) {
              delete state.scenes[id];
              if (state.mainSceneId === id) {
                state.mainSceneId = Object.keys(state.scenes)[0] || "";
              }
            }
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
