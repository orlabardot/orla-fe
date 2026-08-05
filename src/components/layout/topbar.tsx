"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useAuthUser, useLogout } from "@/hooks/use-auth"
import { useUIStore } from "@/stores/ui.store"

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/catalogo", label: "Catálogo" },
]

export function Topbar() {
  const pathname = usePathname()
  const user = useAuthUser()
  const logout = useLogout()
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen)

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "?"

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-bg-surface px-4 md:h-16 md:px-6">
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </Button>

        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="font-playfair text-lg italic text-foreground">Ótica</span>
          <span className="text-lg font-light text-text-muted">Manager</span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-ui-md transition-colors",
                  active
                    ? "text-foreground underline decoration-1 underline-offset-4"
                    : "text-text-muted hover:text-text-secondary"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <p className="text-foreground">{user?.name ?? "—"}</p>
              <p className="text-body-sm font-normal text-text-muted">{user?.email}</p>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout.mutate()}>Sair</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
