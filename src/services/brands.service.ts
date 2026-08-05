import { api } from "@/lib/axios"
import type { Brand } from "@/types/api"

export async function listBrands() {
  const { data } = await api.get<{ data: Brand[] }>("/brands")
  return data.data
}

export async function createBrand(name: string) {
  const { data } = await api.post<{ data: Brand }>("/brands", { name })
  return data.data
}

export async function updateBrand(id: string, name: string) {
  const { data } = await api.put<{ data: Brand }>(`/brands/${id}`, { name })
  return data.data
}

export async function deleteBrand(id: string) {
  await api.delete(`/brands/${id}`)
}
