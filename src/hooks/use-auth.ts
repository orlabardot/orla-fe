"use client"

import { useEffect, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authStorage } from "@/lib/auth-storage"
import { isTokenExpired } from "@/lib/jwt"
import { login, logout, type LoginPayload } from "@/services/auth.service"
import type { AuthTenant, AuthUser } from "@/types/api"

export function useLogin() {
  const router = useRouter()

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (data) => {
      authStorage.set(data.token, data.user, data.tenant)
      router.push("/")
    },
    onError: () => {
      toast.error("E-mail ou senha inválidos")
    },
  })
}

export function useLogout() {
  const router = useRouter()

  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      authStorage.clear()
      router.push("/login")
    },
  })
}

// useSyncExternalStore parecia a opção "correta" aqui, mas o resync pós-
// hidratação não corre a tempo do efeito de redirect do guard de auth ler o
// valor certo (reproduzido: recarregar "/" autenticado manda pro /login).
// O padrão efeito+estado, mesmo com uma renderização extra, é o que
// funciona de forma confiável para ler localStorage após montar no client.
export function useAuthToken(): string | null {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(authStorage.getToken())
  }, [])

  return token
}

export function useAuthUser(): AuthUser | null {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(authStorage.getUser())
  }, [])

  return user
}

export function useAuthTenant(): AuthTenant | null {
  const [tenant, setTenant] = useState<AuthTenant | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTenant(authStorage.getTenant())
  }, [])

  return tenant
}

interface RequireAuthOptions {
  /** Se definido, exige que o usuário logado tenha esse role. */
  role?: AuthUser["role"]
  /** Rota de destino quando o role não bate. Padrão: "/". */
  redirectTo?: string
}

// Guarda de autenticação compartilhada pelos layouts protegidos: checa token
// presente e não expirado (sem esperar uma chamada de API falhar com 401) e,
// opcionalmente, o role do usuário.
export function useRequireAuth(options: RequireAuthOptions = {}): boolean {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const { role, redirectTo = "/" } = options

  useEffect(() => {
    const token = authStorage.getToken()

    if (!token || isTokenExpired(token)) {
      authStorage.clear()
      router.replace("/login")
      return
    }

    if (role && authStorage.getUser()?.role !== role) {
      router.replace(redirectTo)
      return
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- guarda de auth: só corre uma vez no mount, lê localStorage (indisponível no SSR)
    setAuthorized(true)
  }, [router, role, redirectTo])

  return authorized
}
