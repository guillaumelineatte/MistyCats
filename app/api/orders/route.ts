import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getOrCreateCart } from "@/lib/cart-session"
import { checkoutSchema } from "@/lib/validations/checkout"
import { generateOrderNumber } from "@/lib/order-number"
import { paymentProvider } from "@/lib/payment/mock-payment"
import { siteConfig } from "@/lib/site-config"
import { parseEuroDisplayToCents } from "@/lib/money"

// POST /api/orders — crée la commande (PENDING_PAYMENT) à partir du panier
// courant. Ne confirme jamais la commande : le paiement (mock) et son webhook
// s'en chargent séparément.
export async function POST(req: Request) {
  const session = await auth()

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true },
    })
    if (!user?.emailVerified) {
      return NextResponse.json(
        { error: "Confirmez votre adresse email avant de passer commande." },
        { status: 403 }
      )
    }
  }

  const body = await req.json().catch(() => null)
  const result = checkoutSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: "Données invalides", details: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const shippingMethod = siteConfig.shipping.methods.find(
    (m) => m.label === result.data.shippingMethodLabel
  )
  if (!shippingMethod) {
    return NextResponse.json({ error: "Mode de livraison invalide" }, { status: 400 })
  }

  const cart = await getOrCreateCart()
  const cartItems = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { article: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
  })

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "Votre panier est vide." }, { status: 400 })
  }

  const now = new Date()
  const unavailable = cartItems.filter(
    (item) => item.article.status !== "RESERVED" || item.reservedUntil < now
  )
  if (unavailable.length > 0) {
    return NextResponse.json(
      {
        error: "Certaines pièces de votre panier ne sont plus disponibles.",
        unavailable: unavailable.map((i) => i.article.title),
      },
      { status: 409 }
    )
  }

  const subtotalCents = cartItems.reduce((sum, item) => sum + item.article.priceCents, 0)
  const shippingCents = parseEuroDisplayToCents(shippingMethod.price)
  const totalCents = subtotalCents + shippingCents

  const order = await prisma.$transaction(async (tx) => {
    const number = await generateOrderNumber(tx)

    return tx.order.create({
      data: {
        number,
        userId: session?.user?.id ?? null,
        email: result.data.email,
        shippingAddress: result.data.shippingAddress,
        billingAddress: result.data.billingAddress,
        shippingMethod: `${shippingMethod.label} (${shippingMethod.delay})`,
        subtotalCents,
        shippingCents,
        totalCents,
        items: {
          create: cartItems.map((item) => ({
            articleId: item.article.id,
            titleSnapshot: item.article.title,
            skuSnapshot: item.article.sku,
            priceCentsSnapshot: item.article.priceCents,
            imageSnapshot: item.article.images[0]?.url ?? null,
          })),
        },
      },
    })
  })

  const intent = await paymentProvider.createIntent({
    orderId: order.id,
    amountCents: totalCents,
    currency: "EUR",
  })

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.number,
    totalCents,
    transactionRef: intent.transactionRef,
  })
}
