import { z } from "zod"
import { addressSchema } from "./auth"

export const checkoutSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  shippingMethodLabel: z.string().min(1, "Choisissez un mode de livraison"),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
