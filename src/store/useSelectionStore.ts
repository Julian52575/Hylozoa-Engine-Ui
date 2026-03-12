import { create } from "zustand";

interface SelectionState {
    selectedEntityId: string | null;
    selectedComponentId: string | null;

    selectEntity: (entityId: string | null) => void;
    selectComponent: (componentId: string | null) => void;
}

export const useSelectionStore = create<SelectionState>()((set) => ({
    selectedEntityId: null,
    selectedComponentId: null,

    selectEntity: (id) => set({ selectedEntityId: id}),
    selectComponent: (id) => set({ selectedComponentId: id }),
}));