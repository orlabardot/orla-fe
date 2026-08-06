import axios from "axios"
import { authStorage } from "@/lib/auth-storage"

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333",
  timeout: 10_000,
})

api.interceptors.request.use((config) => {
  const token = authStorage.getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (config.url?.includes("/pdf/generate")) {
    config.timeout = 35_000
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      authStorage.clear()
      if (window.location.pathname !== "/login") {
        // Interceptor roda fora da árvore React — sem useRouter aqui.
        // Full reload é aceitável: limpa qualquer estado/cache em memória.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)
