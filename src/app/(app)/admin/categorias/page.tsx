"use client"

import { SimpleEntityCrud } from "@/components/domain/simple-entity-crud"
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/services/categories.service"

export default function CategoriasPage() {
  return (
    <SimpleEntityCrud
      title="Categorias"
      entityName="categoria"
      queryKey="categories"
      listFn={listCategories}
      createFn={createCategory}
      updateFn={updateCategory}
      deleteFn={deleteCategory}
    />
  )
}
