import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { temporal } from "zundo";
import { Component } from "lucide-react";
import { generateUint64Id } from "@/lib/engineAPI";

import { writeTextFile } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";

import { useSelectionStore } from "./useSelectionStore";
import { useSchemaStore } from "./useSchemaStore";

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
  prefabs: Record<string, Entity>;
  tags: string[];
  layers: string[];

  addLayer: (layer: string) => void;
  removeLayer: (layer: string) => void;
  renameLayer: (oldLayer: string, newLayer: string) => void;

  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  renameTag: (oldTag: string, newTag: string) => void;
  addPrefab: (name: string, prefab: Entity) => Promise<string>;
  addComponentToPrefab: (
    prefabId: string,
    component: Component,
  ) => Promise<void>;
  removeComponentFromPrefab: (prefabId: string, componentId: string) => void;
  updateComponentPropsFromPrefab: (
    prefabId: string,
    componentId: string,
    newProps: Record<string, any>,
  ) => void;
  removePrefab: (id: string) => void;
  renamePrefab: (id: string, newName: string) => void;

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

export const saveEngineStateToFile = async (
  folderPath: string,
  projectName: string,
): Promise<void> => {
  const state = useEngineStore.getState();
  const formattedData = exportToEngine(state);
  const jsonString = JSON.stringify(formattedData, null, 2);
  const fileName = `${projectName}.hlz`;
  const filePath = await join(folderPath, fileName);
  await writeTextFile(filePath, jsonString);
};

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
    tags : state.tags,
    layers: state.layers,
    prefabs: Object.values(state.prefabs).map((prefab) => {
      const transformedComponents = Object.fromEntries(
        Object.values(prefab.components).map((comp) => [
          comp.type,
          unflattenProps(comp.props),
        ]),
      );
      if (!transformedComponents["Name"]) {
        transformedComponents["Name"] = { name: prefab.name };
      }
      return {
        prefabName: prefab.name,
        Entities: [
          {
            id: 0,
            Parent: null,
            Components: transformedComponents,
          },
        ],
      };
    }),
    scenes: Object.values(state.scenes).map((scene) => ({
      sceneID: scene.id,
      sceneName: scene.name,
      Entities: Object.values(scene.entities).map((entity) => {
        const transformedComponents = Object.fromEntries(
          Object.values(entity.components).map((comp) => [
            comp.type,
            unflattenProps(comp.props),
          ]),
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

const isNestedObject = (value: any): boolean => {
  if (typeof value !== "object" || value === null) return false;
  if (Array.isArray(value)) return false;

  const keys = Object.keys(value);

  const isVector2 =
    keys.includes("x") && keys.includes("y") && keys.length === 2;

  const isColor =
    keys.includes("r") && keys.includes("g") && keys.includes("b");

  return !isVector2 && !isColor;
};

export const loadEngineState = (data: any): void => {
  const scenes: Record<string, SceneState> = {};
  const prefabs: Record<string, Entity> = {};
  if (!data || !data.scenes) {
    useEngineStore.setState({ version: "1.0.0", scenes: {} });
    return;
  }
  useEngineStore.setState({
    version: data.version || "1.0.0",
    scenes: {},
    mainSceneId: data.MainScene || "",
    tags: data.tags || [],
    prefabs: {},
    layers: data.layers || ["Default"],
  });

  const schemas = useSchemaStore.getState().schemas;

  data.scenes.forEach((sceneData: any) => {
    const entities: Record<string, Entity> = {};
    const entitiesList = sceneData.Entities || sceneData.entities || [];
    entitiesList.forEach((entityData: any) => {
      const entityId = entityData.UUID || entityData.id;
      const components: Record<string, Component> = {};
      const rawComponents =
        entityData.Components || entityData.components || {};

      let name = "Unnamed Entity";
      Object.entries(rawComponents).forEach(
        ([compName, compProps]: [string, any]) => {
          if (compName.toLowerCase() === "name") {
            name = compProps.name;
            return;
          }
          const compId = compProps.id || compName.toLowerCase();
          const componentId = `${entityId}-${compId}`;
          if (compProps && typeof compProps === "object") {
            const entries = Object.entries(compProps);
            for (const [key, value] of entries) {
              if (isNestedObject(value)) {
                for (const [nestedKey, nestedValue] of Object.entries(
                  value as Record<string, any>,
                )) {
                  compProps[`${key}.${nestedKey}`] = nestedValue;
                }
                delete compProps[key];
              }
            }
          }
          const type = compName.toLowerCase();
          const schema = schemas[type];
          if (!schema) {
            console.warn(
              `Component type "${type}" not found in schemas. Skipping component.`,
            );
            return;
          }

          components[componentId] = {
            id: componentId,
            name: schema.label || compName,
            type: type,
            props: compProps,
          };
        },
      );

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

  data.prefabs?.forEach((prefabData: any, index: number) => {
    const prefabId = `prefab-${index}-${Date.now()}`;
    const components: Record<string, Component> = {};

    const prefabName = prefabData.prefabName || "Unnamed Prefab";
    const rootEntity = prefabData.Entities?.[0];
    const rawComponents = rootEntity?.Components || {};

    let name = prefabName;
    Object.entries(rawComponents).forEach(
      ([compName, compProps]: [string, any]) => {
        if (compName.toLowerCase() === "name") {
          name = compProps.name;
          return;
        }
        const compId = compProps.id || compName.toLowerCase();
        const componentId = `${prefabId}-${compId}`;

        if (compProps && typeof compProps === "object") {
          const entries = Object.entries(compProps);
          for (const [key, value] of entries) {
            if (isNestedObject(value)) {
              for (const [nestedKey, nestedValue] of Object.entries(
                value as Record<string, any>,
              )) {
                compProps[`${key}.${nestedKey}`] = nestedValue;
              }
              delete compProps[key];
            }
          }
        }

        const type = compName.toLowerCase();
        const schema = schemas[type];
        if (!schema) {
          console.warn(
            `Component type "${type}" not found in schemas. Skipping component.`,
          );
          return;
        }

        components[componentId] = {
          id: componentId,
          name: schema.label || compName,
          type: type,
          props: compProps,
        };
      },
    );

    prefabs[prefabId] = {
      id: prefabId,
      name,
      type: "prefab",
      components,
    };
  });
  console.log("Loaded engine prefabs:", prefabs);
  useEngineStore.setState({
    version: data.version || "1.0.0",
    scenes,
    prefabs,
  });
  useSelectionStore.setState({ selectedSceneId: data.MainScene || "" });
};

export const useEngineStore = create<EngineState>()(
  temporal(
    persist(
      immer((set, _) => ({
        version: "1.0.0",
        scenes: {},
        mainSceneId: "",
        prefabs: {},
        tags: [],
        layers: [],
        addLayer: (layer: string) => {
          set((state: EngineState) => {
            if (!state.layers.includes(layer)) {
              state.layers.push(layer);
            }
          });
        },
        removeLayer: (layer: string) => {
          set((state: EngineState) => {
            state.layers = state.layers.filter((l) => l !== layer);

            const fallbackLayer = state.layers[0];
            Object.values(state.scenes).forEach((scene) => {
              Object.values(scene.entities).forEach((entity) => {
                Object.values(entity.components).forEach((component) => {
                  if (component.type === "renderable") {
                    if (component.props.layer === layer) {
                      component.props.layer = fallbackLayer || "Default";
                    }
                  }
                });
              });
            });

            Object.values(state.prefabs).forEach((prefab) => {
              Object.values(prefab.components).forEach((component) => {
                if (component.type === "renderable") {
                  if (component.props.layer === layer) {
                    component.props.layer = fallbackLayer || "Default";
                  }
                }
              });
            });
          });
        },
        renameLayer: (oldLayer: string, newLayer: string) => {
          set((state: EngineState) => {
            const index = state.layers.indexOf(oldLayer);
            if (index !== -1 && !state.layers.includes(newLayer)) {
              state.layers[index] = newLayer;

              Object.values(state.scenes).forEach((scene) => {
                Object.values(scene.entities).forEach((entity) => {
                  Object.values(entity.components).forEach((component) => {
                    if (component.type === "renderable") {
                      if (component.props.layer === oldLayer) {
                        component.props.layer = newLayer;
                      }
                    }
                  });
                });
              });

              Object.values(state.prefabs).forEach((prefab) => {
                Object.values(prefab.components).forEach((component) => {
                  if (component.type === "renderable") {
                    if (component.props.layer === oldLayer) {
                      component.props.layer = newLayer;
                    }
                  }
                });
              });
            }
          });
        },
        addTag: (tag: string) => {
          set((state: EngineState) => {
            if (!state.tags.includes(tag)) {
              state.tags.push(tag);
            }
          });
        },
        removeTag: (tag: string) => {
          set((state: EngineState) => {
            state.tags = state.tags.filter((t) => t !== tag);
          });
        },
        renameTag: (oldTag: string, newTag: string) => {
          set((state: EngineState) => {
            const index = state.tags.indexOf(oldTag);
            if (index !== -1 && !state.tags.includes(newTag)) {
              state.tags[index] = newTag;
            }
          });
        },
        addPrefab: async (name: string, prefab: Entity) => {
          const id = await generateUint64Id();
          set((state: EngineState) => {
            state.prefabs[id] = { ...prefab, id };
            state.prefabs[id].name = name;
          });
          return id;
        },
        removeComponentFromPrefab: (prefabId: string, componentId: string) => {
          set((state: EngineState) => {
            const prefab = state.prefabs[prefabId];
            if (prefab) {
              delete prefab.components[componentId];
            }
          });
        },
        updateComponentPropsFromPrefab: (
          prefabId: string,
          componentId: string,
          newProps: Record<string, any>,
        ) => {
          set((state: EngineState) => {
            const prefab = state.prefabs[prefabId];
            if (prefab) {
              const component = prefab.components[componentId];
              if (component) {
                component.props = { ...component.props, ...newProps };
              }
            }
          });
        },
        addComponentToPrefab: async (
          prefabId: string,
          component: Component,
        ) => {
          const id = await generateUint64Id();
          set((state: EngineState) => {
            const prefab = state.prefabs[prefabId];
            if (prefab) {
              prefab.components[id] = { ...component, id };
            }
          });
        },
        removePrefab: (id: string) =>
          set((state: EngineState) => {
            if (state.prefabs[id]) {
              delete state.prefabs[id];
            }
          }),
        renamePrefab: (id: string, newName: string) =>
          set((state: EngineState) => {
            const prefab = state.prefabs[id];
            if (prefab) {
              prefab.name = newName;
            }
          }),

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
          const entityId = await generateUint64Id();
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
