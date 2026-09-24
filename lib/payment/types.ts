/**
 * Interface neutre vis-à-vis du prestataire. Un passage à Stripe plus tard ne
 * touche que lib/payment/mock-payment.ts (et sa configuration) — jamais la
 * logique de commande, qui ne parle qu'à cette interface. Voir PROJECT.md
 * pour la liste exacte des points à modifier lors du passage à Stripe.
 */

export interface CreateIntentParams {
  orderId: string
  amountCents: number
  currency: string // ISO 4217, ex. "EUR" — même format que l'API Stripe
}

export interface CreateIntentResult {
  transactionRef: string
}

export interface ConfirmParams {
  transactionRef: string
  cardNumber: string
}

export type PaymentOutcome = "succeeded" | "failed"

export interface WebhookEvent {
  transactionRef: string
  outcome: PaymentOutcome
  failureReason?: string
}

export interface PaymentProvider {
  createIntent(params: CreateIntentParams): Promise<CreateIntentResult>
  /** Déclenche la confirmation ; le résultat arrive toujours par handleWebhook, jamais en retour direct côté commande. */
  confirm(params: ConfirmParams): Promise<void>
  refund(params: { transactionRef: string }): Promise<void>
  /** Vérifie la signature et normalise le payload reçu — spécifique au prestataire. */
  handleWebhook(rawBody: string, signatureHeader: string | null): WebhookEvent
}
