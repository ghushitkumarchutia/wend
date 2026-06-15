import { create } from 'zustand';

type PanelTab = 'chat' | 'polls' | 'updates';

interface CommunicationPanelState {
  activeTab: PanelTab;
  isOpen: boolean;
  setActiveTab: (tab: PanelTab) => void;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useCommunicationPanelStore = create<CommunicationPanelState>(
  (set) => ({
    activeTab: 'chat',
    isOpen: false,
    setActiveTab: (tab) => set({ activeTab: tab }),
    setIsOpen: (open) => set({ isOpen: open }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  }),
);
