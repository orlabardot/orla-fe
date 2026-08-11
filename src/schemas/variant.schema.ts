import { z } from "zod"

export function normalizeColorCode(value: string) {
  // Maiúsculas porque colorCode é único por produto no banco: "c2" e "C2" entrariam
  // como duas cores diferentes do mesmo modelo.
  return value.trim().toUpperCase()
}

/**
 * SKU da variante é **derivado**, nunca digitado: a variante é uma cor de um modelo que
 * já existe, então herda o SKU do produto e acrescenta a identificação da cor.
 *
 * Ex.: produto "ME2042" de 62mm + cor "C2" → "ME2042 62 C2".
 *
 * O tamanho entra só quando está cadastrado no produto — sem isso o SKU sairia com um
 * buraco no meio ("ME2042  C2").
 */
export function buildVariantSku(
  product: { sku: string; sizeMm: number | null },
  colorCode: string
) {
  const parts = [product.sku.trim()]

  if (product.sizeMm !== null) {
    parts.push(String(product.sizeMm))
  }

  const code = normalizeColorCode(colorCode)
  if (code) {
    parts.push(code)
  }

  return parts.join(" ")
}

/** Uma cor a ser adicionada ao modelo. O SKU sai de buildVariantSku, não do formulário. */
export const variantColorSchema = z.object({
  colorCode: z
    .string()
    .min(1, "Código da cor é obrigatório")
    .max(20, "Código da cor deve ter no máximo 20 caracteres"),
  colorLabel: z.string().max(100).optional(),
})
export type VariantColorFormValues = z.infer<typeof variantColorSchema>

export const bulkCreateVariantsSchema = z
  .object({
    variants: z.array(variantColorSchema).min(1),
  })
  .superRefine((value, ctx) => {
    // O backend também recusa cor repetida, mas ali é tudo-ou-nada: o lote inteiro falha.
    // Barrar aqui evita perder o que já foi digitado nas outras linhas.
    const seen = new Set<string>()

    value.variants.forEach((variant, index) => {
      const code = normalizeColorCode(variant.colorCode)
      if (!code) return

      if (seen.has(code)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variants", index, "colorCode"],
          message: `Cor "${code}" repetida nesta lista`,
        })
        return
      }

      seen.add(code)
    })
  })
export type BulkCreateVariantsFormValues = z.infer<typeof bulkCreateVariantsSchema>

export const editVariantSchema = z.object({
  colorLabel: z.string().max(100).optional(),
  isActive: z.boolean(),
})
export type EditVariantFormValues = z.infer<typeof editVariantSchema>
