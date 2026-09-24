import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import type {
  ConfirmParams,
  CreateIntentParams,
  CreateIntentResult,
  PaymentProvider,
  WebhookEvent,
} from "./types"

/**
 * Numéros de carte de test documentés (mission) — aucun autre numéro n'est
 * accepté, y compris une "vraie" carte : ceci est un paiement simulé, jamais
 * une transaction réelle.
 */
const TEST_CARDS: Record<string, { outcome: "succeeded" | "failed"; failureReason?: string; delayMs?: number }> = {
  "4242424242424242": { outcome: "succeeded" },
  "4000000000000002": { outcome: "failed", failureReason: "card_declined" },
  "4000000000009995": { outcome: "failed", failureReason: "insufficient_funds" },
  "4000000000000069": { outcome: "succeeded", delayMs: 5000 },
}

function baseUrl() {
  return process.env.AUTH_URL ?? "http://localhost:3000"
}

function sign(rawBody: string) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET
  if (!secret) throw new Error("PAYMENT_WEBHOOK_SECRET manquant")
  return crypto.createHmac("sha256", secret).update(rawBody).digest("hex")
}

class MockPaymentProvider implements PaymentProvider {
  async createIntent({ orderId, amountCents, currency }: CreateIntentParams): Promise<CreateIntentResult> {
    const transactionRef = `pi_mock_${crypto.randomBytes(16).toString("hex")}`

    await prisma.payment.create({
      data: {
        orderId,
        provider: "mock",
        status: "PENDING",
        amountCents,
        currency,
        transactionRef,
      },
    })

    return { transactionRef }
  }

  async confirm({ transactionRef, cardNumber }: ConfirmParams): Promise<void> {
    const digits = cardNumber.replace(/\s/g, "")
    const testCard = TEST_CARDS[digits] ?? { outcome: "failed" as const, failureReason: "invalid_card" }

    if (testCard.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, testCard.delayMs))
    }

    const payload: WebhookEvent = {
      transactionRef,
      outcome: testCard.outcome,
      failureReason: testCard.failureReason,
    }
    const rawBody = JSON.stringify(payload)

    // Simule un vrai prestataire : la confirmation passe par un aller-retour HTTP
    // signé vers notre propre webhook, jamais par une écriture directe en base ici.
    await fetch(`${baseUrl()}/api/payments/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mock-signature": sign(rawBody) },
      body: rawBody,
    })
  }

  async refund({ transactionRef }: { transactionRef: string }): Promise<void> {
    await prisma.payment.update({
      where: { transactionRef },
      data: { status: "REFUNDED" },
    })
  }

  handleWebhook(rawBody: string, signatureHeader: string | null): WebhookEvent {
    if (!signatureHeader || sign(rawBody) !== signatureHeader) {
      throw new Error("Signature de webhook invalide")
    }
    return JSON.parse(rawBody) as WebhookEvent
  }
}

export const paymentProvider: PaymentProvider = new MockPaymentProvider()
