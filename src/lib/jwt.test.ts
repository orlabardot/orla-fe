import { describe, expect, it } from "vitest"
import { isTokenExpired } from "./jwt"

function makeToken(payload: Record<string, unknown> | null): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const body = payload === null ? "not-valid-json" : btoa(JSON.stringify(payload))
  return `${header}.${body}.signature`
}

describe("isTokenExpired", () => {
  it("retorna false para um token com exp no futuro", () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600
    expect(isTokenExpired(makeToken({ exp: futureExp }))).toBe(false)
  })

  it("retorna true para um token com exp no passado", () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600
    expect(isTokenExpired(makeToken({ exp: pastExp }))).toBe(true)
  })

  it("retorna true quando o payload não tem claim exp", () => {
    expect(isTokenExpired(makeToken({ sub: "user-1" }))).toBe(true)
  })

  it("retorna true para um token com payload não decodificável", () => {
    expect(isTokenExpired(makeToken(null))).toBe(true)
  })

  it("retorna true para um token malformado (não tem 3 partes)", () => {
    expect(isTokenExpired("token-sem-pontos")).toBe(true)
  })
})
