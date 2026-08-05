"use client"

import { useState } from "react"
import Image from "next/image"
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
import { generatePdf } from "@/services/pdf.service"
import { getApiErrorMessage } from "@/lib/api-error"
import type { SelectedVariant } from "@/stores/selection.store"

interface PDFModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: SelectedVariant[]
  onSuccess: () => void
}

export function PDFModal({ open, onOpenChange, items, onSuccess }: PDFModalProps) {
  const [clientName, setClientName] = useState("")

  const mutation = useMutation({
    mutationFn: () =>
      generatePdf({
        variantIds: items.map((item) => item.variantId),
        clientName: clientName || undefined,
      }),
    onSuccess: () => {
      toast.success("Catálogo gerado com sucesso")
      onOpenChange(false)
      setClientName("")
      onSuccess()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const preview = items.slice(0, 4)
  const extra = items.length - preview.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar catálogo</DialogTitle>
          <DialogDescription>
            {items.length} {items.length === 1 ? "produto selecionado" : "produtos selecionados"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          {preview.map((item) => (
            <div
              key={item.variantId}
              className="size-12 overflow-hidden rounded-md border border-border bg-bg-elevated"
            >
              {item.primaryImageUrl && (
                <Image
                  src={item.primaryImageUrl}
                  alt={item.skuVariant}
                  width={48}
                  height={48}
                  className="size-full object-cover"
                />
              )}
            </div>
          ))}
          {extra > 0 && (
            <div className="flex size-12 items-center justify-center rounded-md border border-border bg-bg-elevated text-body-sm text-text-muted">
              +{extra}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientName">Nome do cliente</Label>
          <Input
            id="clientName"
            placeholder="Ex: Ótica São Paulo Ltda"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Gerando PDF..." : "Gerar e baixar →"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
