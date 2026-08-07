import { api } from "@/lib/axios"
import type { TenantSettings } from "@/types/api"

export async function getTenantSettings() {
  const { data } = await api.get<{ data: TenantSettings }>("/tenant/settings")
  return data.data
}

export async function updateTenantSettings(whatsappPhone: string) {
  const { data } = await api.patch<{ data: TenantSettings }>("/tenant/settings", {
    whatsappPhone,
  })
  return data.data
}
