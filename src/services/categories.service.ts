import { api } from "@/lib/axios"
import type { Category } from "@/types/api"

export async function listCategories() {
  const { data } = await api.get<{ data: Category[] }>("/categories")
  return data.data
}

export async function createCategory(name: string) {
  const { data } = await api.post<{ data: Category }>("/categories", { name })
  return data.data
}

export async function updateCategory(id: string, name: string) {
  const { data } = await api.put<{ data: Category }>(`/categories/${id}`, { name })
  return data.data
}

export async function deleteCategory(id: string) {
  await api.delete(`/categories/${id}`)
}
