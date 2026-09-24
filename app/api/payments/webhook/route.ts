import { NextResponse } from "next/server"
import { paymentProvider } from "@/lib/payment/mock-payment"
import { applyPaymentOutcome } from "@/lib/payment/apply-outcome"

// POST /api/payments/webhook — seul endroit qui confirme une commande.
// Jamais appelé directement par le client, uniquement par le provider
// (lib/payment/mock-payment.ts, en lieu et place d'un vrai prestataire).
export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get("x-mock-signature")

  let event
  try {
    event = paymentProvider.handleWebhook(rawBody, signature)
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 })
  }

  await applyPaymentOutcome(event)

  return NextResponse.json({ received: true })
}
