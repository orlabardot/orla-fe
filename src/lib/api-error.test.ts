import { AxiosError } from "axios"
import { describe, expect, it } from "vitest"
import { getApiErrorMessage } from "./api-error"

describe("getApiErrorMessage", () => {
  it("retorna a mensagem vinda do corpo da resposta do backend", () => {
    const error = new AxiosError("Request failed", "400", undefined, undefined, {
      status: 400,
      statusText: "Bad Request",
      headers: {},
      // @ts-expect-error -- config não é relevante pro teste
      config: {},
      data: { code: "VALIDATION_ERROR", message: "E-mail inválido" },
    })

    expect(getApiErrorMessage(error)).toBe("E-mail inválido")
  })

  it("usa o fallback quando a resposta não tem mensagem", () => {
    const error = new AxiosError("Network Error")
    expect(getApiErrorMessage(error)).toBe("Algo deu errado. Tente novamente.")
  })

  it("usa um fallback customizado quando informado", () => {
    const error = new AxiosError("Network Error")
    expect(getApiErrorMessage(error, "Falha ao salvar")).toBe("Falha ao salvar")
  })

  it("usa o fallback quando o erro não é um AxiosError", () => {
    expect(getApiErrorMessage(new Error("erro qualquer"))).toBe(
      "Algo deu errado. Tente novamente."
    )
  })
})
