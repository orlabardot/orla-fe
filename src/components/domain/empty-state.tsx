import { SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title = "Nenhum produto encontrado",
  description = "Ajuste os filtros ou busque por outro termo.",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <SearchX className="size-12 stroke-1 text-text-muted" />
      <h2 className="font-playfair text-heading text-foreground">{title}</h2>
      <p className="max-w-xs text-body-md text-text-muted">{description}</p>
      {actionLabel && onAction && (
        <Button variant="ghost" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
