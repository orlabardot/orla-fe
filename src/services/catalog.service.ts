import { api } from "@/lib/axios"
import type { CatalogFilters, CatalogItem, PaginatedResponse } from "@/types/api"

export async function getCatalog(filters: CatalogFilters) {
  const { data } = await api.get<PaginatedResponse<CatalogItem>>("/catalog", {
    params: filters,
  })
  return data
}
