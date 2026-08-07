"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { TagsMultiSelect } from "@/components/domain/tags-multi-select"
import { listBrands } from "@/services/brands.service"
import { listCategories } from "@/services/categories.service"
import { listTags } from "@/services/tags.service"
import { frameTypeOptions } from "@/schemas/product.schema"
import { useSyncedSearchInput } from "@/hooks/use-synced-search-input"
import type { useFilters } from "@/hooks/use-filters"

const ALL_VALUE = "all"
const SIZE_BOUNDS: [number, number] = [40, 60]
const BRIDGE_BOUNDS: [number, number] = [10, 24]
const TEMPLE_BOUNDS: [number, number] = [120, 160]

type FiltersApi = ReturnType<typeof useFilters>

export function FilterBar({
  filters,
  setFilter,
  setTagIds,
  setRange,
  clearFilters,
  activeFilterCount,
}: FiltersApi) {
  const [searchInput, setSearchInput] = useSyncedSearchInput(filters.q, (value) =>
    setFilter("q", value)
  )

  const brands = useQuery({ queryKey: ["brands"], queryFn: listBrands })
  const categories = useQuery({ queryKey: ["categories"], queryFn: listCategories })
  const tags = useQuery({ queryKey: ["tags"], queryFn: listTags })

  return (
    <div className="border-b border-border bg-bg-surface px-4 py-3 md:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nome, referência ou cor..."
            className="pl-8"
          />
        </div>

        <Select
          value={filters.frameType || ALL_VALUE}
          onValueChange={(value) => setFilter("frameType", value === ALL_VALUE ? "" : (value ?? ""))}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Tipo">
              {(value: string) => (value === ALL_VALUE ? "Tipo" : value)}
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

        <Select
          value={filters.brandId || ALL_VALUE}
          onValueChange={(value) => setFilter("brandId", value === ALL_VALUE ? "" : (value ?? ""))}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Marca">
              {(value: string) =>
                value === ALL_VALUE
                  ? "Marca"
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

        <Select
          value={filters.categoryId || ALL_VALUE}
          onValueChange={(value) =>
            setFilter("categoryId", value === ALL_VALUE ? "" : (value ?? ""))
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Categoria">
              {(value: string) =>
                value === ALL_VALUE
                  ? "Categoria"
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

        <TagsMultiSelect
          tags={tags.data ?? []}
          selectedIds={filters.tagIds}
          onChange={setTagIds}
          placeholder="Tags"
          className="w-36"
        />

        <RangePopover
          label="Tamanho"
          bounds={SIZE_BOUNDS}
          min={filters.sizeMin}
          max={filters.sizeMax}
          onCommit={(min, max) => setRange("sizeMin", "sizeMax", min, max)}
        />
        <RangePopover
          label="Ponte"
          bounds={BRIDGE_BOUNDS}
          min={filters.bridgeMin}
          max={filters.bridgeMax}
          onCommit={(min, max) => setRange("bridgeMin", "bridgeMax", min, max)}
        />
        <RangePopover
          label="Haste"
          bounds={TEMPLE_BOUNDS}
          min={filters.templeMin}
          max={filters.templeMax}
          onCommit={(min, max) => setRange("templeMin", "templeMax", min, max)}
        />

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
            Limpar filtros
          </Button>
        )}
      </div>

      <ActiveFilterBadges
        filters={filters}
        setFilter={setFilter}
        setTagIds={setTagIds}
        setRange={setRange}
        brandName={brands.data?.find((b) => b.id === filters.brandId)?.name}
        categoryName={categories.data?.find((c) => c.id === filters.categoryId)?.name}
        tagNames={tags.data
          ?.filter((tag) => filters.tagIds.includes(tag.id))
          .map((tag) => tag.name)}
      />
    </div>
  )
}

function RangePopover({
  label,
  bounds,
  min,
  max,
  onCommit,
}: {
  label: string
  bounds: [number, number]
  min: string
  max: string
  onCommit: (min: string, max: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<number[]>([
    min ? Number(min) : bounds[0],
    max ? Number(max) : bounds[1],
  ])
  const active = !!min || !!max

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (nextOpen) {
          // Reabrir sempre parte do que já está aplicado, não do último
          // arraste não confirmado.
          setValue([min ? Number(min) : bounds[0], max ? Number(max) : bounds[1]])
        }
      }}
    >
      <PopoverTrigger
        render={<Button variant={active ? "secondary" : "outline"} size="sm" />}
      >
        {label}
        {active ? ` ${min || bounds[0]}–${max || bounds[1]}mm` : ""}
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <p className="text-body-sm text-text-secondary">
          {label}: {value[0]}mm – {value[1]}mm
        </p>
        <Slider
          className="mt-4"
          min={bounds[0]}
          max={bounds[1]}
          step={0.5}
          value={value}
          onValueChange={(next) => setValue(next as number[])}
        />
        <div className="mt-4 flex justify-end gap-2">
          {active && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onCommit("", "")
                setOpen(false)
              }}
            >
              Limpar
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => {
              onCommit(String(value[0]), String(value[1]))
              setOpen(false)
            }}
          >
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ActiveFilterBadges({
  filters,
  setFilter,
  setTagIds,
  setRange,
  brandName,
  categoryName,
  tagNames,
}: Pick<FiltersApi, "filters" | "setFilter" | "setTagIds" | "setRange"> & {
  brandName?: string
  categoryName?: string
  tagNames?: string[]
}) {
  const badges: { key: string; label: string; onRemove: () => void }[] = []

  if (filters.q) badges.push({ key: "q", label: `"${filters.q}"`, onRemove: () => setFilter("q", "") })
  if (filters.frameType)
    badges.push({
      key: "frameType",
      label: filters.frameType,
      onRemove: () => setFilter("frameType", ""),
    })
  if (filters.brandId)
    badges.push({
      key: "brandId",
      label: brandName ?? "Marca",
      onRemove: () => setFilter("brandId", ""),
    })
  if (filters.categoryId)
    badges.push({
      key: "categoryId",
      label: categoryName ?? "Categoria",
      onRemove: () => setFilter("categoryId", ""),
    })
  if (filters.tagIds.length)
    badges.push({
      key: "tagIds",
      label: tagNames?.length ? `Tags: ${tagNames.join(", ")}` : "Tags",
      onRemove: () => setTagIds([]),
    })
  if (filters.sizeMin || filters.sizeMax)
    badges.push({
      key: "size",
      label: `Tamanho: ${filters.sizeMin || "…"}–${filters.sizeMax || "…"}mm`,
      onRemove: () => setRange("sizeMin", "sizeMax", "", ""),
    })
  if (filters.bridgeMin || filters.bridgeMax)
    badges.push({
      key: "bridge",
      label: `Ponte: ${filters.bridgeMin || "…"}–${filters.bridgeMax || "…"}mm`,
      onRemove: () => setRange("bridgeMin", "bridgeMax", "", ""),
    })
  if (filters.templeMin || filters.templeMax)
    badges.push({
      key: "temple",
      label: `Haste: ${filters.templeMin || "…"}–${filters.templeMax || "…"}mm`,
      onRemove: () => setRange("templeMin", "templeMax", "", ""),
    })

  if (badges.length === 0) return null

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="text-body-sm text-text-muted">Filtros:</span>
      {badges.map((badge) => (
        <Badge key={badge.key} variant="outline" className="gap-1 pr-1">
          {badge.label}
          <button
            type="button"
            onClick={badge.onRemove}
            className="rounded-full p-0.5 hover:bg-brand-subtle"
            aria-label={`Remover filtro ${badge.label}`}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
    </div>
  )
}
