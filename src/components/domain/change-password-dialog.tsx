"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getApiErrorMessage } from "@/lib/api-error"
import { changePassword } from "@/services/auth.service"
import { changePasswordSchema, type ChangePasswordFormValues } from "@/schemas/auth.schema"

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [showPasswords, setShowPasswords] = useState(false)

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  const mutation = useMutation({
    mutationFn: (values: ChangePasswordFormValues) =>
      changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    onSuccess: () => {
      toast.success("Senha alterada com sucesso")
      handleOpenChange(false)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível alterar a senha"))
    },
  })

  function handleOpenChange(next: boolean) {
    if (!next) {
      form.reset()
      setShowPasswords(false)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trocar senha</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="space-y-3"
        >
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <Input
              id="currentPassword"
              type={showPasswords ? "text" : "password"}
              autoComplete="current-password"
              autoFocus
              {...form.register("currentPassword")}
            />
            {form.formState.errors.currentPassword && (
              <p className="text-body-sm text-danger">
                {form.formState.errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input
              id="newPassword"
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
              {...form.register("newPassword")}
            />
            {form.formState.errors.newPassword && (
              <p className="text-body-sm text-danger">
                {form.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-body-sm text-danger">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowPasswords((v) => !v)}
            className="flex items-center gap-1.5 text-body-sm text-text-muted transition-colors hover:text-foreground"
          >
            {showPasswords ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            {showPasswords ? "Ocultar senhas" : "Mostrar senhas"}
          </button>

          <DialogFooter className="pt-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
