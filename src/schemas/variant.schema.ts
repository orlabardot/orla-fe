import { z } from "zod"

export const createVariantSchema = z.object({
  skuVariant: z.string().min(1, "SKU da variante é obrigatório").max(150),
  colorCode: z.string().max(20).optional(),
  colorLabel: z.string().max(100).optional(),
})
export type CreateVariantFormValues = z.infer<typeof createVariantSchema>

export const editVariantSchema = z.object({
  colorLabel: z.string().max(100).optional(),
  isActive: z.boolean(),
})
export type EditVariantFormValues = z.infer<typeof editVariantSchema>
