import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"
import { orderStatusSchema } from "@/lib/validations/order-admin"
import { paymentProvider } from "@/lib/payment/mock-payment"
import { sendOrderDeliveredEmail } from "@/lib/email"

const EVENT_LABELS: Record<string, string> = {
  PREPARING: "En cours de préparation",
  DELIVERED: "Livrée",
}

// PATCH /api/admin/orders/:number — changement de statut (hors expédition, voir /shipment).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ number: string }> }) {
  const check = await requireAdmin()
  if ("error" in check) return check.error

  const { number } = await params
  const body = await req.json()
  const parsed = orderStatusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 422 })
  }

  const order = await prisma.order.findUnique({ where: { number }, include: { payment: true, shipment: true } })
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 })

  const { status } = parsed.data

  if (status === "REFUNDED") {
    if (order.payment?.transactionRef) {
      await paymentProvider.refund({ transactionRef: order.payment.transactionRef })
    }
    await prisma.order.update({ where: { id: order.id }, data: { status: "REFUNDED" } })
    return NextResponse.json({ success: true })
  }

  await prisma.order.update({ where: { id: order.id }, data: { status } })

  if (order.shipment && (status === "PREPARING" || status === "DELIVERED")) {
    await prisma.shipmentEvent.create({
      data: {
        shipmentId: order.shipment.id,
        status,
        label: EVENT_LABELS[status] ?? status,
      },
    })
    if (status === "DELIVERED") {
      await prisma.shipment.update({ where: { id: order.shipment.id }, data: { deliveredAt: new Date() } })
      await sendOrderDeliveredEmail(order.email, { number: order.number })
    }
  }

  return NextResponse.json({ success: true })
}
