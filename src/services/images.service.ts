import { api } from "@/lib/axios"
import type { VariantImage } from "@/types/api"

export async function uploadImage(variantId: string, file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const { data } = await api.post<{ data: VariantImage }>(
    `/variants/${variantId}/images`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  )
  return data.data
}

export async function deleteImage(variantId: string, imageId: string) {
  await api.delete(`/variants/${variantId}/images/${imageId}`)
}

export async function setPrimaryImage(variantId: string, imageId: string) {
  const { data } = await api.patch<{ data: VariantImage }>(
    `/variants/${variantId}/images/${imageId}/primary`
  )
  return data.data
}
