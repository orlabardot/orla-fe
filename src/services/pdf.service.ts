import { api } from "@/lib/axios"
import type { GeneratePdfBody } from "@/types/api"

export async function generatePdf({ variantIds, clientName }: GeneratePdfBody) {
  const response = await api.post("/pdf/generate", { variantIds, clientName }, {
    responseType: "blob",
  })

  const blob = new Blob([response.data], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  const date = new Date().toISOString().split("T")[0]
  const name = clientName ? clientName.replace(/\s+/g, "-").toLowerCase() : "catalogo"

  link.href = url
  link.download = `${name}-${date}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
