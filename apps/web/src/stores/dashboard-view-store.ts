import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ViewMode = 'grid' | 'list';

interface DashboardViewState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const useDashboardViewStore = create<DashboardViewState>()(
  persist(
    (set) => ({
      viewMode: 'grid',
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    { name: 'wend-dashboard-view' },
  ),
);
