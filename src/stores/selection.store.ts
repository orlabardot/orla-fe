import { create } from "zustand"

export interface SelectedVariant {
  variantId: string
  skuVariant: string
  primaryImageUrl: string | null
}

interface SelectionState {
  selected: Map<string, SelectedVariant>
  toggle: (variant: SelectedVariant) => void
  clear: () => void
}

// Nota: não exponha um método "isSelected(id)" aqui — métodos do Zustand têm
// referência estável, então assiná-los via useSelectionStore(s => s.isSelected)
// não dispara re-render quando o Map muda. Assine `selected` diretamente e
// chame `selected.has(id)` no componente.
export const useSelectionStore = create<SelectionState>((set) => ({
  selected: new Map(),
  toggle: (variant) =>
    set((state) => {
      const next = new Map(state.selected)
      if (next.has(variant.variantId)) {
        next.delete(variant.variantId)
      } else {
        next.set(variant.variantId, variant)
      }
      return { selected: next }
    }),
  clear: () => set({ selected: new Map() }),
}))
