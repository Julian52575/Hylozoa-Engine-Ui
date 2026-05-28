import { create } from "zustand";

interface TerminalState {
    messages: {text: string, type: string}[];

    addMessageInfo: (message: string) => void;
    addMessageWarning: (message: string) => void;
    addMessageError: (message: string) => void;
    clearMessages: () => void;
}

export const useTerminalStore = create<TerminalState>()((set) => ({
    messages: [],

    addMessageInfo: (message) => set((state) => ({ messages: [...state.messages, { text: message, type: "info" }] })),
    addMessageWarning: (message) => set((state) => ({ messages: [...state.messages, { text: message, type: "warning" }] })),
    addMessageError: (message) => set((state) => ({ messages: [...state.messages, { text: message, type: "error" }] })),
    clearMessages: () => set({ messages: [] }),
}));