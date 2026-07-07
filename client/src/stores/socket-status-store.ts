import { create } from 'zustand';

interface SocketStatusState {
  isConnected: boolean;
  activeNamespaces: string[];
  setConnected: (status: boolean) => void;
  addNamespace: (namespace: string) => void;
  removeNamespace: (namespace: string) => void;
}

export const useSocketStatusStore = create<SocketStatusState>((set) => ({
  isConnected: false,
  activeNamespaces: [],
  setConnected: (isConnected) => set({ isConnected }),
  addNamespace: (namespace) =>
    set((state) => ({
      activeNamespaces: state.activeNamespaces.includes(namespace)
        ? state.activeNamespaces
        : [...state.activeNamespaces, namespace],
    })),
  removeNamespace: (namespace) =>
    set((state) => ({
      activeNamespaces: state.activeNamespaces.filter((ns) => ns !== namespace),
    })),
}));
