import { z } from "zod"

export const contactSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  subject: z.string().optional(),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
})

export type ContactInput = z.infer<typeof contactSchema>

export const customRequestSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  description: z.string().min(10, "Décrivez votre demande en quelques mots de plus"),
  budget: z.string().optional(),
})

export type CustomRequestInput = z.infer<typeof customRequestSchema>
