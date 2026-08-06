import { beforeEach, describe, expect, it } from "vitest"
import { useSelectionStore } from "./selection.store"

const variantA = { variantId: "a", skuVariant: "SKU-A", primaryImageUrl: null }
const variantB = { variantId: "b", skuVariant: "SKU-B", primaryImageUrl: "https://example.com/b.jpg" }

beforeEach(() => {
  useSelectionStore.setState({ selected: new Map() })
})

describe("useSelectionStore", () => {
  it("começa vazio", () => {
    expect(useSelectionStore.getState().selected.size).toBe(0)
  })

  it("toggle adiciona uma variante não selecionada", () => {
    useSelectionStore.getState().toggle(variantA)
    const { selected } = useSelectionStore.getState()
    expect(selected.size).toBe(1)
    expect(selected.get("a")).toEqual(variantA)
  })

  it("toggle remove uma variante já selecionada", () => {
    useSelectionStore.getState().toggle(variantA)
    useSelectionStore.getState().toggle(variantA)
    expect(useSelectionStore.getState().selected.size).toBe(0)
  })

  it("mantém múltiplas variantes selecionadas independentemente", () => {
    useSelectionStore.getState().toggle(variantA)
    useSelectionStore.getState().toggle(variantB)
    expect(useSelectionStore.getState().selected.size).toBe(2)

    useSelectionStore.getState().toggle(variantA)
    const { selected } = useSelectionStore.getState()
    expect(selected.size).toBe(1)
    expect(selected.has("b")).toBe(true)
  })

  it("clear esvazia toda a seleção", () => {
    useSelectionStore.getState().toggle(variantA)
    useSelectionStore.getState().toggle(variantB)
    useSelectionStore.getState().clear()
    expect(useSelectionStore.getState().selected.size).toBe(0)
  })
})
