import { api } from "@/lib/axios"
import type { Tag } from "@/types/api"

export async function listTags() {
  const { data } = await api.get<{ data: Tag[] }>("/tags")
  return data.data
}

export async function createTag(name: string) {
  const { data } = await api.post<{ data: Tag }>("/tags", { name })
  return data.data
}

export async function updateTag(id: string, name: string) {
  const { data } = await api.put<{ data: Tag }>(`/tags/${id}`, { name })
  return data.data
}

export async function deleteTag(id: string) {
  await api.delete(`/tags/${id}`)
}
