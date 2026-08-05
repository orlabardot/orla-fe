import { Topbar } from "@/components/layout/topbar"
import { SidebarSheet } from "@/components/layout/sidebar-sheet"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <SidebarSheet />
      <main className="mx-auto max-w-content">{children}</main>
    </div>
  )
}
