import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  variantId: string
  skuVariant: string
  productName: string
  colorLabel: string | null
  primaryImageUrl: string | null
  quantity: number
}

interface CartState {
  // Rascunho do carrinho antes de finalizar — fica só no navegador
  // (localStorage). O pedido em si, depois de finalizado, vai pro banco
  // (ver src/services/orders.service.ts), não fica só aqui.
  items: Record<string, CartItem>
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (variantId: string) => void
  setQuantity: (variantId: string, quantity: number) => void
  clear: () => void
}

// Nota: não exponha um getter derivado (ex: "itemCount") aqui — métodos do
// Zustand têm referência estável e não disparam re-render quando os dados
// mudam. Componentes devem assinar `items` diretamente e derivar o que
// precisarem (mesmo padrão de selection.store.ts).
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: {},
      addItem: (item) =>
        set((state) => {
          const existing = state.items[item.variantId]
          return {
            items: {
              ...state.items,
              [item.variantId]: { ...item, quantity: (existing?.quantity ?? 0) + 1 },
            },
          }
        }),
      removeItem: (variantId) =>
        set((state) => {
          const rest = { ...state.items }
          delete rest[variantId]
          return { items: rest }
        }),
      setQuantity: (variantId, quantity) =>
        set((state) => {
          const existing = state.items[variantId]
          if (!existing) return state
          return {
            items: {
              ...state.items,
              [variantId]: { ...existing, quantity: Math.max(1, Math.floor(quantity)) },
            },
          }
        }),
      clear: () => set({ items: {} }),
    }),
    { name: "orla-cart" }
  )
)
