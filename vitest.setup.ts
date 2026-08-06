import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

// Sem test.globals no vitest.config (o projeto prefere imports explícitos),
// então o auto-cleanup do RTL não se registra sozinho — precisa ser
// explícito aqui pra não vazar DOM de um teste pro outro no mesmo arquivo.
afterEach(() => {
  cleanup()
})
