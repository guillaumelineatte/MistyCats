import "dotenv/config"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { prisma } from "./prisma"
import { reserveArticleForCart, markArticleSold, releaseExpiredReservations, RESERVATION_MS } from "./inventory"

// Exécuté contre la vraie base Neon (aucune base de test dédiée dans ce projet) :
// toutes les données créées ici sont nettoyées dans afterAll.
describe("inventory — pièce unique", () => {
  let categoryId: string
  let articleId: string
  let cartAId: string
  let cartBId: string

  beforeAll(async () => {
    const category = await prisma.category.create({
      data: { slug: `test-cat-${Date.now()}`, name: "Catégorie de test" },
    })
    categoryId = category.id

    const article = await prisma.article.create({
      data: {
        slug: `test-article-${Date.now()}`,
        sku: `TEST-${Date.now()}`,
        title: "Pièce de test",
        shortDescription: "Pièce de test",
        description: "Pièce de test",
        priceCents: 1000,
        categoryId,
        status: "ONLINE",
      },
    })
    articleId = article.id

    const cartA = await prisma.cart.create({ data: { anonToken: `test-cart-a-${Date.now()}` } })
    const cartB = await prisma.cart.create({ data: { anonToken: `test-cart-b-${Date.now()}` } })
    cartAId = cartA.id
    cartBId = cartB.id
  })

  afterAll(async () => {
    await prisma.cartItem.deleteMany({ where: { articleId } })
    await prisma.article.deleteMany({ where: { id: articleId } })
    await prisma.cart.deleteMany({ where: { id: { in: [cartAId, cartBId] } } })
    await prisma.category.deleteMany({ where: { id: categoryId } })
    await prisma.$disconnect()
  })

  it("deux réservations concurrentes de la même pièce : une seule gagne", async () => {
    const [resultA, resultB] = await Promise.all([
      reserveArticleForCart(cartAId, articleId),
      reserveArticleForCart(cartBId, articleId),
    ])

    const successes = [resultA, resultB].filter((r) => r.ok)
    const failures = [resultA, resultB].filter((r) => !r.ok)

    expect(successes).toHaveLength(1)
    expect(failures).toHaveLength(1)
    expect(failures[0]).toMatchObject({ ok: false, reason: "unavailable" })

    const article = await prisma.article.findUniqueOrThrow({ where: { id: articleId } })
    expect(article.status).toBe("RESERVED")

    const items = await prisma.cartItem.findMany({ where: { articleId } })
    expect(items).toHaveLength(1)
  })

  it("deux achats concurrents de la même pièce réservée : un seul gagne", async () => {
    // La pièce est RESERVED depuis le test précédent (réservée par cartA ou cartB).
    const before = await prisma.article.findUniqueOrThrow({ where: { id: articleId } })
    expect(before.status).toBe("RESERVED")

    const [saleA, saleB] = await Promise.all([
      prisma.$transaction((tx) => markArticleSold(tx, articleId)),
      prisma.$transaction((tx) => markArticleSold(tx, articleId)),
    ])

    const successes = [saleA, saleB].filter((r) => r.ok)
    const failures = [saleA, saleB].filter((r) => !r.ok)

    expect(successes).toHaveLength(1)
    expect(failures).toHaveLength(1)
    expect(failures[0]).toMatchObject({ ok: false, reason: "unavailable" })

    const article = await prisma.article.findUniqueOrThrow({ where: { id: articleId } })
    expect(article.status).toBe("SOLD")

    const items = await prisma.cartItem.findMany({ where: { articleId } })
    expect(items).toHaveLength(0)

    // Remet la pièce en ligne pour rendre les tests suivants indépendants de l'ordre.
    await prisma.article.update({ where: { id: articleId }, data: { status: "ONLINE" } })
  })

  it("une réservation expirée est libérée par le cron", async () => {
    await prisma.article.update({
      where: { id: articleId },
      data: { status: "RESERVED", reservedUntil: new Date(Date.now() - RESERVATION_MS) },
    })
    await prisma.cartItem.upsert({
      where: { articleId },
      create: { cartId: cartAId, articleId, reservedUntil: new Date(Date.now() - RESERVATION_MS) },
      update: { reservedUntil: new Date(Date.now() - RESERVATION_MS) },
    })

    const released = await releaseExpiredReservations()
    expect(released).toBeGreaterThanOrEqual(1)

    const article = await prisma.article.findUniqueOrThrow({ where: { id: articleId } })
    expect(article.status).toBe("ONLINE")
    expect(article.reservedUntil).toBeNull()

    const items = await prisma.cartItem.findMany({ where: { articleId } })
    expect(items).toHaveLength(0)
  })
})
