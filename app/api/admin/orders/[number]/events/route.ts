import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"
import { shipmentEventSchema } from "@/lib/validations/order-admin"

// POST /api/admin/orders/:number/events — ajout manuel d'un événement de suivi.
export async function POST(req: NextRequest, { params }: { params: Promise<{ number: string }> }) {
  const check = await requireAdmin()
  if ("error" in check) return check.error

  const { number } = await params
  const body = await req.json()
  const parsed = shipmentEventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 422 })
  }

  const order = await prisma.order.findUnique({ where: { number }, include: { shipment: true } })
  if (!order?.shipment) return NextResponse.json({ error: "Aucune expédition associée" }, { status: 409 })

  const event = await prisma.shipmentEvent.create({
    data: {
      shipmentId: order.shipment.id,
      status: parsed.data.status,
      label: parsed.data.label,
      location: parsed.data.location || null,
    },
  })

  return NextResponse.json(event, { status: 201 })
}
