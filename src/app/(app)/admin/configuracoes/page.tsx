"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { getApiErrorMessage } from "@/lib/api-error"
import { getTenantSettings, updateTenantSettings } from "@/services/tenant.service"

export default function ConfiguracoesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["tenant-settings"],
    queryFn: getTenantSettings,
  })
  const [whatsappPhone, setWhatsappPhone] = useState("")

  useEffect(() => {
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- pré-preenche o form quando os dados chegam da API
      setWhatsappPhone(data.whatsappPhone ?? "")
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: () => updateTenantSettings(whatsappPhone),
    onSuccess: () => toast.success("Configurações salvas com sucesso"),
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  return (
    <div>
      <h1 className="font-playfair text-display-sm text-foreground">Configurações</h1>

      <div className="mt-6 max-w-md space-y-4">
        {isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              mutation.mutate()
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="whatsappPhone">Telefone do WhatsApp</Label>
              <Input
                id="whatsappPhone"
                placeholder="5511999998888"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
              />
              <p className="text-body-sm text-text-muted">
                Só números, com código do país e DDD (ex: 5511999998888). É pra onde o cliente é
                direcionado ao finalizar um pedido no catálogo.
              </p>
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
