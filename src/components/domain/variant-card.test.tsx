import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { VariantCard } from "./variant-card"
import type { CatalogItem } from "@/types/api"

const baseVariant: CatalogItem = {
  variantId: "v1",
  productId: "p1",
  skuVariant: "OB 8142 C2",
  colorCode: "C2",
  colorLabel: "Preto Fosco",
  primaryImageUrl: "https://example.com/main.jpg",
  imageUrls: ["https://example.com/main.jpg", "https://example.com/second.jpg"],
  productName: "Modelo X",
  productSku: "OB 8142",
  frameType: "grau",
  sizeMm: 52,
  bridgeSizeMm: 14.5,
  templeSizeMm: 140,
  gender: null,
  brandName: "Ray-Ban",
  categoryName: "Solares",
}

describe("VariantCard", () => {
  it("renderiza SKU, cor e marca", () => {
    render(<VariantCard variant={baseVariant} selected={false} onToggle={vi.fn()} onViewDetails={vi.fn()} />)

    expect(screen.getByText("OB 8142 C2")).toBeInTheDocument()
    expect(screen.getByText("Preto Fosco")).toBeInTheDocument()
    expect(screen.getByText("Ray-Ban")).toBeInTheDocument()
  })

  it("usa o código da cor quando não há nome da cor cadastrado", () => {
    const variant = { ...baseVariant, colorLabel: null }
    render(<VariantCard variant={variant} selected={false} onToggle={vi.fn()} onViewDetails={vi.fn()} />)

    expect(screen.getByText("C2")).toBeInTheDocument()
  })

  it("renderiza badges de tipo e categoria quando presentes", () => {
    render(<VariantCard variant={baseVariant} selected={false} onToggle={vi.fn()} onViewDetails={vi.fn()} />)

    expect(screen.getByText("grau")).toBeInTheDocument()
    expect(screen.getByText("Solares")).toBeInTheDocument()
  })

  it("não renderiza badges quando tipo e categoria estão ausentes", () => {
    const variant = { ...baseVariant, frameType: null, categoryName: null }
    render(<VariantCard variant={variant} selected={false} onToggle={vi.fn()} onViewDetails={vi.fn()} />)

    expect(screen.queryByText("grau")).not.toBeInTheDocument()
    expect(screen.queryByText("Solares")).not.toBeInTheDocument()
  })

  it("mostra o ícone de imagem ausente quando não há primaryImageUrl", () => {
    const variant = { ...baseVariant, primaryImageUrl: null, imageUrls: [] }
    const { container } = render(
      <VariantCard variant={variant} selected={false} onToggle={vi.fn()} onViewDetails={vi.fn()} />
    )

    expect(container.querySelector("img")).not.toBeInTheDocument()
  })

  it("clicar no card chama onToggle com a variante", () => {
    const onToggle = vi.fn()
    const { container } = render(
      <VariantCard variant={baseVariant} selected={false} onToggle={onToggle} onViewDetails={vi.fn()} />
    )

    fireEvent.click(container.firstElementChild as HTMLElement)
    expect(onToggle).toHaveBeenCalledWith(baseVariant)
  })

  it("clicar no botão de detalhes chama onViewDetails e não onToggle", () => {
    const onToggle = vi.fn()
    const onViewDetails = vi.fn()
    render(<VariantCard variant={baseVariant} selected={false} onToggle={onToggle} onViewDetails={onViewDetails} />)

    fireEvent.click(screen.getByRole("button", { name: "Ver detalhes de OB 8142 C2" }))

    expect(onViewDetails).toHaveBeenCalledWith(baseVariant)
    expect(onToggle).not.toHaveBeenCalled()
  })

  it("reflete o estado selecionado no checkbox", () => {
    const { rerender } = render(
      <VariantCard variant={baseVariant} selected={false} onToggle={vi.fn()} onViewDetails={vi.fn()} />
    )
    expect(screen.getByRole("checkbox")).not.toBeChecked()

    rerender(<VariantCard variant={baseVariant} selected onToggle={vi.fn()} onViewDetails={vi.fn()} />)
    expect(screen.getByRole("checkbox")).toBeChecked()
  })
})
