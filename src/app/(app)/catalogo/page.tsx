"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getCatalog } from "@/services/catalog.service"
import { useFilters } from "@/hooks/use-filters"
import { useSelectionStore } from "@/stores/selection.store"
import { useUIStore } from "@/stores/ui.store"
import { FilterBar } from "@/components/domain/filter-bar"
import { FilterBarMobile } from "@/components/domain/filter-bar-mobile"
import { VariantCard, VariantCardSkeleton } from "@/components/domain/variant-card"
import { EmptyState } from "@/components/domain/empty-state"
import { SelectionBar } from "@/components/domain/selection-bar"
import { ProductDetailDialog } from "@/components/domain/product-detail-dialog"
import type { CatalogItem } from "@/types/api"

const GRID_COLUMN_OPTIONS = [4, 5, 6] as const

export default function CatalogoPage() {
  const filtersApi = useFilters()
  const { filters, apiFilters, setPage, clearFilters } = filtersApi

  // Assina o Map em si, não o método isSelected — métodos do Zustand têm
  // referência estável e não disparam re-render quando os dados mudam.
  const selected = useSelectionStore((state) => state.selected)
  const toggle = useSelectionStore((state) => state.toggle)
  const gridColumns = useUIStore((state) => state.gridColumns)
  const setGridColumns = useUIStore((state) => state.setGridColumns)

  const [detailTarget, setDetailTarget] = useState<{
    productId: string
    variantId: string
  } | null>(null)

  const catalog = useQuery({
    queryKey: ["catalog", apiFilters],
    queryFn: () => getCatalog(apiFilters),
    staleTime: 60_000,
  })

  const desktopColsClass =
    gridColumns === 4 ? "lg:grid-cols-4" : gridColumns === 5 ? "lg:grid-cols-5" : "lg:grid-cols-6"

  return (
    <div className="pb-24">
      <div className="hidden md:block">
        <div className="sticky top-14 z-30 md:top-16">
          <FilterBar {...filtersApi} />
        </div>
      </div>
      <div className="md:hidden">
        <FilterBarMobile {...filtersApi} />
      </div>

      <div className="px-4 py-4 md:px-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-body-md text-text-secondary">
            {catalog.isLoading
              ? "Carregando..."
              : `${catalog.data?.meta.total ?? 0} variantes encontradas`}
          </p>
          <div className="hidden items-center gap-1 lg:flex">
            {GRID_COLUMN_OPTIONS.map((cols) => (
              <button
                key={cols}
                type="button"
                onClick={() => setGridColumns(cols)}
                className={cn(
                  "rounded-md px-2 py-1 text-body-sm transition-colors",
                  gridColumns === cols
                    ? "bg-brand-muted text-foreground"
                    : "text-text-muted hover:text-text-secondary"
                )}
              >
                ⊞ {cols}
              </button>
            ))}
          </div>
        </div>

        {!catalog.isLoading && catalog.data?.data.length === 0 && (
          <EmptyState actionLabel="Limpar filtros" onAction={clearFilters} />
        )}

        <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4", desktopColsClass)}>
          {catalog.isLoading &&
            Array.from({ length: 10 }).map((_, i) => <VariantCardSkeleton key={i} />)}

          {catalog.data?.data.map((variant) => (
            <VariantCard
              key={variant.variantId}
              variant={variant}
              selected={selected.has(variant.variantId)}
              onToggle={toggle}
              onViewDetails={(v: CatalogItem) =>
                setDetailTarget({ productId: v.productId, variantId: v.variantId })
              }
            />
          ))}
        </div>

        {catalog.data && catalog.data.meta.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              disabled={filters.page <= 1}
              onClick={() => setPage(filters.page - 1)}
            >
              Anterior
            </Button>
            <span className="text-body-sm text-text-muted">
              {filters.page} de {catalog.data.meta.totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={filters.page >= catalog.data.meta.totalPages}
              onClick={() => setPage(filters.page + 1)}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>

      <SelectionBar />

      <ProductDetailDialog
        productId={detailTarget?.productId ?? null}
        initialVariantId={detailTarget?.variantId}
        open={!!detailTarget}
        onOpenChange={(open) => {
          if (!open) setDetailTarget(null)
        }}
      />
    </div>
  )
}
