"use client"

import { useEffect, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authStorage } from "@/lib/auth-storage"
import { login, logout, type LoginPayload } from "@/services/auth.service"
import type { AuthUser } from "@/types/api"

export function useLogin() {
  const router = useRouter()

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (data, variables) => {
      authStorage.set(data.token, data.user, variables.tenantSlug)
      router.push("/")
    },
    onError: () => {
      toast.error("E-mail, senha ou ótica inválidos")
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
