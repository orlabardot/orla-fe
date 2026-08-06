"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { useRequireAuth } from "@/hooks/use-auth"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authorized = useRequireAuth()

  if (!authorized) return null

  return <AppLayout>{children}</AppLayout>
}
