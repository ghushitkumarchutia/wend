import { create } from 'zustand';

interface DashboardViewState {
  view: 'overview' | 'trips' | 'travelers' | 'finances';
  setView: (view: DashboardViewState['view']) => void;
}

export const useDashboardViewStore = create<DashboardViewState>((set) => ({
  view: 'overview',
  setView: (view) => set({ view }),
}));
