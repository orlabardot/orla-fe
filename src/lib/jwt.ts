interface JwtPayload {
  exp?: number
  [key: string]: unknown
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".")
  if (parts.length !== 3) return null

  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const json = atob(payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "="))
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

// Só decodifica o payload, não valida assinatura — serve apenas para UX
// (evitar mostrar telas protegidas com token vencido). O backend continua
// sendo a autoridade real sobre a validade do token.
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return true
  return payload.exp * 1000 <= Date.now()
}
