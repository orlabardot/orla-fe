"use client"

import { useQuery } from "@tanstack/react-query"
import { DashboardStatCard } from "@/components/domain/dashboard-stat-card"
import { listProducts } from "@/services/products.service"
import { getCatalog } from "@/services/catalog.service"
import { listBrands } from "@/services/brands.service"
import { listCategories } from "@/services/categories.service"
import { useAuthUser } from "@/hooks/use-auth"

export default function DashboardPage() {
  const user = useAuthUser()

  const products = useQuery({
    queryKey: ["dashboard", "products-count"],
    queryFn: () => listProducts({ page: 1, limit: 1 }),
  })
  const catalog = useQuery({
    queryKey: ["dashboard", "variants-count"],
    queryFn: () => getCatalog({ page: 1, limit: 1 }),
  })
  const brands = useQuery({
    queryKey: ["dashboard", "brands"],
    queryFn: listBrands,
  })
  const categories = useQuery({
    queryKey: ["dashboard", "categories"],
    queryFn: listCategories,
  })

  return (
    <div className="px-4 py-6 md:px-6 md:py-8">
      <h1 className="font-playfair text-display-md text-foreground">
        Olá, {user?.name?.split(" ")[0] ?? ""}
      </h1>
      <p className="mt-1 text-body-lg text-text-secondary">
        Aqui está o resumo do catálogo hoje.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <DashboardStatCard
          label="Modelos cadastrados"
          value={products.data?.meta.total}
          loading={products.isLoading}
        />
        <DashboardStatCard
          label="Variantes"
          value={catalog.data?.meta.total}
          loading={catalog.isLoading}
        />
        <DashboardStatCard
          label="Marcas"
          value={brands.data?.length}
          loading={brands.isLoading}
        />
        <DashboardStatCard
          label="Categorias"
          value={categories.data?.length}
          loading={categories.isLoading}
        />
      </div>
    </div>
  )
}
