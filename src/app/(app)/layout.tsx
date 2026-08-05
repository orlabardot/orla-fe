"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { authStorage } from "@/lib/auth-storage"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    if (authStorage.getToken()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- guard de auth: só corre uma vez no mount, lê localStorage (indisponível no SSR)
      setAuthorized(true)
    } else {
      router.replace("/login")
    }
  }, [router])

  if (!authorized) return null

  return <AppLayout>{children}</AppLayout>
}
