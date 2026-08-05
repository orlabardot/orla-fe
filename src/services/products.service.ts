import { api } from "@/lib/axios"
import type {
  CatalogFilters,
  CreateProductBody,
  PaginatedResponse,
  Product,
  UpdateProductBody,
} from "@/types/api"

export async function listProducts(filters: CatalogFilters) {
  const { data } = await api.get<PaginatedResponse<Product>>("/products", {
    params: filters,
  })
  return data
}

export async function getProduct(id: string) {
  const { data } = await api.get<{ data: Product }>(`/products/${id}`)
  return data.data
}

export async function createProduct(body: CreateProductBody) {
  const { data } = await api.post<{ data: Product }>("/products", body)
  return data.data
}

export async function updateProduct(id: string, body: UpdateProductBody) {
  const { data } = await api.put<{ data: Product }>(`/products/${id}`, body)
  return data.data
}

export async function deleteProduct(id: string) {
  await api.delete(`/products/${id}`)
}
