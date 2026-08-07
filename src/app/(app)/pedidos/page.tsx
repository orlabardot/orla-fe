"use client"

import { useQuery } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/domain/empty-state"
import { listOrders } from "@/services/orders.service"
import type { OrderStatus } from "@/types/api"

const statusLabels: Record<OrderStatus, string> = {
  pendente: "Pendente",
  atendido: "Atendido",
}

export default function MeusPedidosPage() {
  const { data, isLoading } = useQuery({ queryKey: ["orders"], queryFn: listOrders })

  return (
    <div className="px-4 py-6 md:px-6 md:py-8">
      <h1 className="font-playfair text-display-sm text-foreground">Meus pedidos</h1>
      <p className="mt-1 text-body-sm text-text-muted">
        Pedidos que você já finalizou pelo catálogo e enviou pra gente.
      </p>

      <div className="mt-6 space-y-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}

        {!isLoading && data?.length === 0 && (
          <EmptyState
            title="Nenhum pedido ainda"
            description="Selecione produtos no catálogo e finalize um pedido pra vê-lo aqui."
          />
        )}

        {data?.map((order) => (
          <div key={order.id} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-body-md text-foreground">
                {new Date(order.createdAt).toLocaleString("pt-BR")}
              </p>
              <Badge variant={order.status === "atendido" ? "outline" : "secondary"}>
                {statusLabels[order.status]}
              </Badge>
            </div>
            <ul className="mt-3 space-y-1">
              {order.items.map((item) => (
                <li key={item.id} className="text-body-sm text-text-secondary">
                  {item.quantity}x {item.skuVariant} — {item.productName}
                  {item.colorLabel ? ` (${item.colorLabel})` : ""}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
