import { z } from "zod"

export const orderStatusSchema = z.object({
  status: z.enum(["PREPARING", "DELIVERED", "CANCELLED", "REFUNDED"]),
})

export const shipOrderSchema = z.object({
  carrier: z.string().min(1, "Le transporteur est requis"),
  trackingNumber: z.string().min(1, "Le numéro de suivi est requis"),
  estimatedDeliveryAt: z.string().nullable().optional(),
})

export const shipmentEventSchema = z.object({
  status: z.enum(["PREPARING", "SHIPPED", "IN_TRANSIT", "DELIVERED", "EXCEPTION"]),
  label: z.string().min(1, "Le libellé est requis"),
  location: z.string().optional(),
})
