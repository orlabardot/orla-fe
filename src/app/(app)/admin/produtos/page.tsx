"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { MoreHorizontal, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { listProducts } from "@/services/products.service"
import { listBrands } from "@/services/brands.service"
import { useDebounce } from "@/hooks/use-debounce"
import { frameTypeOptions } from "@/schemas/product.schema"
import type { FrameType } from "@/types/api"

const ALL_VALUE = "all"

export default function ProdutosPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [brandId, setBrandId] = useState(ALL_VALUE)
  const [frameType, setFrameType] = useState(ALL_VALUE)
  const debouncedSearch = useDebounce(search)

  const brands = useQuery({ queryKey: ["brands"], queryFn: listBrands })

  const products = useQuery({
    queryKey: ["products", { page, q: debouncedSearch, brandId, frameType }],
    queryFn: () =>
      listProducts({
        page,
        limit: 20,
        q: debouncedSearch || undefined,
        brandId: brandId === ALL_VALUE ? undefined : brandId,
        frameType: frameType === ALL_VALUE ? undefined : (frameType as FrameType),
      }),
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-display-sm text-foreground">Produtos</h1>
        <Button render={<Link href="/admin/produtos/novo" />} nativeButton={false}>
          <Plus className="size-4" />
          Novo produto
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Input
          placeholder="Buscar por nome ou SKU"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="max-w-xs"
        />
        <Select
          value={brandId}
          onValueChange={(value) => {
            setBrandId(value ?? ALL_VALUE)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Marca">
              {(value: string) =>
                value === ALL_VALUE
                  ? "Todas as marcas"
                  : brands.data?.find((brand) => brand.id === value)?.name
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
          value={frameType}
          onValueChange={(value) => {
            setFrameType(value ?? ALL_VALUE)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-36">
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

      <div className="mt-4 rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Variantes</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!products.isLoading && products.data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-text-muted">
                  Nenhum produto encontrado
                </TableCell>
              </TableRow>
            )}

            {products.data?.data.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-mono text-body-sm text-text-secondary">
                  {product.sku}
                </TableCell>
                <TableCell className="text-foreground">{product.name}</TableCell>
                <TableCell className="text-text-secondary">
                  {product.brand?.name ?? "—"}
                </TableCell>
                <TableCell className="text-text-secondary">
                  {product.variants.length}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/produtos/${product.id}/editar`)}
                      >
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/admin/produtos/${product.id}/variantes`)
                        }
                      >
                        Gerenciar variantes
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {products.data && products.data.meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-body-sm text-text-muted">
            {page} de {products.data.meta.totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= products.data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  )
}
