"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ArrowLeft, MoreHorizontal, Plus, Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getApiErrorMessage } from "@/lib/api-error"
import { getProduct } from "@/services/products.service"
import { createVariant, deleteVariant, updateVariant } from "@/services/variants.service"
import { deleteImage, setPrimaryImage, uploadImage } from "@/services/images.service"
import {
  createVariantSchema,
  editVariantSchema,
  type CreateVariantFormValues,
  type EditVariantFormValues,
} from "@/schemas/variant.schema"
import type { ProductVariant } from "@/types/api"

export default function VariantesPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const queryKey = ["products", id]

  const product = useQuery({ queryKey, queryFn: () => getProduct(id) })

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<ProductVariant | null>(null)
  const [deleting, setDeleting] = useState<ProductVariant | null>(null)

  const createForm = useForm<CreateVariantFormValues>({
    resolver: zodResolver(createVariantSchema),
    defaultValues: { skuVariant: "", colorCode: "", colorLabel: "" },
  })

  const editForm = useForm<EditVariantFormValues>({
    resolver: zodResolver(editVariantSchema),
    defaultValues: { colorLabel: "", isActive: true },
  })

  function invalidate() {
    qc.invalidateQueries({ queryKey })
  }

  const createMutation = useMutation({
    mutationFn: (values: CreateVariantFormValues) => createVariant(id, values),
    onSuccess: () => {
      invalidate()
      toast.success("Variante criada com sucesso")
      setCreateOpen(false)
      createForm.reset()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const editMutation = useMutation({
    mutationFn: (values: EditVariantFormValues) => updateVariant(id, editing!.id, values),
    onSuccess: () => {
      invalidate()
      toast.success("Variante atualizada com sucesso")
      setEditing(null)
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: (variantId: string) => deleteVariant(id, variantId),
    onSuccess: () => {
      invalidate()
      toast.success("Variante excluída com sucesso")
      setDeleting(null)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
      setDeleting(null)
    },
  })

  const uploadMutation = useMutation({
    mutationFn: ({ variantId, file }: { variantId: string; file: File }) =>
      uploadImage(variantId, file),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const deleteImageMutation = useMutation({
    mutationFn: ({ variantId, imageId }: { variantId: string; imageId: string }) =>
      deleteImage(variantId, imageId),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const setPrimaryMutation = useMutation({
    mutationFn: ({ variantId, imageId }: { variantId: string; imageId: string }) =>
      setPrimaryImage(variantId, imageId),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  function openEdit(variant: ProductVariant) {
    setEditing(variant)
    editForm.reset({ colorLabel: variant.colorLabel ?? "", isActive: variant.isActive })
  }

  return (
    <div>
      <Link
        href="/admin/produtos"
        className="inline-flex items-center gap-1.5 text-body-sm text-text-muted hover:text-text-secondary"
      >
        <ArrowLeft className="size-4" />
        Produtos
      </Link>

      <div className="mt-2 flex items-center justify-between">
        <h1 className="font-playfair text-display-sm text-foreground">
          {product.data ? (
            <>
              <span className="font-mono text-heading">{product.data.sku}</span> —{" "}
              {product.data.name}
            </>
          ) : (
            <Skeleton className="h-8 w-64" />
          )}
        </h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Variante
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {product.isLoading &&
          Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}

        {product.data?.variants.length === 0 && (
          <p className="py-8 text-center text-text-muted">
            Nenhuma variante cadastrada ainda.
          </p>
        )}

        {product.data?.variants.map((variant) => (
          <div key={variant.id} className="rounded-lg border border-border bg-bg-surface p-4">
            <div className="flex items-center justify-between">
              <p>
                <span className="font-mono text-sku text-foreground">
                  {variant.skuVariant}
                </span>
                {variant.colorLabel && (
                  <span className="ml-3 text-body-md text-text-secondary">
                    {variant.colorLabel}
                  </span>
                )}
                {!variant.isActive && (
                  <span className="ml-3 text-body-sm text-text-muted">(inativa)</span>
                )}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(variant)}>Editar</DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => setDeleting(variant)}>
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-3 flex flex-wrap gap-3">
              {variant.images.map((image) => (
                <div key={image.id} className="group relative size-20 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element -- thumbnails de fornecedores externos, sem otimização necessária aqui */}
                  <img
                    src={image.url}
                    alt={variant.skuVariant}
                    className="size-full rounded-md border border-border object-cover"
                  />
                  {image.isPrimary ? (
                    <span className="absolute top-1 left-1 rounded-full bg-brand p-0.5">
                      <Star className="size-3 fill-bg-page text-bg-page" />
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setPrimaryMutation.mutate({ variantId: variant.id, imageId: image.id })
                      }
                      className="absolute top-1 left-1 rounded-full bg-bg-page/80 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Definir como imagem primária"
                    >
                      <Star className="size-3 text-text-muted" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      deleteImageMutation.mutate({ variantId: variant.id, imageId: image.id })
                    }
                    className="absolute top-1 right-1 rounded-full bg-bg-page/80 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Excluir imagem"
                  >
                    <Trash2 className="size-3 text-danger" />
                  </button>
                </div>
              ))}

              <label
                htmlFor={`upload-${variant.id}`}
                className="flex size-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-text-muted hover:border-text-muted"
              >
                <Plus className="size-4" />
                <span className="text-center text-[10px] leading-tight">Adicionar</span>
              </label>
              <input
                id={`upload-${variant.id}`}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) uploadMutation.mutate({ variantId: variant.id, file })
                  e.target.value = ""
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova variante</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={createForm.handleSubmit((values) => createMutation.mutate(values))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="skuVariant">SKU da variante *</Label>
              <Input
                id="skuVariant"
                className="font-mono"
                placeholder="ex: OB 8142 C2"
                {...createForm.register("skuVariant")}
              />
              {createForm.formState.errors.skuVariant && (
                <p className="text-body-sm text-danger">
                  {createForm.formState.errors.skuVariant.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="colorCode">Código da cor</Label>
                <Input id="colorCode" placeholder="ex: C2" {...createForm.register("colorCode")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="colorLabel">Nome da cor</Label>
                <Input
                  id="colorLabel"
                  placeholder="ex: Preto Fosco"
                  {...createForm.register("colorLabel")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Salvando..." : "Salvar variante"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar variante</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit((values) => editMutation.mutate(values))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="editColorLabel">Nome da cor</Label>
              <Input id="editColorLabel" {...editForm.register("colorLabel")} />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={editForm.watch("isActive")}
                onCheckedChange={(checked) => editForm.setValue("isActive", checked)}
              />
              <Label htmlFor="isActive">Variante ativa</Label>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={editMutation.isPending}>
                {editMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir variante?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{deleting?.skuVariant}&quot;? Essa ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && deleteMutation.mutate(deleting.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
