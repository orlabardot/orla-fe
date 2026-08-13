"use client"

import { useState } from "react"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useSelectionStore } from "@/stores/selection.store"
import { useCartStore } from "@/stores/cart.store"
import { PDFModal } from "@/components/domain/pdf-modal"

const MAX_PDF_ITEMS = 100

export function SelectionBar() {
  const selected = useSelectionStore((state) => state.selected)
  const clear = useSelectionStore((state) => state.clear)
  const addToCart = useCartStore((state) => state.addItem)
  const [modalOpen, setModalOpen] = useState(false)

  const items = Array.from(selected.values())
  if (items.length === 0) return null

  const preview = items.slice(0, 3)
  const extra = items.length - preview.length
  const overLimit = items.length > MAX_PDF_ITEMS

  function handleAddAllToCart() {
    for (const item of items) {
      addToCart({
        variantId: item.variantId,
        skuVariant: item.skuVariant,
        productName: item.productName,
        colorLabel: item.colorLabel,
        primaryImageUrl: item.primaryImageUrl,
      })
    }
    toast.success(
      items.length === 1
        ? `${items[0].skuVariant} adicionado ao carrinho`
        : `${items.length} itens adicionados ao carrinho`
    )
  }

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        className="animate-in slide-in-from-bottom fixed right-0 bottom-0 left-0 z-40 border-t border-border bg-bg-surface/95 backdrop-blur-md duration-200"
      >
        <div className="mx-auto flex max-w-content flex-wrap items-center gap-3 px-4 py-3 md:px-6">
          <div className="flex -space-x-2">
            {preview.map((item) => (
              <div
                key={item.variantId}
                className="size-8 overflow-hidden rounded-sm border border-border bg-bg-elevated"
              >
                {item.primaryImageUrl && (
                  <Image
                    src={item.primaryImageUrl}
                    alt={item.skuVariant}
                    width={32}
                    height={32}
                    className="size-full object-cover"
                  />
                )}
              </div>
            ))}
            {extra > 0 && (
              <div className="flex size-8 items-center justify-center rounded-sm border border-border bg-bg-elevated text-body-sm text-text-secondary">
                +{extra}
              </div>
            )}
          </div>

          <p className="text-body-md text-text-secondary">
            {items.length} {items.length === 1 ? "selecionado" : "selecionados"}
          </p>

          {overLimit && (
            <p className="text-body-sm text-danger">Máximo de 100 produtos por PDF</p>
          )}

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clear}>
              Limpar
            </Button>
            <Button variant="outline" size="sm" onClick={handleAddAllToCart}>
              <ShoppingCart className="size-3.5" />
              Adicionar ao carrinho
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)} disabled={overLimit}>
              Gerar PDF →
            </Button>
          </div>
        </div>
      </div>

      <PDFModal open={modalOpen} onOpenChange={setModalOpen} items={items} onSuccess={clear} />
    </>
  )
}
