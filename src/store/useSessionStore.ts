import { create } from "zustand";

interface SessionState {
  overrides: Record<string, Record<string, any>>;

  setLiveProp: (
    entityId: string,
    componentId: string,
    props: Record<string, any>,
  ) => void;

  clearOverrides: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  overrides: {},
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
  clearOverrides: () => set({ overrides: {} }),
}));
