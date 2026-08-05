import { api } from "@/lib/axios"
import type { CreateUserBody, ManagedUser, UpdateUserBody } from "@/types/api"

export async function listUsers() {
  const { data } = await api.get<{ data: ManagedUser[] }>("/users")
  return data.data
}

export async function createUser(body: CreateUserBody) {
  const { data } = await api.post<{ data: ManagedUser }>("/users", body)
  return data.data
}

export async function updateUser(id: string, body: UpdateUserBody) {
  const { data } = await api.put<{ data: ManagedUser }>(`/users/${id}`, body)
  return data.data
}
