"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const links = [
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/marcas", label: "Marcas" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/tags", label: "Tags" },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-5 border-b border-border">
      {links.map((link) => {
        const active = pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "border-b-2 pb-3 text-ui-md transition-colors",
              active
                ? "border-brand text-foreground"
                : "border-transparent text-text-muted hover:text-text-secondary"
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
