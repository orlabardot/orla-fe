"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { CartSheet } from "@/components/domain/cart-sheet"
import type { CatalogItem, CatalogSort } from "@/types/api"

const GRID_COLUMN_OPTIONS = [4, 5, 6] as const

const SORT_LABELS: Record<CatalogSort, string> = {
  name_asc: "Nome (A-Z)",
  name_desc: "Nome (Z-A)",
  newest: "Mais recentes",
}

export default function CatalogoPage() {
  const filtersApi = useFilters()
  const { filters, apiFilters, setFilter, setPage, clearFilters } = filtersApi

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
    // Com o networkMode padrão ("online"), o React Query PAUSA a query
    // (fetchStatus: "paused") em vez de marcar isError quando o navegador
    // se reporta offline — ou seja, o estado de erro abaixo nunca apareceria
    // justamente no cenário mais comum de falha (sem internet). "always"
    // faz a busca (e o retry) rodar de qualquer forma, garantindo que uma
    // falha real vire isError e mostre a ação de "tentar novamente".
    networkMode: "always",
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
          <div className="flex items-center gap-3">
            <Select value={filters.sort} onValueChange={(value) => setFilter("sort", value ?? "")}>
              <SelectTrigger className="w-40" size="sm">
                <SelectValue placeholder="Ordenar">
                  {(value: CatalogSort) => SORT_LABELS[value]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SORT_LABELS) as CatalogSort[]).map((value) => (
                  <SelectItem key={value} value={value}>
                    {SORT_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
        </div>

        {catalog.isError && (
          <EmptyState
            title="Não foi possível carregar o catálogo"
            description="Verifique sua conexão e tente novamente."
            actionLabel="Tentar novamente"
            onAction={() => catalog.refetch()}
          />
        )}

        {!catalog.isLoading && !catalog.isError && catalog.data?.data.length === 0 && (
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

      {/* Atalho pro carrinho mais perto de onde o usuário está adicionando
          itens — no header ele fica longe do polegar ao rolar a grade.
          Desktop já alcança o header sem esforço, por isso só em mobile. */}
      <div
        className={cn(
          "fixed right-4 z-40 md:hidden",
          selected.size > 0 ? "bottom-24" : "bottom-4"
        )}
      >
        <CartSheet variant="floating" />
      </div>

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
