"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getApiErrorMessage } from "@/lib/api-error"
import { listCategories } from "@/services/categories.service"
import { listBrands } from "@/services/brands.service"
import { listTags } from "@/services/tags.service"
import { createProduct, updateProduct } from "@/services/products.service"
import {
  frameTypeOptions,
  genderOptions,
  productFormDefaults,
  productFormToCreateBody,
  productFormToUpdateBody,
  productSchema,
  type ProductFormValues,
} from "@/schemas/product.schema"

const NONE_VALUE = "none"

interface ProductFormProps {
  mode: "create" | "edit"
  productId?: string
  defaultValues?: ProductFormValues
}

export function ProductForm({ mode, productId, defaultValues }: ProductFormProps) {
  const router = useRouter()
  const qc = useQueryClient()
  const categories = useQuery({ queryKey: ["categories"], queryFn: listCategories })
  const brands = useQuery({ queryKey: ["brands"], queryFn: listBrands })
  const tags = useQuery({ queryKey: ["tags"], queryFn: listTags })
  const [tagsOpen, setTagsOpen] = useState(false)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues ?? productFormDefaults,
  })

  const createMutation = useMutation({
    mutationFn: (values: ProductFormValues) => createProduct(productFormToCreateBody(values)),
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: ["products"] })
      toast.success("Produto criado com sucesso")
      router.push(`/admin/produtos/${product.id}/variantes`)
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const updateMutation = useMutation({
    mutationFn: (values: ProductFormValues) =>
      updateProduct(productId!, productFormToUpdateBody(values)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] })
      toast.success("Produto atualizado com sucesso")
      router.push("/admin/produtos")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  function onSubmit(values: ProductFormValues) {
    if (mode === "create") {
      createMutation.mutate(values)
    } else {
      updateMutation.mutate(values)
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending
  const selectedTagIds = form.watch("tagIds")
  const selectedTags = tags.data?.filter((tag) => selectedTagIds.includes(tag.id)) ?? []

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl space-y-8">
      <section className="space-y-4">
        <h2 className="font-playfair text-heading text-foreground">Identificação</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU *</Label>
            <Input id="sku" className="font-mono" {...form.register("sku")} />
            {form.formState.errors.sku && (
              <p className="text-body-sm text-danger">{form.formState.errors.sku.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-body-sm text-danger">{form.formState.errors.name.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Marca</Label>
            <Select
              value={form.watch("brandId") || NONE_VALUE}
              onValueChange={(value) => form.setValue("brandId", value === NONE_VALUE ? "" : value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar marca">
                  {(value: string) =>
                    value === NONE_VALUE
                      ? "Nenhuma"
                      : brands.data?.find((brand) => brand.id === value)?.name
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>Nenhuma</SelectItem>
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
              value={form.watch("categoryId") || NONE_VALUE}
              onValueChange={(value) =>
                form.setValue("categoryId", value === NONE_VALUE ? "" : value ?? "")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar categoria">
                  {(value: string) =>
                    value === NONE_VALUE
                      ? "Nenhuma"
                      : categories.data?.find((category) => category.id === value)?.name
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>Nenhuma</SelectItem>
                {categories.data?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" rows={3} {...form.register("description")} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-playfair text-heading text-foreground">Atributos técnicos</h2>

        <div className="space-y-2">
          <Label>Tipo de armação</Label>
          <div className="flex flex-wrap gap-2">
            {frameTypeOptions.map((type) => {
              const active = form.watch("frameType") === type
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => form.setValue("frameType", type)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-ui-sm capitalize transition-colors",
                    active
                      ? "border-brand bg-brand-muted text-foreground"
                      : "border-border text-text-muted hover:text-text-secondary"
                  )}
                >
                  {type}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Gênero</Label>
            <Select
              value={form.watch("gender") || NONE_VALUE}
              onValueChange={(value) =>
                form.setValue(
                  "gender",
                  value === NONE_VALUE ? undefined : (value as ProductFormValues["gender"])
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar gênero">
                  {(value: string) => (value === NONE_VALUE ? "Não informado" : value)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>Não informado</SelectItem>
                {genderOptions.map((gender) => (
                  <SelectItem key={gender} value={gender} className="capitalize">
                    {gender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sizeMm">Tamanho da lente (mm)</Label>
            <Input id="sizeMm" inputMode="decimal" {...form.register("sizeMm")} />
            {form.formState.errors.sizeMm && (
              <p className="text-body-sm text-danger">{form.formState.errors.sizeMm.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bridgeSizeMm">Tamanho da ponte (mm)</Label>
            <Input id="bridgeSizeMm" inputMode="decimal" {...form.register("bridgeSizeMm")} />
            {form.formState.errors.bridgeSizeMm && (
              <p className="text-body-sm text-danger">
                {form.formState.errors.bridgeSizeMm.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="templeSizeMm">Tamanho da haste (mm)</Label>
            <Input id="templeSizeMm" inputMode="decimal" {...form.register("templeSizeMm")} />
            {form.formState.errors.templeSizeMm && (
              <p className="text-body-sm text-danger">
                {form.formState.errors.templeSizeMm.message}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-playfair text-heading text-foreground">Tags</h2>

        <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
          <PopoverTrigger
            render={
              <Button variant="outline" className="w-full justify-between font-normal" />
            }
          >
            <span className="flex flex-wrap gap-1">
              {selectedTags.length ? (
                selectedTags.map((tag) => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))
              ) : (
                <span className="text-text-muted">Selecionar tags</span>
              )}
            </span>
            <ChevronsUpDown className="size-4 text-text-muted" />
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0">
            <Command>
              <CommandInput placeholder="Buscar tag..." />
              <CommandList>
                <CommandEmpty>Nenhuma tag encontrada.</CommandEmpty>
                <CommandGroup>
                  {tags.data?.map((tag) => {
                    const checked = selectedTagIds.includes(tag.id)
                    return (
                      <CommandItem
                        key={tag.id}
                        onSelect={() => {
                          form.setValue(
                            "tagIds",
                            checked
                              ? selectedTagIds.filter((id) => id !== tag.id)
                              : [...selectedTagIds, tag.id]
                          )
                        }}
                      >
                        <Check className={cn("size-4", checked ? "opacity-100" : "opacity-0")} />
                        {tag.name}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </section>

      <div className="flex justify-end gap-3 border-t border-border pt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/produtos")}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Salvando..." : "Salvar produto"}
        </Button>
      </div>
    </form>
  )
}
