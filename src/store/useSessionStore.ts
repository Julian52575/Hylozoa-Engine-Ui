import { create } from "zustand";

interface SessionState {
  overrides: Record<string, Record<string, any>>;
  currentOnglet: string;
  setCurrentOnglet: (onglet: string) => void;

  currentCodeFilePaths?: string[];
  addCodeFilePaths: (path: string) => void;
  removeCodeFilePath: (path: string) => void;

  setLiveProp: (
    entityId: string,
    componentId: string,
    props: Record<string, any>,
  ) => void;

}

export const useSessionStore = create<SessionState>((set) => ({
  overrides: {},
  currentOnglet: "scene",
  setCurrentOnglet: (onglet) => set({ currentOnglet: onglet }),
  currentCodeFilePaths: [],
  addCodeFilePaths: (path) =>
    set((state) => {
      if (state.currentCodeFilePaths?.includes(path)) {
        return state;
      }
      return {
        currentCodeFilePaths: [...(state.currentCodeFilePaths || []), path],
      };
    }),
  removeCodeFilePath: (path) =>
    set((state) => {
      if (!state.currentCodeFilePaths?.includes(path)) {
        return state;
      }
      return {
        currentCodeFilePaths: state.currentCodeFilePaths.filter(
          (p) => p !== path,
        ),
      };
    }),
  setLiveProp: (entityId, componentId, newProps) =>
    set((state) => {
      const current = state.overrides[entityId]?.[componentId];
      if (
        JSON.stringify(current) === JSON.stringify({ ...current, ...newProps })
      ) {
        return state;
      }
      return {
        overrides: {
          ...state.overrides,
          [entityId]: {
            ...state.overrides[entityId],
            [componentId]: {
              ...state.overrides[entityId]?.[componentId],
              ...newProps,
            },
          },
        },
      };
    }),
}));
