"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authStorage } from "@/lib/auth-storage"
import { AdminNav } from "@/components/layout/admin-nav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    if (authStorage.getUser()?.role === "admin") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- guarda de role: roda uma vez ao montar, lê localStorage
      setAuthorized(true)
    } else {
      router.replace("/")
    }
  }, [router])

  if (!authorized) return null

  return (
    <div className="px-4 py-6 md:px-6 md:py-8">
      <AdminNav />
      <div className="mt-6">{children}</div>
    </div>
  )
}
