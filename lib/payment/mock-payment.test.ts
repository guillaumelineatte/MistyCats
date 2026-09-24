import "dotenv/config"
import crypto from "crypto"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { prisma } from "../prisma"
import { paymentProvider } from "./mock-payment"

function sign(rawBody: string) {
  return crypto.createHmac("sha256", process.env.PAYMENT_WEBHOOK_SECRET!).update(rawBody).digest("hex")
}

describe("MockPaymentProvider", () => {
  let orderId: string

  beforeAll(async () => {
    const order = await prisma.order.create({
      data: {
        number: `TEST-PAY-${Date.now()}`,
        email: "test@example.com",
        shippingAddress: {},
        billingAddress: {},
        shippingMethod: "Test",
        subtotalCents: 1000,
        shippingCents: 0,
        totalCents: 1000,
      },
    })
    orderId = order.id
  })

  afterAll(async () => {
    await prisma.payment.deleteMany({ where: { orderId } })
    await prisma.order.deleteMany({ where: { id: orderId } })
    await prisma.$disconnect()
  })

  it("createIntent crée un Payment PENDING avec une référence unique", async () => {
    const intent = await paymentProvider.createIntent({ orderId, amountCents: 1000, currency: "EUR" })
    expect(intent.transactionRef).toMatch(/^pi_mock_/)

    const payment = await prisma.payment.findUnique({ where: { transactionRef: intent.transactionRef } })
    expect(payment).toMatchObject({ orderId, status: "PENDING", amountCents: 1000, currency: "EUR" })
  })

  it("handleWebhook accepte une signature valide et rejette une signature invalide", () => {
    const body = JSON.stringify({ transactionRef: "pi_mock_test", outcome: "succeeded" })

    const event = paymentProvider.handleWebhook(body, sign(body))
    expect(event).toEqual({ transactionRef: "pi_mock_test", outcome: "succeeded" })

    expect(() => paymentProvider.handleWebhook(body, "wrong-signature")).toThrow(/[Ss]ignature/)
    expect(() => paymentProvider.handleWebhook(body, null)).toThrow(/[Ss]ignature/)
  })
})
