"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { MoreHorizontal, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { getApiErrorMessage } from "@/lib/api-error"

interface SimpleEntity {
  id: string
  name: string
  slug: string
  createdAt: string
}

const nameSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
})
type NameFormValues = z.infer<typeof nameSchema>

interface SimpleEntityCrudProps {
  title: string
  // Nome singular em minúsculo (ex: "categoria", "marca", "tag") — todas as
  // instâncias atuais são substantivos femininos, daí "criada"/"excluída" fixos.
  entityName: string
  queryKey: string
  listFn: () => Promise<SimpleEntity[]>
  createFn: (name: string) => Promise<SimpleEntity>
  updateFn: (id: string, name: string) => Promise<SimpleEntity>
  deleteFn: (id: string) => Promise<void>
}

export function SimpleEntityCrud({
  title,
  entityName,
  queryKey,
  listFn,
  createFn,
  updateFn,
  deleteFn,
}: SimpleEntityCrudProps) {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: [queryKey], queryFn: listFn })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<SimpleEntity | null>(null)
  const [deleting, setDeleting] = useState<SimpleEntity | null>(null)

  const form = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: "" },
  })

  const entityNameCapitalized = entityName.charAt(0).toUpperCase() + entityName.slice(1)

  const createMutation = useMutation({
    mutationFn: (values: NameFormValues) => createFn(values.name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] })
      toast.success(`${entityNameCapitalized} criada com sucesso`)
      setDialogOpen(false)
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const updateMutation = useMutation({
    mutationFn: (values: NameFormValues) => updateFn(editing!.id, values.name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] })
      toast.success(`${entityNameCapitalized} atualizada com sucesso`)
      setDialogOpen(false)
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFn(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] })
      toast.success(`${entityNameCapitalized} excluída com sucesso`)
      setDeleting(null)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
      setDeleting(null)
    },
  })

  function openCreate() {
    setEditing(null)
    form.reset({ name: "" })
    setDialogOpen(true)
  }

  function openEdit(entity: SimpleEntity) {
    setEditing(entity)
    form.reset({ name: entity.name })
    setDialogOpen(true)
  }

  function onSubmit(values: NameFormValues) {
    if (editing) {
      updateMutation.mutate(values)
    } else {
      createMutation.mutate(values)
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-display-sm text-foreground">{title}</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nova {entityName}
        </Button>
      </div>

      <div className="mt-4 rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))}

            {!isLoading && data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-text-muted">
                  Nenhuma {entityName} cadastrada
                </TableCell>
              </TableRow>
            )}

            {data?.map((entity) => (
              <TableRow key={entity.id}>
                <TableCell className="text-foreground">{entity.name}</TableCell>
                <TableCell className="font-mono text-body-sm text-text-secondary">
                  {entity.slug}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(entity)}>
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleting(entity)}
                      >
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? `Editar ${entityName}` : `Nova ${entityName}`}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <Label htmlFor="entity-name">Nome</Label>
            <Input id="entity-name" autoFocus {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-body-sm text-danger">{form.formState.errors.name.message}</p>
            )}
            <DialogFooter className="pt-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {entityName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{deleting?.name}&quot;? Essa ação não pode
              ser desfeita.
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
