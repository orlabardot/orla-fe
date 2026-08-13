"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageOff, Minus, Plus, ShoppingCart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/stores/cart.store"
import { CheckoutDialog } from "@/components/domain/checkout-dialog"

interface CartSheetProps {
  // "floating" é o atalho fixo na tela do catálogo (mobile) — mais perto de
  // onde o usuário está adicionando itens do que o ícone no header.
  variant?: "icon" | "floating"
}

export function CartSheet({ variant = "icon" }: CartSheetProps) {
  const [open, setOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const items = useCartStore((state) => state.items)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  const itemList = Object.values(items)
  const totalQuantity = itemList.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      <Button
        variant={variant === "floating" ? "default" : "ghost"}
        size={variant === "floating" ? "icon-lg" : "icon"}
        className={cn("relative", variant === "floating" && "rounded-full shadow-lg")}
        onClick={() => setOpen(true)}
        aria-label="Abrir carrinho"
      >
        <ShoppingCart className="size-5" />
        {totalQuantity > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-medium text-background">
            {totalQuantity}
          </span>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex flex-col border-border bg-bg-surface">
          <SheetHeader>
            <SheetTitle>
              Carrinho{totalQuantity > 0 ? ` (${totalQuantity} ${totalQuantity === 1 ? "item" : "itens"})` : ""}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 space-y-3 overflow-y-auto px-4">
            {itemList.length === 0 && (
              <p className="py-8 text-center text-body-sm text-text-muted">
                Seu carrinho está vazio
              </p>
            )}
            {itemList.map((item) => (
              <div
                key={item.variantId}
                className="flex gap-3 rounded-md border border-border p-2"
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-sm bg-bg-elevated">
                  {item.primaryImageUrl ? (
                    <Image
                      src={item.primaryImageUrl}
                      alt={item.skuVariant}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-text-muted">
                      <ImageOff className="size-4" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                  <p className="truncate font-mono text-sku text-foreground">
                    {item.skuVariant}
                  </p>
                  <p className="truncate text-body-sm text-text-secondary">
                    {item.productName}
                    {item.colorLabel ? ` — ${item.colorLabel}` : ""}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Diminuir quantidade"
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-6 text-center text-body-sm text-foreground">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                      aria-label="Aumentar quantidade"
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeItem(item.variantId)}
                  aria-label={`Remover ${item.skuVariant}`}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          {itemList.length > 0 && (
            <SheetFooter>
              <Button
                className="w-full"
                onClick={() => {
                  setOpen(false)
                  setCheckoutOpen(true)
                }}
              >
                Finalizar pedido
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        onSuccess={() => setOpen(false)}
      />
    </>
  )
}
