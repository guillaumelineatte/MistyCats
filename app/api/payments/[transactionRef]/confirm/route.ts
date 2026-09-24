import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { paymentProvider } from "@/lib/payment/mock-payment"

const schema = z.object({ cardNumber: z.string().min(1) })

// POST /api/payments/:transactionRef/confirm — déclenche le paiement simulé
// depuis l'écran de paiement. Ne confirme jamais la commande elle-même : ça
// passe toujours par /api/payments/webhook, appelé en interne par le provider.
export async function POST(req: Request, { params }: { params: Promise<{ transactionRef: string }> }) {
  const { transactionRef } = await params
  const body = await req.json().catch(() => null)
  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Numéro de carte requis" }, { status: 400 })
  }

  const payment = await prisma.payment.findUnique({ where: { transactionRef } })
  if (!payment) {
    return NextResponse.json({ error: "Paiement introuvable" }, { status: 404 })
  }
  if (payment.status !== "PENDING") {
    return NextResponse.json({ error: "Ce paiement a déjà été traité" }, { status: 409 })
  }

  await paymentProvider.confirm({ transactionRef, cardNumber: result.data.cardNumber })

  const updated = await prisma.payment.findUnique({
    where: { transactionRef },
    include: { order: { select: { number: true } } },
  })

  if (updated?.status === "SUCCEEDED") {
    return NextResponse.json({ success: true, orderNumber: updated.order.number })
  }

  const reason = (updated?.rawPayload as { failureReason?: string } | null)?.failureReason
  const messages: Record<string, string> = {
    card_declined: "Carte refusée.",
    insufficient_funds: "Fonds insuffisants.",
    invalid_card: "Numéro de carte de test non reconnu.",
  }
  return NextResponse.json(
    { success: false, error: messages[reason ?? ""] ?? "Le paiement a échoué." },
    { status: 402 }
  )
}
