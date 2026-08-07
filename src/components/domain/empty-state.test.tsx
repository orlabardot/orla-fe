import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { EmptyState } from "./empty-state"

describe("EmptyState", () => {
  it("renderiza título e descrição padrão quando nenhum é informado", () => {
    render(<EmptyState />)

    expect(screen.getByText("Nenhum produto encontrado")).toBeInTheDocument()
    expect(screen.getByText("Ajuste os filtros ou busque por outro termo.")).toBeInTheDocument()
  })

  it("renderiza título e descrição customizados", () => {
    render(<EmptyState title="Não foi possível carregar" description="Tente novamente." />)

    expect(screen.getByText("Não foi possível carregar")).toBeInTheDocument()
    expect(screen.getByText("Tente novamente.")).toBeInTheDocument()
  })

  it("não renderiza o botão de ação quando actionLabel/onAction não são informados", () => {
    render(<EmptyState />)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("renderiza o botão e dispara onAction ao clicar", () => {
    const onAction = vi.fn()
    render(<EmptyState actionLabel="Tentar novamente" onAction={onAction} />)

    const button = screen.getByRole("button", { name: "Tentar novamente" })
    fireEvent.click(button)

    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it("não renderiza o botão se só actionLabel for informado, sem onAction", () => {
    render(<EmptyState actionLabel="Tentar novamente" />)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })
})
