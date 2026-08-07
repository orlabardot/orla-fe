import type { AuthTenant, AuthUser } from "@/types/api"

const TOKEN_KEY = "@otica:token"
const USER_KEY = "@otica:user"
const TENANT_KEY = "@otica:tenant"

// Cache do último parse — useSyncExternalStore exige que getSnapshot
// devolva a mesma referência entre chamadas quando o valor não mudou.
let cachedRawUser: string | null = null
let cachedUser: AuthUser | null = null
let cachedRawTenant: string | null = null
let cachedTenant: AuthTenant | null = null

export const authStorage = {
  getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(TOKEN_KEY)
  },
  getUser(): AuthUser | null {
    if (typeof window === "undefined") return null
    const raw = localStorage.getItem(USER_KEY)
    if (raw !== cachedRawUser) {
      cachedRawUser = raw
      cachedUser = raw ? (JSON.parse(raw) as AuthUser) : null
    }
    return cachedUser
  },
  // Guarda o tenant inteiro (não só o slug) — é de onde o front lê
  // whatsappPhone pra montar o link de checkout, sem precisar de uma
  // chamada autenticada extra (GET /tenant/settings é admin-only).
  getTenant(): AuthTenant | null {
    if (typeof window === "undefined") return null
    const raw = localStorage.getItem(TENANT_KEY)
    if (raw !== cachedRawTenant) {
      cachedRawTenant = raw
      cachedTenant = raw ? (JSON.parse(raw) as AuthTenant) : null
    }
    return cachedTenant
  },
  set(token: string, user: AuthUser, tenant: AuthTenant) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    localStorage.setItem(TENANT_KEY, JSON.stringify(tenant))
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TENANT_KEY)
  },
}
