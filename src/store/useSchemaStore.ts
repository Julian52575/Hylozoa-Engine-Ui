import { create } from "zustand";

interface PropertyDefinition {
  type: "vector2" | "enum" | "boolean" | "text" | "number" | "file" | "color";
  label: string;
  dependency?: string;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
  accept?: "image" | "video" | "audio";
}
interface Component {
  type: string;
  label: string;
  icon: string;
  schema: Record<string, PropertyDefinition>;
  values: Record<string, any>;
}

interface SchemaState {
  schemas: Record<string, Component>;
  hasLoaded: boolean;
  loadSchemas: () => Promise<void>;
  createDefaultComponent: (type: string) => ComponentInstance | null;
}
export interface ComponentInstance {
  type: string;
  values: Record<string, any>;
}

export const useSchemaStore = create<SchemaState>((set, get) => ({
  schemas: {},
  hasLoaded: false,
  loadSchemas: async () => {
    if (get().hasLoaded) return;
    try {
      const modules = import.meta.glob("../ecsComponentSchemas/*.json", {
        eager: true,
      });
      const loadedSchemas: Record<string, Component> = {};
      Object.values(modules).forEach((module: any) => {
        const schemaBlueprint = module.default as Component;
        loadedSchemas[schemaBlueprint.type] = schemaBlueprint;
      });
      set({ schemas: loadedSchemas, hasLoaded: true });
      console.log("Schemas loaded:", loadedSchemas);
    } catch (error) {
      console.error("Failed to load schemas:", error);
    }
  },
  createDefaultComponent: (type: string) => {
    const schema = get().schemas[type];
    if (!schema) {
      console.error(`No schema found for component type: ${type}`);
      return null;
    }
    return {
      type: schema.type,
      values: structuredClone(schema.values),
    };
  },
}));
