import { z } from "zod"

export const roleOptions = ["employee", "admin"] as const

export const createUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255),
  email: z.email("E-mail inválido"),
  password: z.string().min(8, "Mínimo de 8 caracteres").max(100),
  role: z.enum(roleOptions),
})
export type CreateUserFormValues = z.infer<typeof createUserSchema>

export const editUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255),
  email: z.email("E-mail inválido"),
  role: z.enum(roleOptions),
  isActive: z.boolean(),
  password: z.union([z.string().min(8, "Mínimo de 8 caracteres").max(100), z.literal("")]),
})
export type EditUserFormValues = z.infer<typeof editUserSchema>
