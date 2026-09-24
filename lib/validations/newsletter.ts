import { z } from "zod"

export const newsletterSubscribeSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Merci d'accepter la politique de confidentialité" }),
  }),
})

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>
