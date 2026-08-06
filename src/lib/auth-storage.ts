import type { AuthUser } from "@/types/api"

const TOKEN_KEY = "@otica:token"
const USER_KEY = "@otica:user"
const TENANT_SLUG_KEY = "@otica:tenant-slug"

// Cache do último parse — useSyncExternalStore exige que getSnapshot
// devolva a mesma referência entre chamadas quando o valor não mudou.
let cachedRawUser: string | null = null
let cachedUser: AuthUser | null = null

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
  getTenantSlug(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(TENANT_SLUG_KEY)
  },
  set(token: string, user: AuthUser, tenantSlug: string) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    localStorage.setItem(TENANT_SLUG_KEY, tenantSlug)
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TENANT_SLUG_KEY)
  },
}
