"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ArrowLeft, Loader2, MoreHorizontal, Plus, Star, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
import { bulkCreateVariants, deleteVariant, updateVariant } from "@/services/variants.service"
import { deleteImage, setPrimaryImage, uploadImage } from "@/services/images.service"
import {
  buildVariantSku,
  bulkCreateVariantsSchema,
  editVariantSchema,
  normalizeColorCode,
  type BulkCreateVariantsFormValues,
  type EditVariantFormValues,
} from "@/schemas/variant.schema"
import type { BulkCreateVariantsBody, Product, ProductVariant } from "@/types/api"

const emptyVariant = { colorCode: "", colorLabel: "" }

export default function VariantesPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const queryKey = ["products", id]

  const product = useQuery({ queryKey, queryFn: () => getProduct(id) })

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<ProductVariant | null>(null)
  const [deleting, setDeleting] = useState<ProductVariant | null>(null)

  const createForm = useForm<BulkCreateVariantsFormValues>({
    resolver: zodResolver(bulkCreateVariantsSchema),
    defaultValues: { variants: [{ ...emptyVariant }] },
  })
  const variantFields = useFieldArray({ control: createForm.control, name: "variants" })
  // Alimenta o preview do SKU enquanto o usuário digita o código da cor.
  const watchedColorCodes = createForm.watch("variants")

  const editForm = useForm<EditVariantFormValues>({
    resolver: zodResolver(editVariantSchema),
    defaultValues: { colorLabel: "", isActive: true },
  })

  function invalidate() {
    qc.invalidateQueries({ queryKey })
  }

  function closeCreateDialog() {
    setCreateOpen(false)
    createForm.reset({ variants: [{ ...emptyVariant }] })
  }

  const createMutation = useMutation({
    mutationFn: (body: BulkCreateVariantsBody) => bulkCreateVariants(id, body),
    onSuccess: (created) => {
      invalidate()
      toast.success(
        created.length > 1
          ? `${created.length} variantes criadas com sucesso`
          : "Variante criada com sucesso"
      )
      closeCreateDialog()
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
    onSuccess: () => {
      invalidate()
      // Sem isso, upload bem-sucedido e falha de carregamento da imagem ficam
      // visualmente idênticos (nada acontece na tela).
      toast.success("Foto adicionada")
    },
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

  /** Só a variante que está recebendo upload mostra estado de envio, não todas. */
  function isUploadingTo(variantId: string) {
    return uploadMutation.isPending && uploadMutation.variables?.variantId === variantId
  }

  /** O formulário coleta só a cor; o SKU de cada variante é derivado do produto. */
  function submitCreate(values: BulkCreateVariantsFormValues, currentProduct: Product) {
    createMutation.mutate({
      variants: values.variants.map((variant) => ({
        skuVariant: buildVariantSku(currentProduct, variant.colorCode),
        colorCode: normalizeColorCode(variant.colorCode),
        colorLabel: variant.colorLabel?.trim() || undefined,
      })),
    })
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
        <Button onClick={() => setCreateOpen(true)} disabled={!product.data}>
          <Plus className="size-4" />
          Nova cor
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
              <div className="flex items-center gap-3">
                <span className="font-mono text-sku text-foreground">
                  {variant.skuVariant}
                </span>
                {variant.colorLabel || variant.colorCode ? (
                  <Badge variant="outline">
                    {variant.colorCode && (
                      <span className="font-mono">{variant.colorCode}</span>
                    )}
                    {variant.colorCode && variant.colorLabel && " · "}
                    {variant.colorLabel}
                  </Badge>
                ) : (
                  <span className="text-body-sm text-text-muted italic">Sem cor cadastrada</span>
                )}
                {!variant.isActive && (
                  <span className="text-body-sm text-text-muted">(inativa)</span>
                )}
              </div>
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
                    // O thumb de 400px já é gerado no upload; num tile de 80px não faz
                    // sentido baixar o original de 1200px.
                    src={image.thumbUrl ?? image.url}
                    alt={variant.skuVariant}
                    className="size-full rounded-md border border-border object-cover"
                  />
                  {image.isPrimary ? (
                    <span className="absolute top-1 left-1 rounded-full bg-brand p-0.5">
                      <Star className="size-3 fill-bg-page text-bg-page" />
                    </span>
                  ) : (
                    // Sem opacity-0/group-hover aqui de propósito — hover não
                    // existe em touch/mobile, o que deixava esse botão
                    // impossível de alcançar fora do desktop com mouse.
                    <button
                      type="button"
                      onClick={() =>
                        setPrimaryMutation.mutate({ variantId: variant.id, imageId: image.id })
                      }
                      className="absolute top-1 left-1 rounded-full bg-bg-page/80 p-0.5"
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
                    className="absolute top-1 right-1 rounded-full bg-bg-page/80 p-0.5"
                    aria-label="Excluir imagem"
                  >
                    <Trash2 className="size-3 text-danger" />
                  </button>
                </div>
              ))}

              <label
                htmlFor={`upload-${variant.id}`}
                aria-busy={isUploadingTo(variant.id)}
                className="flex size-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-text-muted hover:border-text-muted aria-busy:pointer-events-none aria-busy:opacity-60"
              >
                {isUploadingTo(variant.id) ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span className="text-center text-[10px] leading-tight">Enviando</span>
                  </>
                ) : (
                  <>
                    <Plus className="size-4" />
                    <span className="text-center text-[10px] leading-tight">Adicionar</span>
                  </>
                )}
              </label>
              <input
                id={`upload-${variant.id}`}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={isUploadingTo(variant.id)}
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

      <Dialog open={createOpen} onOpenChange={(open) => (open ? setCreateOpen(true) : closeCreateDialog())}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar cor</DialogTitle>
          </DialogHeader>
          {product.data && (
            <div className="rounded-lg border border-border bg-bg-page p-3">
              <p className="text-body-sm text-text-muted">Modelo</p>
              <p className="mt-0.5">
                <span className="font-mono text-sku text-foreground">{product.data.sku}</span>
                <span className="text-text-muted"> · {product.data.name}</span>
                {product.data.sizeMm !== null && (
                  <span className="text-text-muted"> · {product.data.sizeMm}mm</span>
                )}
              </p>
              {product.data.sizeMm === null && (
                <p className="mt-1.5 text-body-sm text-text-muted">
                  Este modelo está sem tamanho cadastrado, então o SKU da variante sai sem
                  ele. Para incluir o tamanho,{" "}
                  <Link
                    href={`/admin/produtos/${id}/editar`}
                    className="underline hover:text-text-secondary"
                  >
                    edite o produto
                  </Link>
                  .
                </p>
              )}
            </div>
          )}
          <form
            onSubmit={createForm.handleSubmit((values) => {
              if (!product.data) return
              submitCreate(values, product.data)
            })}
            className="space-y-4"
          >
            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {variantFields.fields.map((field, index) => (
                <div key={field.id} className="space-y-3 rounded-lg border border-border p-3">
                  {variantFields.fields.length > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-body-sm text-text-muted">Cor {index + 1}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => variantFields.remove(index)}
                        aria-label={`Remover cor ${index + 1}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`variants.${index}.colorCode`}>Código da cor *</Label>
                      <Input
                        id={`variants.${index}.colorCode`}
                        className="font-mono"
                        placeholder="ex: C1"
                        autoComplete="off"
                        {...createForm.register(`variants.${index}.colorCode`)}
                      />
                      {createForm.formState.errors.variants?.[index]?.colorCode && (
                        <p className="text-body-sm text-danger">
                          {createForm.formState.errors.variants[index]?.colorCode?.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`variants.${index}.colorLabel`}>
                        Nome da cor{" "}
                        <span className="text-text-muted">(opcional)</span>
                      </Label>
                      <Input
                        id={`variants.${index}.colorLabel`}
                        placeholder="ex: Preto Fosco"
                        {...createForm.register(`variants.${index}.colorLabel`)}
                      />
                    </div>
                  </div>
                  <p className="text-body-sm text-text-muted">
                    SKU da variante:{" "}
                    <span className="font-mono text-foreground">
                      {product.data && watchedColorCodes?.[index]?.colorCode
                        ? buildVariantSku(product.data, watchedColorCodes[index].colorCode)
                        : "—"}
                    </span>
                  </p>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => variantFields.append({ ...emptyVariant })}
            >
              <Plus className="size-4" />
              Adicionar outra cor
            </Button>
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending || !product.data}>
                {createMutation.isPending
                  ? "Salvando..."
                  : variantFields.fields.length > 1
                    ? `Salvar ${variantFields.fields.length} cores`
                    : "Salvar cor"}
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
