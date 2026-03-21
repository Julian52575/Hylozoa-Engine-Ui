import { create } from "zustand";

interface SelectionState {
    selectedEntityId: string | null;
    selectedSceneId: string | null;
    openComponentIds: string[];
    invisibleSceneIds: string[];

    
    selectEntity: (entityId: string | null) => void;
    selectScene: (sceneId: string | null) => void;
    setOpenComponents: (componentIds: string[]) => void;
    setInvisibleScenes: (sceneIds: string[]) => void;
}

export const useSelectionStore = create<SelectionState>()((set) => ({
    selectedEntityId: null,
    selectedSceneId: null,
    openComponentIds: [],
    invisibleSceneIds: [],

    selectEntity: (id) => set({ selectedEntityId: id}),
    selectScene: (id) => set({ selectedSceneId: id }),
    setOpenComponents: (componentIds) => set({ openComponentIds: componentIds }),
    setInvisibleScenes: (sceneIds) => set({ invisibleSceneIds: sceneIds }),

}));