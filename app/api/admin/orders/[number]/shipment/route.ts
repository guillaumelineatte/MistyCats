import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"
import { shipOrderSchema } from "@/lib/validations/order-admin"
import { sendOrderShippedEmail } from "@/lib/email"

// POST /api/admin/orders/:number/shipment — saisit transporteur + numéro de
// suivi, passe la commande à SHIPPED, déclenche l'email d'expédition.
export async function POST(req: NextRequest, { params }: { params: Promise<{ number: string }> }) {
  const check = await requireAdmin()
  if ("error" in check) return check.error

  const { number } = await params
  const body = await req.json()
  const parsed = shipOrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 422 })
  }

  const order = await prisma.order.findUnique({ where: { number }, include: { shipment: true } })
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 })
  if (!order.shipment) return NextResponse.json({ error: "Aucune expédition associée" }, { status: 409 })

  const { carrier, trackingNumber, estimatedDeliveryAt } = parsed.data

  await prisma.$transaction([
    prisma.shipment.update({
      where: { id: order.shipment.id },
      data: {
        carrier,
        trackingNumber,
        shippedAt: new Date(),
        estimatedDeliveryAt: estimatedDeliveryAt ? new Date(estimatedDeliveryAt) : null,
      },
    }),
    prisma.shipmentEvent.create({
      data: {
        shipmentId: order.shipment.id,
        status: "SHIPPED",
        label: `Expédiée via ${carrier}`,
      },
    }),
    prisma.order.update({ where: { id: order.id }, data: { status: "SHIPPED" } }),
  ])

  await sendOrderShippedEmail(order.email, { number: order.number, carrier, trackingNumber })

  return NextResponse.json({ success: true })
}
