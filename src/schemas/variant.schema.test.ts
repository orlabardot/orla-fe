import { describe, expect, it } from "vitest"
import {
  buildVariantSku,
  bulkCreateVariantsSchema,
  normalizeColorCode,
} from "@/schemas/variant.schema"

describe("buildVariantSku", () => {
  it("compõe SKU do produto + tamanho + código da cor", () => {
    expect(buildVariantSku({ sku: "ME2042", sizeMm: 62 }, "C2")).toBe("ME2042 62 C2")
  })

  it("omite o tamanho quando o produto não tem tamanho cadastrado", () => {
    // Sem esse cuidado o SKU sairia com espaço duplo no meio ("ME2042  C2").
    expect(buildVariantSku({ sku: "ME2042", sizeMm: null }, "C2")).toBe("ME2042 C2")
  })

  it("normaliza o código da cor para maiúsculas e sem espaços nas pontas", () => {
    expect(buildVariantSku({ sku: "ME2042", sizeMm: 62 }, " c2 ")).toBe("ME2042 62 C2")
  })

  it("ignora espaços nas pontas do SKU do produto", () => {
    expect(buildVariantSku({ sku: " ME2042 ", sizeMm: null }, "C1")).toBe("ME2042 C1")
  })

  it("preserva tamanho decimal", () => {
    expect(buildVariantSku({ sku: "OB8142", sizeMm: 62.5 }, "C3")).toBe("OB8142 62.5 C3")
  })
})

describe("normalizeColorCode", () => {
  it("deixa o código em maiúsculas e sem espaços nas pontas", () => {
    expect(normalizeColorCode("  c10 ")).toBe("C10")
  })
})

describe("bulkCreateVariantsSchema", () => {
  it("aceita uma lista de cores distintas", () => {
    const result = bulkCreateVariantsSchema.safeParse({
      variants: [{ colorCode: "C1" }, { colorCode: "C2", colorLabel: "Preto Fosco" }],
    })

    expect(result.success).toBe(true)
  })

  it("exige o código da cor", () => {
    const result = bulkCreateVariantsSchema.safeParse({ variants: [{ colorCode: "" }] })

    expect(result.success).toBe(false)
  })

  it("recusa cor repetida no lote, apontando o erro na linha duplicada", () => {
    const result = bulkCreateVariantsSchema.safeParse({
      variants: [{ colorCode: "C1" }, { colorCode: "C1" }],
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toEqual(["variants", 1, "colorCode"])
  })

  it("trata cor repetida com caixa diferente como duplicada", () => {
    // colorCode é único por produto no banco: "c1" e "C1" não podem coexistir.
    const result = bulkCreateVariantsSchema.safeParse({
      variants: [{ colorCode: "C1" }, { colorCode: "c1" }],
    })

    expect(result.success).toBe(false)
  })
})
