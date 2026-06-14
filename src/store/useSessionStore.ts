import { create } from "zustand";

interface SessionState {
  overrides: Record<string, Record<string, any>>;
  currentOnglet: string;
  setCurrentOnglet: (onglet: string) => void;
  currentCodeFilePath?: string;
  setCurrentCodeFilePath: (path: string) => void;

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
  currentCodeFilePath: undefined,
  setCurrentCodeFilePath: (path) => set({ currentCodeFilePath: path }),
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
