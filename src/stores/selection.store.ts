import { create } from "zustand"

interface SelectionState {
  selectedIds: Set<string>
  toggle: (variantId: string) => void
  clear: () => void
  isSelected: (variantId: string) => boolean
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedIds: new Set(),
  toggle: (variantId) =>
    set((state) => {
      const next = new Set(state.selectedIds)
      if (next.has(variantId)) {
        next.delete(variantId)
      } else {
        next.add(variantId)
      }
      return { selectedIds: next }
    }),
  clear: () => set({ selectedIds: new Set() }),
  isSelected: (variantId) => get().selectedIds.has(variantId),
}))
