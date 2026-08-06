"use client"

import { AdminNav } from "@/components/layout/admin-nav"
import { useRequireAuth } from "@/hooks/use-auth"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authorized = useRequireAuth({ role: "admin" })

  if (!authorized) return null

  return (
    <div className="px-4 py-6 md:px-6 md:py-8">
      <AdminNav />
      <div className="mt-6">{children}</div>
    </div>
  )
}
