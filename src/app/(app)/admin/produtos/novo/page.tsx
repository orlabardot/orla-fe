"use client"

import { ProductForm } from "@/components/domain/product-form"

export default function NovoProdutoPage() {
  return (
    <div>
      <h1 className="font-playfair text-display-sm text-foreground">Novo produto</h1>
      <div className="mt-6">
        <ProductForm mode="create" />
      </div>
    </div>
  )
}
