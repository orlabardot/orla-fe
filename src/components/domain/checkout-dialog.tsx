"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createOrder } from "@/services/orders.service"
import { generatePdf } from "@/services/pdf.service"
import { getApiErrorMessage } from "@/lib/api-error"
import { useCartStore } from "@/stores/cart.store"
import { useAuthTenant } from "@/hooks/use-auth"
import type { Order } from "@/types/api"

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

function buildWhatsappMessage(order: Order): string {
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const date = new Date(order.createdAt).toLocaleString("pt-BR")

  return [
    "Pedido feito pelo catálogo:",
    `Quantidade de peças: ${totalQuantity}`,
    `Data/hora: ${date}`,
    `CNPJ: ${order.cnpj}`,
    `Telefone para contato: ${order.contactPhone}`,
    "",
    "Já entraremos em contato para dar prosseguimento ao pedido.",
  ].join("\n")
}

export function CheckoutDialog({ open, onOpenChange, onSuccess }: CheckoutDialogProps) {
  const tenant = useAuthTenant()
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clear)

  const [cnpj, setCnpj] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null)

  const itemList = Object.values(items)

  const mutation = useMutation({
    mutationFn: () =>
      createOrder({
        cnpj,
        contactPhone,
        items: itemList.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      }),
    onSuccess: (order) => {
      setCompletedOrder(order)
      clearCart()
      onSuccess()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      // Reseta pro próximo pedido, mas só depois de fechar — evita o
      // conteúdo "piscar" de volta pro formulário durante a animação.
      setTimeout(() => {
        setCompletedOrder(null)
        setCnpj("")
        setContactPhone("")
      }, 200)
    }
    onOpenChange(nextOpen)
  }

  function handleDownloadPdf() {
    if (!completedOrder) return
    generatePdf({
      variantIds: completedOrder.items.map((item) => item.variantId).filter((id): id is string => !!id),
      clientName: completedOrder.cnpj,
    })
  }

  const whatsappHref = completedOrder
    ? `https://wa.me/${(tenant?.whatsappPhone ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(
        buildWhatsappMessage(completedOrder)
      )}`
    : "#"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        {!completedOrder ? (
          <>
            <DialogHeader>
              <DialogTitle>Finalizar pedido</DialogTitle>
              <DialogDescription>
                {itemList.length} {itemList.length === 1 ? "item selecionado" : "itens selecionados"}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                mutation.mutate()
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Telefone para contato</Label>
                <Input
                  id="contactPhone"
                  placeholder="(00) 00000-0000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => handleClose(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Enviando..." : "Confirmar pedido"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Pedido enviado com sucesso</DialogTitle>
              <DialogDescription>
                Baixe a lista de produtos selecionados ou fale com a gente pelo WhatsApp pra dar
                continuidade.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <Button variant="secondary" onClick={handleDownloadPdf}>
                Baixar lista (PDF)
              </Button>
              <Button
                render={<a href={whatsappHref} target="_blank" rel="noopener noreferrer" />}
                nativeButton={false}
              >
                Falar no WhatsApp
              </Button>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => handleClose(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
