import { api } from "@/lib/axios"
import type { CreateOrderBody, Order, OrderStatus } from "@/types/api"

export async function createOrder(body: CreateOrderBody) {
  const { data } = await api.post<{ data: Order }>("/orders", body)
  return data.data
}

export async function listOrders() {
  const { data } = await api.get<{ data: Order[] }>("/orders")
  return data.data
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { data } = await api.patch<{ data: Order }>(`/orders/${id}/status`, { status })
  return data.data
}
