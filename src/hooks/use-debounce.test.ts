import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useDebounce } from "./use-debounce"

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("useDebounce", () => {
  it("retorna o valor inicial imediatamente", () => {
    const { result } = renderHook(() => useDebounce("a", 300))
    expect(result.current).toBe("a")
  })

  it("não atualiza antes do delay", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "a" },
    })

    rerender({ value: "b" })
    act(() => {
      vi.advanceTimersByTime(299)
    })
    expect(result.current).toBe("a")
  })

  it("atualiza para o novo valor depois do delay", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "a" },
    })

    rerender({ value: "b" })
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current).toBe("b")
  })

  it("reinicia o timer quando o valor muda de novo antes do delay acabar", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "a" },
    })

    rerender({ value: "b" })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    rerender({ value: "c" })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    // ainda não passaram 300ms desde a última mudança (c)
    expect(result.current).toBe("a")

    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe("c")
  })
})
