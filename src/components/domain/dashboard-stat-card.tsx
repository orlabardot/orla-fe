import { Skeleton } from "@/components/ui/skeleton"

interface DashboardStatCardProps {
  label: string
  value: number | undefined
  loading?: boolean
}

export function DashboardStatCard({ label, value, loading }: DashboardStatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-bg-surface p-4 shadow-card">
      <p className="text-body-md text-text-secondary">{label}</p>
      {loading || value === undefined ? (
        <Skeleton className="mt-2 h-9 w-16" />
      ) : (
        <p className="font-playfair text-display-lg text-foreground">
          {value.toLocaleString("pt-BR")}
        </p>
      )}
    </div>
  )
}
