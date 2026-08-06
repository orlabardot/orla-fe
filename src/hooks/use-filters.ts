"use client"

import { useCallback, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { CatalogFilters, CatalogSort, FrameType } from "@/types/api"

export interface CatalogFilterState {
  q: string
  frameType: FrameType | ""
  categoryId: string
  brandId: string
  colorCode: string
  sizeMin: string
  sizeMax: string
  bridgeMin: string
  bridgeMax: string
  templeMin: string
  templeMax: string
  tagIds: string[]
  sort: CatalogSort
  page: number
}

const DEFAULT_STATE: CatalogFilterState = {
  q: "",
  frameType: "",
  categoryId: "",
  brandId: "",
  colorCode: "",
  sizeMin: "",
  sizeMax: "",
  bridgeMin: "",
  bridgeMax: "",
  templeMin: "",
  templeMax: "",
  tagIds: [],
  sort: "name_asc",
  page: 1,
}

export function useFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters = useMemo<CatalogFilterState>(() => {
    const tagIdsParam = searchParams.get("tagIds")
    return {
      q: searchParams.get("q") ?? DEFAULT_STATE.q,
      frameType: (searchParams.get("frameType") as FrameType | null) ?? DEFAULT_STATE.frameType,
      categoryId: searchParams.get("categoryId") ?? DEFAULT_STATE.categoryId,
      brandId: searchParams.get("brandId") ?? DEFAULT_STATE.brandId,
      colorCode: searchParams.get("colorCode") ?? DEFAULT_STATE.colorCode,
      sizeMin: searchParams.get("sizeMin") ?? DEFAULT_STATE.sizeMin,
      sizeMax: searchParams.get("sizeMax") ?? DEFAULT_STATE.sizeMax,
      bridgeMin: searchParams.get("bridgeMin") ?? DEFAULT_STATE.bridgeMin,
      bridgeMax: searchParams.get("bridgeMax") ?? DEFAULT_STATE.bridgeMax,
      templeMin: searchParams.get("templeMin") ?? DEFAULT_STATE.templeMin,
      templeMax: searchParams.get("templeMax") ?? DEFAULT_STATE.templeMax,
      tagIds: tagIdsParam ? tagIdsParam.split(",").filter(Boolean) : [],
      sort: (searchParams.get("sort") as CatalogSort | null) ?? DEFAULT_STATE.sort,
      page: Number(searchParams.get("page")) || DEFAULT_STATE.page,
    }
  }, [searchParams])

  const updateParams = useCallback(
    (updates: Partial<Record<keyof CatalogFilterState, string | null>>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (!value) {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      // qualquer mudança de filtro reseta a paginação, exceto quando é a
      // própria página que está sendo alterada
      if (!("page" in updates)) {
        params.delete("page")
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const setFilter = useCallback(
    (key: keyof Omit<CatalogFilterState, "tagIds" | "page">, value: string) => {
      updateParams({ [key]: value || null })
    },
    [updateParams]
  )

  const setTagIds = useCallback(
    (tagIds: string[]) => {
      updateParams({ tagIds: tagIds.length ? tagIds.join(",") : null })
    },
    [updateParams]
  )

  const setRange = useCallback(
    (
      minKey: "sizeMin" | "bridgeMin" | "templeMin",
      maxKey: "sizeMax" | "bridgeMax" | "templeMax",
      min: string,
      max: string
    ) => {
      updateParams({ [minKey]: min || null, [maxKey]: max || null })
    },
    [updateParams]
  )

  const setPage = useCallback(
    (page: number) => {
      updateParams({ page: page > 1 ? String(page) : null })
    },
    [updateParams]
  )

  const clearFilters = useCallback(() => {
    router.push(pathname)
  }, [pathname, router])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.q) count++
    if (filters.frameType) count++
    if (filters.categoryId) count++
    if (filters.brandId) count++
    if (filters.colorCode) count++
    if (filters.sizeMin || filters.sizeMax) count++
    if (filters.bridgeMin || filters.bridgeMax) count++
    if (filters.templeMin || filters.templeMax) count++
    if (filters.tagIds.length) count++
    return count
  }, [filters])

  const apiFilters = useMemo<CatalogFilters>(
    () => ({
      page: filters.page,
      limit: 20,
      q: filters.q || undefined,
      frameType: (filters.frameType || undefined) as FrameType | undefined,
      categoryId: filters.categoryId || undefined,
      brandId: filters.brandId || undefined,
      colorCode: filters.colorCode || undefined,
      sizeMin: filters.sizeMin ? Number(filters.sizeMin) : undefined,
      sizeMax: filters.sizeMax ? Number(filters.sizeMax) : undefined,
      bridgeMin: filters.bridgeMin ? Number(filters.bridgeMin) : undefined,
      bridgeMax: filters.bridgeMax ? Number(filters.bridgeMax) : undefined,
      templeMin: filters.templeMin ? Number(filters.templeMin) : undefined,
      templeMax: filters.templeMax ? Number(filters.templeMax) : undefined,
      tagIds: filters.tagIds.length ? filters.tagIds.join(",") : undefined,
      sort: filters.sort,
    }),
    [filters]
  )

  return {
    filters,
    apiFilters,
    setFilter,
    setTagIds,
    setRange,
    setPage,
    clearFilters,
    activeFilterCount,
  }
}
