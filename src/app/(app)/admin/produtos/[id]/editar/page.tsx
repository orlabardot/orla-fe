"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { ProductForm } from "@/components/domain/product-form"
import { Skeleton } from "@/components/ui/skeleton"
import { getProduct } from "@/services/products.service"
import { productToFormValues } from "@/schemas/product.schema"

export default function EditarProdutoPage() {
  const { id } = useParams<{ id: string }>()

  const product = useQuery({
    queryKey: ["products", id],
    queryFn: () => getProduct(id),
  })

  return (
    <div>
      <h1 className="font-playfair text-display-sm text-foreground">Editar produto</h1>
      <div className="mt-6 max-w-2xl space-y-4">
        {product.isLoading && (
          <>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        )}
        {product.data && (
          <ProductForm
            mode="edit"
            productId={id}
            defaultValues={productToFormValues(product.data)}
          />
        )}
      </div>
    </div>
  )
}
