"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { CatalogItem } from "@/types/api"

interface VariantCardProps {
  variant: CatalogItem
  selected: boolean
  onToggle: (variant: CatalogItem) => void
}

export function VariantCard({ variant, selected, onToggle }: VariantCardProps) {
  const [hovered, setHovered] = useState(false)
  const previewUrl = hovered && variant.imageUrls[1] ? variant.imageUrls[1] : variant.primaryImageUrl

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onToggle(variant)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onToggle(variant)
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-lg border bg-bg-surface transition-all",
        selected
          ? "border-brand bg-brand-subtle"
          : "border-border hover:border-brand/20 hover:shadow-hover"
      )}
    >
      <div
        data-selected={selected}
        className="absolute top-2 left-2 z-10 opacity-100 transition-opacity md:opacity-0 md:data-[selected=true]:opacity-100 md:group-hover:opacity-100"
      >
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggle(variant)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Selecionar ${variant.skuVariant}`}
        />
      </div>

      <div className="relative aspect-square bg-bg-elevated">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={
              variant.colorLabel
                ? `${variant.skuVariant} — ${variant.colorLabel}`
                : variant.skuVariant
            }
            fill
            sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-text-muted">
            <ImageOff className="size-6" />
          </div>
        )}
      </div>

      <div className="space-y-1.5 p-3">
        {(variant.frameType || variant.categoryName) && (
          <div className="flex flex-wrap gap-1">
            {variant.frameType && (
              <Badge variant="outline" className="capitalize">
                {variant.frameType}
              </Badge>
            )}
            {variant.categoryName && <Badge variant="outline">{variant.categoryName}</Badge>}
          </div>
        )}
        <p className="truncate font-mono text-sku text-foreground">{variant.skuVariant}</p>
        {variant.colorLabel && (
          <p className="truncate text-body-sm text-text-secondary">{variant.colorLabel}</p>
        )}
        {variant.brandName && (
          <p className="truncate text-body-sm text-text-secondary">{variant.brandName}</p>
        )}
      </div>
    </div>
  )
}

export function VariantCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg-surface">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}
