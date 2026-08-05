import { isAxiosError } from "axios"
import type { ApiError } from "@/types/api"

export function getApiErrorMessage(
  error: unknown,
  fallback = "Algo deu errado. Tente novamente."
): string {
  if (isAxiosError<ApiError>(error)) {
    return error.response?.data?.message ?? fallback
  }
  return fallback
}
