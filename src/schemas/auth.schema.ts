import { z } from "zod"

export const loginSchema = z.object({
  tenantSlug: z.string().min(1, "Informe o identificador da ótica"),
  email: z.email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
})

export type LoginFormValues = z.infer<typeof loginSchema>
