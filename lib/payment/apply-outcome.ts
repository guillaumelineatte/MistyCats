import { prisma } from "@/lib/prisma"
import { markArticleSold } from "@/lib/inventory"
import { sendOrderConfirmationEmail } from "@/lib/email"
import type { WebhookEvent } from "./types"

/**
 * Logique de confirmation de commande, indépendante du prestataire — c'est le
 * SEUL endroit qui fait passer une commande à PAID. Idempotent : un webhook
 * rejoué (même transactionRef) sur un paiement déjà traité est un no-op.
 */
export async function applyPaymentOutcome(event: WebhookEvent): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { transactionRef: event.transactionRef },
    include: { order: { include: { items: true } } },
  })
  if (!payment) return // référence inconnue : on ignore silencieusement (idempotence)
  if (payment.status !== "PENDING") return // déjà traité

  if (event.outcome === "failed") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", rawPayload: { failureReason: event.failureReason ?? null } },
    })
    return
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const item of payment.order.items) {
        if (!item.articleId) continue
        const result = await markArticleSold(tx, item.articleId)
        if (!result.ok) {
          throw new Error(`Pièce ${item.articleId} indisponible à la confirmation (${result.reason})`)
        }
      }

      await tx.payment.update({ where: { id: payment.id }, data: { status: "SUCCEEDED" } })
      await tx.order.update({ where: { id: payment.orderId }, data: { status: "PAID" } })
    })
  } catch (err) {
    // Rarissime : une pièce est devenue indisponible entre la création de la
    // commande et la confirmation du paiement (ex. archivée manuellement).
    // Le paiement encaissé côté mock doit être traité comme un échec, pas
    // rester bloqué en PENDING indéfiniment.
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", rawPayload: { error: err instanceof Error ? err.message : "unknown" } },
    })
    return
  }

  await sendOrderConfirmationEmail(payment.order.email, {
    number: payment.order.number,
    items: payment.order.items.map((i) => ({
      titleSnapshot: i.titleSnapshot,
      priceCentsSnapshot: i.priceCentsSnapshot,
    })),
    totalCents: payment.order.totalCents,
  })
}
