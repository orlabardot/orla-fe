"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { MoreHorizontal, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { useAuthUser } from "@/hooks/use-auth"
import { createUser, listUsers, updateUser } from "@/services/users.service"
import {
  createUserSchema,
  editUserSchema,
  type CreateUserFormValues,
  type EditUserFormValues,
} from "@/schemas/user.schema"
import type { ManagedUser } from "@/types/api"

const roleLabels: Record<string, string> = {
  admin: "Admin",
  employee: "Funcionário/Cliente",
}

export default function UsuariosPage() {
  const qc = useQueryClient()
  const currentUser = useAuthUser()
  const { data, isLoading } = useQuery({ queryKey: ["users"], queryFn: listUsers })

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<ManagedUser | null>(null)

  const createForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", password: "", role: "employee" },
  })

  const editForm = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: { name: "", email: "", role: "employee", isActive: true, password: "" },
  })

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["users"] })
  }

  const createMutation = useMutation({
    mutationFn: (values: CreateUserFormValues) => createUser(values),
    onSuccess: () => {
      invalidate()
      toast.success("Usuário criado com sucesso")
      setCreateOpen(false)
      createForm.reset()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const editMutation = useMutation({
    mutationFn: (values: EditUserFormValues) =>
      updateUser(editing!.id, {
        name: values.name,
        email: values.email,
        role: values.role,
        isActive: values.isActive,
        password: values.password || undefined,
      }),
    onSuccess: () => {
      invalidate()
      toast.success("Usuário atualizado com sucesso")
      setEditing(null)
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  function openEdit(user: ManagedUser) {
    setEditing(user)
    editForm.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      password: "",
    })
  }

  const isSelf = editing?.id === currentUser?.id

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-display-sm text-foreground">Usuários</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Novo usuário
        </Button>
      </div>

      <p className="mt-1 text-body-sm text-text-muted">
        Contas de acesso ao sistema. &quot;Funcionário/Cliente&quot; só enxerga o catálogo e
        pode gerar PDFs — sem acesso a esta área de admin.
      </p>

      <div className="mt-4 rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-text-muted">
                  Nenhum usuário cadastrado
                </TableCell>
              </TableRow>
            )}

            {data?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="text-foreground">
                  {user.name}
                  {user.id === currentUser?.id && (
                    <span className="ml-2 text-body-sm text-text-muted">(você)</span>
                  )}
                </TableCell>
                <TableCell className="text-text-secondary">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {roleLabels[user.role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? "outline" : "destructive"}>
                    {user.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(user)}>Editar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo usuário</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={createForm.handleSubmit((values) => createMutation.mutate(values))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...createForm.register("name")} />
              {createForm.formState.errors.name && (
                <p className="text-body-sm text-danger">
                  {createForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...createForm.register("email")} />
              {createForm.formState.errors.email && (
                <p className="text-body-sm text-danger">
                  {createForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" {...createForm.register("password")} />
              {createForm.formState.errors.password && (
                <p className="text-body-sm text-danger">
                  {createForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Tipo de acesso</Label>
              <Select
                value={createForm.watch("role")}
                onValueChange={(value) =>
                  value && createForm.setValue("role", value as "admin" | "employee")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tipo de acesso">
                    {(value: string) => roleLabels[value]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Funcionário/Cliente</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Criando..." : "Criar usuário"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuário</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit((values) => editMutation.mutate(values))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="editName">Nome</Label>
              <Input id="editName" {...editForm.register("name")} />
              {editForm.formState.errors.name && (
                <p className="text-body-sm text-danger">
                  {editForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEmail">E-mail</Label>
              <Input id="editEmail" type="email" {...editForm.register("email")} />
              {editForm.formState.errors.email && (
                <p className="text-body-sm text-danger">
                  {editForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPassword">Nova senha (opcional)</Label>
              <Input
                id="editPassword"
                type="password"
                placeholder="Deixe em branco para manter a atual"
                {...editForm.register("password")}
              />
              {editForm.formState.errors.password && (
                <p className="text-body-sm text-danger">
                  {editForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Tipo de acesso</Label>
              <Select
                value={editForm.watch("role")}
                disabled={isSelf}
                onValueChange={(value) =>
                  value && editForm.setValue("role", value as "admin" | "employee")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tipo de acesso">
                    {(value: string) => roleLabels[value]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Funcionário/Cliente</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="editIsActive"
                checked={editForm.watch("isActive")}
                disabled={isSelf}
                onCheckedChange={(checked) => editForm.setValue("isActive", checked)}
              />
              <Label htmlFor="editIsActive">Conta ativa</Label>
            </div>
            {isSelf && (
              <p className="text-body-sm text-text-muted">
                Você não pode alterar o tipo de acesso nem desativar a própria conta.
              </p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={editMutation.isPending}>
                {editMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
