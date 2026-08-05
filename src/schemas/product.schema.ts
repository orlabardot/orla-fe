import { z } from "zod"
import type { CreateProductBody, Product, UpdateProductBody } from "@/types/api"

export const frameTypeOptions = ["grau", "sol", "clip-on", "esportivo"] as const
export const genderOptions = ["masculino", "feminino", "unissex", "infantil"] as const

const optionalPositiveNumber = z
  .string()
  .optional()
  .refine((val) => !val || (!Number.isNaN(Number(val)) && Number(val) > 0), {
    message: "Deve ser um número positivo",
  })

export const productSchema = z.object({
  sku: z.string().min(1, "SKU é obrigatório").max(100),
  name: z.string().min(1, "Nome é obrigatório").max(255),
  description: z.string().max(2000).optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  frameType: z.enum(frameTypeOptions).optional(),
  gender: z.enum(genderOptions).optional(),
  sizeMm: optionalPositiveNumber,
  bridgeSizeMm: optionalPositiveNumber,
  templeSizeMm: optionalPositiveNumber,
  tagIds: z.array(z.string()),
})

export type ProductFormValues = z.infer<typeof productSchema>

export const productFormDefaults: ProductFormValues = {
  sku: "",
  name: "",
  description: "",
  categoryId: "",
  brandId: "",
  frameType: undefined,
  gender: undefined,
  sizeMm: "",
  bridgeSizeMm: "",
  templeSizeMm: "",
  tagIds: [],
}

export function productFormToCreateBody(values: ProductFormValues): CreateProductBody {
  return {
    sku: values.sku,
    name: values.name,
    description: values.description || undefined,
    categoryId: values.categoryId || undefined,
    brandId: values.brandId || undefined,
    frameType: values.frameType,
    gender: values.gender,
    sizeMm: values.sizeMm ? Number(values.sizeMm) : undefined,
    bridgeSizeMm: values.bridgeSizeMm ? Number(values.bridgeSizeMm) : undefined,
    templeSizeMm: values.templeSizeMm ? Number(values.templeSizeMm) : undefined,
    tagIds: values.tagIds.length ? values.tagIds : undefined,
  }
}

export function productFormToUpdateBody(values: ProductFormValues): UpdateProductBody {
  return {
    name: values.name,
    description: values.description || undefined,
    categoryId: values.categoryId || null,
    brandId: values.brandId || null,
    frameType: values.frameType,
    gender: values.gender,
    sizeMm: values.sizeMm ? Number(values.sizeMm) : undefined,
    bridgeSizeMm: values.bridgeSizeMm ? Number(values.bridgeSizeMm) : undefined,
    templeSizeMm: values.templeSizeMm ? Number(values.templeSizeMm) : undefined,
    tagIds: values.tagIds,
  }
}

export function productToFormValues(product: Product): ProductFormValues {
  return {
    sku: product.sku,
    name: product.name,
    description: product.description ?? "",
    categoryId: product.category?.id ?? "",
    brandId: product.brand?.id ?? "",
    frameType: product.frameType ?? undefined,
    gender: product.gender ?? undefined,
    sizeMm: product.sizeMm?.toString() ?? "",
    bridgeSizeMm: product.bridgeSizeMm?.toString() ?? "",
    templeSizeMm: product.templeSizeMm?.toString() ?? "",
    tagIds: product.productTags.map((pt) => pt.tagId),
  }
}
