import { api } from "@/lib/axios"
import type { LoginResponse } from "@/types/api"

export interface LoginPayload {
  email: string
  password: string
}

export async function login({ email, password }: LoginPayload) {
  const { data } = await api.post<LoginResponse>("/auth/login", { email, password })
  return data
}

export async function logout() {
  const { data } = await api.post<{ message: string }>("/auth/logout")
  return data
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export async function changePassword(payload: ChangePasswordPayload) {
  const { data } = await api.put<{ message: string }>("/auth/password", payload)
  return data
}
