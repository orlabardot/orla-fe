import { api } from "@/lib/axios"
import type { LoginResponse } from "@/types/api"

export interface LoginPayload {
  email: string
  password: string
  tenantSlug: string
}

export async function login({ email, password, tenantSlug }: LoginPayload) {
  const { data } = await api.post<LoginResponse>(
    "/auth/login",
    { email, password },
    { headers: { "x-tenant-slug": tenantSlug } }
  )
  return data
}

export async function logout() {
  const { data } = await api.post<{ message: string }>("/auth/logout")
  return data
}
