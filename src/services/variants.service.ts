import { api } from "@/lib/axios"
import type { CreateVariantBody, ProductVariant, UpdateVariantBody } from "@/types/api"

export async function listVariants(productId: string) {
  const { data } = await api.get<{ data: ProductVariant[] }>(
    `/products/${productId}/variants`
  )
  return data.data
}

export async function createVariant(productId: string, body: CreateVariantBody) {
  const { data } = await api.post<{ data: ProductVariant }>(
    `/products/${productId}/variants`,
    body
  )
  return data.data
}

export async function updateVariant(
  productId: string,
  variantId: string,
  body: UpdateVariantBody
) {
  const { data } = await api.put<{ data: ProductVariant }>(
    `/products/${productId}/variants/${variantId}`,
    body
  )
  return data.data
}

export async function deleteVariant(productId: string, variantId: string) {
  await api.delete(`/products/${productId}/variants/${variantId}`)
}
