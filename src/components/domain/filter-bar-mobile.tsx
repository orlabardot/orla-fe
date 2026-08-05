"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { listBrands } from "@/services/brands.service"
import { listCategories } from "@/services/categories.service"
import { frameTypeOptions } from "@/schemas/product.schema"
import { useSyncedSearchInput } from "@/hooks/use-synced-search-input"
import type { useFilters } from "@/hooks/use-filters"

const ALL_VALUE = "all"

type FiltersApi = ReturnType<typeof useFilters>

export function FilterBarMobile({
  filters,
  setFilter,
  setRange,
  clearFilters,
  activeFilterCount,
}: FiltersApi) {
  const [open, setOpen] = useState(false)
  const [searchInput, setSearchInput] = useSyncedSearchInput(filters.q, (value) =>
    setFilter("q", value)
  )

  const brands = useQuery({ queryKey: ["brands"], queryFn: listBrands })
  const categories = useQuery({ queryKey: ["categories"], queryFn: listCategories })

  const badges = [
    filters.frameType && { key: "frameType", label: filters.frameType },
    filters.brandId && {
      key: "brandId",
      label: brands.data?.find((b) => b.id === filters.brandId)?.name ?? "Marca",
    },
    filters.categoryId && {
      key: "categoryId",
      label: categories.data?.find((c) => c.id === filters.categoryId)?.name ?? "Categoria",
    },
  ].filter(Boolean) as { key: string; label: string }[]

  return (
    <div className="border-b border-border bg-bg-surface px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar..."
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <SlidersHorizontal className="size-4" />
          Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </Button>
      </div>

      {badges.length > 0 && (
        <div className="mt-2 flex items-center gap-2 overflow-x-auto">
          {badges.map((badge) => (
            <Badge key={badge.key} variant="outline" className="shrink-0">
              {badge.label}
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto shrink-0">
            Limpar
          </Button>
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="border-border bg-bg-surface">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 overflow-y-auto px-4 pb-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={filters.frameType || ALL_VALUE}
                onValueChange={(value) =>
                  setFilter("frameType", value === ALL_VALUE ? "" : (value ?? ""))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tipo">
                    {(value: string) => (value === ALL_VALUE ? "Todos os tipos" : value)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>Todos os tipos</SelectItem>
                  {frameTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Marca</Label>
              <Select
                value={filters.brandId || ALL_VALUE}
                onValueChange={(value) =>
                  setFilter("brandId", value === ALL_VALUE ? "" : (value ?? ""))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Marca">
                    {(value: string) =>
                      value === ALL_VALUE
                        ? "Todas as marcas"
                        : (brands.data?.find((b) => b.id === value)?.name ?? "Marca")
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>Todas as marcas</SelectItem>
                  {brands.data?.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={filters.categoryId || ALL_VALUE}
                onValueChange={(value) =>
                  setFilter("categoryId", value === ALL_VALUE ? "" : (value ?? ""))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Categoria">
                    {(value: string) =>
                      value === ALL_VALUE
                        ? "Todas as categorias"
                        : (categories.data?.find((c) => c.id === value)?.name ?? "Categoria")
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>Todas as categorias</SelectItem>
                  {categories.data?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ponte (mm)</Label>
              <div className="flex items-center gap-2">
                <Input
                  inputMode="decimal"
                  placeholder="Mín"
                  value={filters.bridgeMin}
                  onChange={(e) => setRange("bridgeMin", "bridgeMax", e.target.value, filters.bridgeMax)}
                />
                <span className="text-text-muted">–</span>
                <Input
                  inputMode="decimal"
                  placeholder="Máx"
                  value={filters.bridgeMax}
                  onChange={(e) => setRange("bridgeMin", "bridgeMax", filters.bridgeMin, e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Haste (mm)</Label>
              <div className="flex items-center gap-2">
                <Input
                  inputMode="decimal"
                  placeholder="Mín"
                  value={filters.templeMin}
                  onChange={(e) => setRange("templeMin", "templeMax", e.target.value, filters.templeMax)}
                />
                <span className="text-text-muted">–</span>
                <Input
                  inputMode="decimal"
                  placeholder="Máx"
                  value={filters.templeMax}
                  onChange={(e) => setRange("templeMin", "templeMax", filters.templeMin, e.target.value)}
                />
              </div>
            </div>
          </div>

          <SheetFooter className="flex-row gap-2">
            <Button variant="secondary" className="flex-1" onClick={clearFilters}>
              <X className="size-4" />
              Limpar
            </Button>
            <Button className="flex-1" onClick={() => setOpen(false)}>
              Ver resultados
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
