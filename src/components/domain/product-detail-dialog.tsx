"use client"

import { useState } from "react"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { ImageOff } from "lucide-react"
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
import { useSelectionStore } from "@/stores/selection.store"
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
  const selected = useSelectionStore((state) => state.selected)
  const toggle = useSelectionStore((state) => state.toggle)

  const product = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId!),
    enabled: open && !!productId,
  })

  const [activeVariantId, setActiveVariantId] = useState<string | undefined>(initialVariantId)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Ajusta o estado local durante a renderização (sem useEffect) quando o
  // alvo do modal muda — padrão recomendado pelo React pra "resetar estado
  // quando uma prop muda", em vez de um efeito que rodaria depois do paint.
  const targetKey = `${productId ?? ""}:${initialVariantId ?? ""}`
  const [resolvedTargetKey, setResolvedTargetKey] = useState(targetKey)
  if (targetKey !== resolvedTargetKey) {
    setResolvedTargetKey(targetKey)
    setActiveVariantId(initialVariantId)
    setActiveImageIndex(0)
  }

  const activeVariant =
    product.data?.variants.find((v) => v.id === activeVariantId) ?? product.data?.variants[0]
  const images = activeVariant?.images ?? []
  const activeImage = images[activeImageIndex] ?? images[0]

  function selectVariant(variant: ProductVariant) {
    setActiveVariantId(variant.id)
    setActiveImageIndex(0)
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
                  <p className="text-body-sm text-text-secondary">Cores disponíveis</p>
                  <ul className="flex flex-col gap-1.5">
                    {product.data.variants.map((variant) => {
                      const isSelected = selected.has(variant.id)
                      const isActive = variant.id === activeVariant.id
                      return (
                        <li key={variant.id}>
                          <div
                            className={cn(
                              "flex items-center gap-2 rounded-md border px-2.5 py-1.5 transition-colors",
                              isActive
                                ? "border-brand bg-brand-subtle"
                                : "border-border hover:border-brand/40"
                            )}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                toggle({
                                  variantId: variant.id,
                                  skuVariant: variant.skuVariant,
                                  primaryImageUrl: variantPrimaryImageUrl(variant),
                                })
                              }
                              aria-label={`Selecionar ${variant.skuVariant}`}
                            />
                            <button
                              type="button"
                              onClick={() => selectVariant(variant)}
                              className="flex flex-1 items-center justify-between text-left text-body-sm text-foreground focus-visible:outline-none"
                            >
                              <span>{variant.colorLabel ?? variant.skuVariant}</span>
                              {!isActive && (
                                <span className="text-text-secondary">Ver</span>
                              )}
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
