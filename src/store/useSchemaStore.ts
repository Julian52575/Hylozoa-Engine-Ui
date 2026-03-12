import { create } from 'zustand';

interface ComponentSchema {
    type: string;
    label: string;
    properties: Record<string, {
        type: 'vector2' | 'enum' | 'boolean' | 'text' | 'number';
        label: string;
        default:any;
        options?: string[];
    }>;
}

interface SchemaState {
    schemas: Record<string, ComponentSchema>;
    hasLoaded: boolean;
    loadSchemas: () => Promise<void>;
}

export const useSchemaStore = create<SchemaState>((set,get) => ({
    schemas: {},
    hasLoaded: false,
    loadSchemas: async () => {
        if (get().hasLoaded) return;

        const modules = import.meta.glob('../ecsComponentSchemas/*.json', { eager: true });
        const loadedSchemas: Record<string, ComponentSchema> = {};
        Object.values(modules).forEach((module: any) => {
            const schema = module.default as ComponentSchema;
            loadedSchemas[schema.type] = schema;
        });
        set({ schemas: loadedSchemas, hasLoaded: true });
        console.log("Schemas loaded:", loadedSchemas);
    }
}));