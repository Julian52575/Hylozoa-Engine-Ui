import { create } from "zustand";

interface SelectionState {
    selectedEntityId: string | null;
    selectedSceneId: string | null;
    openComponentIds: string[];

    
    selectEntity: (entityId: string | null) => void;
    selectScene: (sceneId: string | null) => void;
    setOpenComponents: (componentIds: string[]) => void;
}

export const useSelectionStore = create<SelectionState>()((set) => ({
    selectedEntityId: null,
    selectedSceneId: null,
    openComponentIds: [],

    selectEntity: (id) => set({ selectedEntityId: id}),
    selectScene: (id) => set({ selectedSceneId: id }),
    setOpenComponents: (componentIds) => set({ openComponentIds: componentIds }),

}));