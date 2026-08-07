"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { getApiErrorMessage } from "@/lib/api-error"
import { listOrders, updateOrderStatus } from "@/services/orders.service"
import type { OrderStatus } from "@/types/api"

const statusLabels: Record<OrderStatus, string> = {
  pendente: "Pendente",
  atendido: "Atendido",
}

export default function PedidosAdminPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["orders"], queryFn: listOrders })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] })
      toast.success("Status atualizado")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  return (
    <div>
      <h1 className="font-playfair text-display-sm text-foreground">Pedidos recebidos</h1>
      <p className="mt-1 text-body-sm text-text-muted">
        Pedidos finalizados pelos clientes no catálogo — CNPJ e telefone informados na hora.
      </p>

      <div className="mt-4 rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-text-muted">
                  Nenhum pedido recebido ainda
                </TableCell>
              </TableRow>
            )}

            {data?.map((order) => {
              const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0)
              const nextStatus: OrderStatus = order.status === "pendente" ? "atendido" : "pendente"

              return (
                <TableRow key={order.id}>
                  <TableCell className="text-foreground">{order.user?.name ?? "—"}</TableCell>
                  <TableCell className="font-mono text-body-sm text-text-secondary">
                    {order.cnpj}
                  </TableCell>
                  <TableCell className="text-text-secondary">{order.contactPhone}</TableCell>
                  <TableCell className="text-text-secondary">
                    {totalQuantity} {totalQuantity === 1 ? "peça" : "peças"} ({order.items.length}{" "}
                    {order.items.length === 1 ? "modelo" : "modelos"})
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {new Date(order.createdAt).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.status === "atendido" ? "outline" : "secondary"}>
                      {statusLabels[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            statusMutation.mutate({ id: order.id, status: nextStatus })
                          }
                        >
                          Marcar como {statusLabels[nextStatus].toLowerCase()}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
