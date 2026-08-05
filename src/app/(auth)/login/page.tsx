"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema"
import { useLogin } from "@/hooks/use-auth"
import { authStorage } from "@/lib/auth-storage"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const login = useLogin()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { tenantSlug: "", email: "", password: "" },
  })

  useEffect(() => {
    const lastSlug = authStorage.getLastTenantSlug()
    if (lastSlug) form.setValue("tenantSlug", lastSlug)
  }, [form])

  function onSubmit(values: LoginFormValues) {
    login.mutate(values)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <p className="font-playfair text-3xl italic text-foreground">Ótica</p>
          <p className="font-inter text-3xl font-light text-text-secondary">Manager</p>
        </div>

        <Separator className="mb-8 bg-border" />

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 rounded-lg border border-border bg-bg-surface p-6 shadow-card"
        >
          <div className="space-y-2">
            <Label htmlFor="tenantSlug">Ótica</Label>
            <Input
              id="tenantSlug"
              placeholder="ex: demo"
              autoComplete="organization"
              autoCapitalize="off"
              {...form.register("tenantSlug")}
            />
            {form.formState.errors.tenantSlug && (
              <p className="text-body-sm text-danger">
                {form.formState.errors.tenantSlug.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-body-sm text-danger">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="pr-9"
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-foreground"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-body-sm text-danger">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={login.isPending}>
            {login.isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  )
}
