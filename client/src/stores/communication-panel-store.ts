import { create } from 'zustand';

interface CommunicationPanelState {
  isOpen: boolean;
  activeTab: 'chat' | 'polls' | 'updates';
  activeTripId: string | null;
  openPanel: (tripId: string, tab?: 'chat' | 'polls' | 'updates') => void;
  closePanel: () => void;
  setTab: (tab: 'chat' | 'polls' | 'updates') => void;
}

export const useCommunicationPanelStore = create<CommunicationPanelState>((set) => ({
  isOpen: false,
  activeTab: 'chat',
  activeTripId: null,
  openPanel: (tripId, tab = 'chat') =>
    set({ isOpen: true, activeTripId: tripId, activeTab: tab }),
  closePanel: () => set({ isOpen: false, activeTripId: null }),
  setTab: (tab) => set({ activeTab: tab }),
}));
