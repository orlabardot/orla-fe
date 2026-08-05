"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, LibraryBig } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAuthUser, useLogout } from "@/hooks/use-auth"
import { useUIStore } from "@/stores/ui.store"

const navLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/catalogo", label: "Catálogo", icon: LibraryBig },
]

export function SidebarSheet() {
  const pathname = usePathname()
  const user = useAuthUser()
  const logout = useLogout()
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen)

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent side="left" className="border-border bg-bg-surface p-0">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle className="flex items-baseline gap-1.5 font-normal">
            <span className="font-playfair text-lg italic text-foreground">Ótica</span>
            <span className="text-lg font-light text-text-muted">Manager</span>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-1 flex-col gap-1 px-2">
          {navLinks.map((link) => {
            const active = pathname === link.href
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-ui-md transition-colors",
                  active
                    ? "border-l-2 border-brand bg-brand-subtle text-foreground"
                    : "text-text-muted hover:bg-brand-subtle hover:text-text-secondary"
                )}
              >
                <Icon className="size-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border px-4 py-4">
          <p className="text-body-md text-foreground">{user?.name ?? "—"}</p>
          <p className="text-body-sm text-text-muted">{user?.role}</p>
          <button
            type="button"
            onClick={() => logout.mutate()}
            className="mt-3 text-ui-sm text-text-secondary hover:text-foreground"
          >
            Sair
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
