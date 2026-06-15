import { create } from 'zustand';

type SocketStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

interface SocketStatusState {
  status: SocketStatus;
  setStatus: (status: SocketStatus) => void;
}

export const useSocketStatusStore = create<SocketStatusState>((set) => ({
  status: 'disconnected',
  setStatus: (status) => set({ status }),
}));
