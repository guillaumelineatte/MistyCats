import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { trackingSchema } from "@/lib/validations/tracking"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

const NOT_FOUND_MESSAGE = "Aucune commande trouvée avec ce numéro et cet email."

// POST /api/tracking — suivi public (numéro de commande + email, sans connexion).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const result = trackingSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 })
  }

  const ip = getClientIp(req)
  const ok = await checkRateLimit(`tracking:ip:${ip}`, { max: 20, windowSeconds: 3600 })
  if (!ok) {
    return NextResponse.json({ error: "Trop de tentatives, réessayez plus tard." }, { status: 429 })
  }

  const order = await prisma.order.findFirst({
    where: { number: result.data.number.trim(), email: { equals: result.data.email.trim(), mode: "insensitive" } },
    include: {
      shipment: { include: { events: { orderBy: { occurredAt: "asc" } } } },
    },
  })

  if (!order) {
    return NextResponse.json({ error: NOT_FOUND_MESSAGE }, { status: 404 })
  }

  return NextResponse.json({
    number: order.number,
    status: order.status,
    createdAt: order.createdAt,
    shipment: order.shipment
      ? {
          carrier: order.shipment.carrier,
          trackingNumber: order.shipment.trackingNumber,
          estimatedDeliveryAt: order.shipment.estimatedDeliveryAt,
          deliveredAt: order.shipment.deliveredAt,
          events: order.shipment.events.map((e) => ({
            status: e.status,
            label: e.label,
            location: e.location,
            occurredAt: e.occurredAt,
          })),
        }
      : null,
  })
}
