"use client"

import { SimpleEntityCrud } from "@/components/domain/simple-entity-crud"
import { createTag, deleteTag, listTags, updateTag } from "@/services/tags.service"

export default function TagsPage() {
  return (
    <SimpleEntityCrud
      title="Tags"
      entityName="tag"
      queryKey="tags"
      listFn={listTags}
      createFn={createTag}
      updateFn={updateTag}
      deleteFn={deleteTag}
    />
  )
}
