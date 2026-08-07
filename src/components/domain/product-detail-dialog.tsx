"use client"

import { useState } from "react"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, ImageOff, Minus, Plus, ShoppingCart } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getProduct } from "@/services/products.service"
import { useCartStore } from "@/stores/cart.store"
import type { ProductVariant } from "@/types/api"

interface ProductDetailDialogProps {
  productId: string | null
  initialVariantId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function variantPrimaryImageUrl(variant: ProductVariant): string | null {
  return variant.images.find((img) => img.isPrimary)?.url ?? variant.images[0]?.url ?? null
}

export function ProductDetailDialog({
  productId,
  initialVariantId,
  open,
  onOpenChange,
}: ProductDetailDialogProps) {
  const addToCart = useCartStore((state) => state.addItem)

  const product = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId!),
    enabled: open && !!productId,
  })

  const [activeVariantId, setActiveVariantId] = useState<string | undefined>(initialVariantId)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  // Cores extras (além da que está em exibição) marcadas pra ir junto no
  // "Adicionar ao carrinho", todas com a mesma quantidade escolhida acima.
  const [checkedVariantIds, setCheckedVariantIds] = useState<Set<string>>(new Set())

  // Ajusta o estado local durante a renderização (sem useEffect) quando o
  // alvo do modal muda — padrão recomendado pelo React pra "resetar estado
  // quando uma prop muda", em vez de um efeito que rodaria depois do paint.
  const targetKey = `${productId ?? ""}:${initialVariantId ?? ""}`
  const [resolvedTargetKey, setResolvedTargetKey] = useState(targetKey)
  if (targetKey !== resolvedTargetKey) {
    setResolvedTargetKey(targetKey)
    setActiveVariantId(initialVariantId)
    setActiveImageIndex(0)
    setQuantity(1)
    setCheckedVariantIds(new Set())
  }

  const activeVariant =
    product.data?.variants.find((v) => v.id === activeVariantId) ?? product.data?.variants[0]
  const images = activeVariant?.images ?? []
  const activeImage = images[activeImageIndex] ?? images[0]

  function selectVariant(variant: ProductVariant) {
    setActiveVariantId(variant.id)
    setActiveImageIndex(0)
    setQuantity(1)
  }

  function toggleChecked(variantId: string) {
    setCheckedVariantIds((prev) => {
      const next = new Set(prev)
      if (next.has(variantId)) {
        next.delete(variantId)
      } else {
        next.add(variantId)
      }
      return next
    })
  }

  function handleAddToCart() {
    if (!activeVariant || !product.data) return

    const variantsToAdd = [
      activeVariant,
      ...product.data.variants.filter(
        (v) => v.id !== activeVariant.id && checkedVariantIds.has(v.id)
      ),
    ]

    for (const variant of variantsToAdd) {
      addToCart(
        {
          variantId: variant.id,
          skuVariant: variant.skuVariant,
          productName: product.data.name,
          colorLabel: variant.colorLabel,
          primaryImageUrl: variantPrimaryImageUrl(variant),
        },
        quantity
      )
    }

    toast.success(
      variantsToAdd.length > 1
        ? `${variantsToAdd.length} variantes adicionadas ao carrinho`
        : `${activeVariant.skuVariant} adicionado ao carrinho`
    )
    setQuantity(1)
    setCheckedVariantIds(new Set())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        {product.isLoading && (
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        )}

        {product.isError && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-body-md text-foreground">Não foi possível carregar o produto.</p>
            <Button variant="secondary" size="sm" onClick={() => product.refetch()}>
              Tentar novamente
            </Button>
          </div>
        )}

        {product.data && activeVariant && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-bg-elevated">
                {activeImage ? (
                  <Image
                    src={activeImage.url}
                    alt={`${product.data.name} — ${activeVariant.colorLabel ?? activeVariant.skuVariant}`}
                    fill
                    sizes="(max-width: 768px) 90vw, 40vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-text-muted">
                    <ImageOff className="size-8" />
                  </div>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((i) => (i - 1 + images.length) % images.length)
                      }
                      className="absolute top-1/2 left-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-bg-page/80 text-foreground transition-colors hover:bg-bg-page focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      aria-label="Foto anterior"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((i) => (i + 1) % images.length)}
                      className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-bg-page/80 text-foreground transition-colors hover:bg-bg-page focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      aria-label="Próxima foto"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                    <span className="absolute right-2 bottom-2 rounded-full bg-bg-page/80 px-2 py-0.5 text-xs text-foreground">
                      {activeImageIndex + 1}/{images.length}
                    </span>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={cn(
                        "size-14 shrink-0 overflow-hidden rounded-md border transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                        index === activeImageIndex
                          ? "border-brand"
                          : "border-border hover:border-brand/40"
                      )}
                      aria-label={`Ver imagem ${index + 1}`}
                      aria-pressed={index === activeImageIndex}
                    >
                      <Image
                        src={image.url}
                        alt=""
                        width={56}
                        height={56}
                        className="size-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="font-playfair text-heading text-foreground">
                  {product.data.name}
                </DialogTitle>
                <p className="font-mono text-sku text-text-secondary">{activeVariant.skuVariant}</p>
              </DialogHeader>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Diminuir quantidade"
                  >
                    <Minus className="size-3" />
                  </Button>
                  <span className="w-6 text-center text-body-sm text-foreground">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Aumentar quantidade"
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
                <Button className="flex-1" onClick={handleAddToCart}>
                  <ShoppingCart className="size-4" />
                  {checkedVariantIds.size > 0
                    ? `Adicionar ${checkedVariantIds.size + 1} variantes`
                    : "Adicionar ao carrinho"}
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {product.data.frameType && (
                  <Badge variant="outline" className="capitalize">
                    {product.data.frameType}
                  </Badge>
                )}
                {product.data.gender && (
                  <Badge variant="outline" className="capitalize">
                    {product.data.gender}
                  </Badge>
                )}
                {product.data.category && (
                  <Badge variant="outline">{product.data.category.name}</Badge>
                )}
                {product.data.brand && <Badge variant="outline">{product.data.brand.name}</Badge>}
                {product.data.productTags.map((ref) => (
                  <Badge key={ref.tagId} variant="secondary">
                    {ref.tag.name}
                  </Badge>
                ))}
              </div>

              {product.data.description && (
                <p className="text-body-md text-text-secondary">{product.data.description}</p>
              )}

              {(product.data.sizeMm || product.data.bridgeSizeMm || product.data.templeSizeMm) && (
                <dl className="grid grid-cols-3 gap-2 text-body-sm">
                  {product.data.sizeMm && (
                    <div>
                      <dt className="text-text-secondary">Lente</dt>
                      <dd className="text-foreground">{product.data.sizeMm}mm</dd>
                    </div>
                  )}
                  {product.data.bridgeSizeMm && (
                    <div>
                      <dt className="text-text-secondary">Ponte</dt>
                      <dd className="text-foreground">{product.data.bridgeSizeMm}mm</dd>
                    </div>
                  )}
                  {product.data.templeSizeMm && (
                    <div>
                      <dt className="text-text-secondary">Haste</dt>
                      <dd className="text-foreground">{product.data.templeSizeMm}mm</dd>
                    </div>
                  )}
                </dl>
              )}

              {product.data.variants.length > 0 && (
                <div className="space-y-2">
                  <p className="text-body-sm text-text-secondary">
                    Cores disponíveis
                    <span className="ml-1 text-text-muted">
                      (marque outras pra adicionar junto ao carrinho)
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.data.variants.map((variant) => {
                      const isActive = variant.id === activeVariant.id
                      const isChecked = isActive || checkedVariantIds.has(variant.id)
                      return (
                        <div
                          key={variant.id}
                          className={cn(
                            "flex items-center gap-1.5 rounded-md border px-2 py-1 transition-colors",
                            isActive
                              ? "border-brand bg-brand-subtle"
                              : "border-border hover:border-brand/40"
                          )}
                        >
                          <Checkbox
                            checked={isChecked}
                            disabled={isActive}
                            onCheckedChange={() => toggleChecked(variant.id)}
                            aria-label={
                              isActive
                                ? `${variant.skuVariant} já está sendo exibida e sempre vai pro carrinho`
                                : `Incluir ${variant.colorLabel ?? variant.skuVariant} no carrinho`
                            }
                          />
                          <button
                            type="button"
                            onClick={() => selectVariant(variant)}
                            className="text-body-sm text-foreground focus-visible:outline-none"
                          >
                            {variant.colorCode ?? variant.colorLabel ?? variant.skuVariant}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
