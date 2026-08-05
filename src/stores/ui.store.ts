import { create } from "zustand"

interface UIState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  gridColumns: 4 | 5 | 6
  setGridColumns: (columns: 4 | 5 | 6) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  gridColumns: 5,
  setGridColumns: (columns) => set({ gridColumns: columns }),
}))
