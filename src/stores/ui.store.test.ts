import { beforeEach, describe, expect, it } from "vitest"
import { useUIStore } from "./ui.store"

const initialState = useUIStore.getState()

beforeEach(() => {
  useUIStore.setState(initialState, true)
})

describe("useUIStore", () => {
  it("começa com sidebarOpen false e gridColumns 5", () => {
    const state = useUIStore.getState()
    expect(state.sidebarOpen).toBe(false)
    expect(state.gridColumns).toBe(5)
  })

  it("setSidebarOpen atualiza sidebarOpen", () => {
    useUIStore.getState().setSidebarOpen(true)
    expect(useUIStore.getState().sidebarOpen).toBe(true)
  })

  it("setGridColumns atualiza gridColumns", () => {
    useUIStore.getState().setGridColumns(4)
    expect(useUIStore.getState().gridColumns).toBe(4)

    useUIStore.getState().setGridColumns(6)
    expect(useUIStore.getState().gridColumns).toBe(6)
  })
})
