"use client"

import { SimpleEntityCrud } from "@/components/domain/simple-entity-crud"
import { createBrand, deleteBrand, listBrands, updateBrand } from "@/services/brands.service"

export default function MarcasPage() {
  return (
    <SimpleEntityCrud
      title="Marcas"
      entityName="marca"
      queryKey="brands"
      listFn={listBrands}
      createFn={createBrand}
      updateFn={updateBrand}
      deleteFn={deleteBrand}
    />
  )
}
