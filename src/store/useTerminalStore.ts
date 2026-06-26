import { create } from "zustand";


const MAX_MESSAGES = 5000;

interface TerminalState {
    messages: {text: string, type: string}[];

    addMessageInfo: (message: string) => void;
    addMessageWarning: (message: string) => void;
    addMessageError: (message: string) => void;
    clearMessages: () => void;
}

const cappedMessages = (messages: TerminalState["messages"], newMsg: { text: string; type: string }) => {
  const next = [...messages, newMsg];
  return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
};

export const useTerminalStore = create<TerminalState>()((set) => ({
  messages: [],
  addMessageInfo: (message) =>
    set((state) => ({ messages: cappedMessages(state.messages, { text: message, type: "info" }) })),
  addMessageWarning: (message) =>
    set((state) => ({ messages: cappedMessages(state.messages, { text: message, type: "warning" }) })),
  addMessageError: (message) =>
    set((state) => ({ messages: cappedMessages(state.messages, { text: message, type: "error" }) })),
  clearMessages: () => set({ messages: [] }),
}));