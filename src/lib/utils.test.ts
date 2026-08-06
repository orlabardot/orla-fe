import { describe, expect, it } from "vitest"
import { cn } from "./utils"

describe("cn", () => {
  it("junta múltiplas classes em uma string", () => {
    expect(cn("a", "b", "c")).toBe("a b c")
  })

  it("ignora valores falsy (condicionais)", () => {
    expect(cn("a", false && "b", undefined, null, "c")).toBe("a c")
  })

  it("resolve conflito entre classes Tailwind, mantendo a última", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
  })

  it("aceita objetos de condição no estilo clsx", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active")
  })
})
