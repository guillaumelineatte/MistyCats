import { z } from "zod"

export const trackingSchema = z.object({
  number: z.string().min(1, "Le numéro de commande est requis"),
  email: z.string().email("Adresse email invalide"),
})

export type TrackingInput = z.infer<typeof trackingSchema>
