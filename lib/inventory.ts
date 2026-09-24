import { prisma } from "@/lib/prisma"
import type { Prisma, ArticleStatus } from "@prisma/client"

export const RESERVATION_MS = 30 * 60 * 1000 // 30 minutes

type TxClient = Prisma.TransactionClient

export type ReserveResult =
  | { ok: true; reservedUntil: Date }
  | { ok: false; reason: "not_found" | "unavailable" }

/**
 * Réserve une pièce unique pour un panier. Verrouille la ligne Article
 * (SELECT ... FOR UPDATE) pour la durée de la transaction : deux réservations
 * concurrentes de la même pièce ne peuvent jamais toutes les deux réussir —
 * voir lib/inventory.test.ts pour le test de concurrence.
 *
 * Un re-ajout par le panier qui détient déjà la pièce prolonge simplement la
 * réservation. Une réservation expirée (reservedUntil dépassé) est récupérable
 * immédiatement, sans attendre le passage du cron de libération.
 */
export async function reserveArticleForCart(cartId: string, articleId: string): Promise<ReserveResult> {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<{ id: string; status: ArticleStatus; reservedUntil: Date | null }[]>`
      SELECT id, status, "reservedUntil" FROM "Article" WHERE id = ${articleId} FOR UPDATE
    `
    const article = rows[0]
    if (!article) return { ok: false, reason: "not_found" }

    const now = new Date()
    const reservationExpired =
      article.status === "RESERVED" && article.reservedUntil !== null && article.reservedUntil < now

    if (article.status !== "ONLINE" && !reservationExpired) {
      const existing = await tx.cartItem.findUnique({ where: { articleId } })
      if (existing && existing.cartId === cartId) {
        const reservedUntil = new Date(now.getTime() + RESERVATION_MS)
        await tx.article.update({ where: { id: articleId }, data: { reservedUntil } })
        await tx.cartItem.update({ where: { articleId }, data: { reservedUntil } })
        return { ok: true, reservedUntil }
      }
      return { ok: false, reason: "unavailable" }
    }

    const reservedUntil = new Date(now.getTime() + RESERVATION_MS)
    await tx.article.update({
      where: { id: articleId },
      data: { status: "RESERVED", reservedUntil },
    })
    await tx.cartItem.upsert({
      where: { articleId },
      create: { cartId, articleId, reservedUntil },
      update: { cartId, reservedUntil },
    })

    return { ok: true, reservedUntil }
  })
}

/** Libère une réservation. Si `cartId` est fourni, ne libère que si ce panier en est propriétaire. */
export async function releaseReservation(articleId: string, cartId?: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const item = await tx.cartItem.findUnique({ where: { articleId } })
    if (!item) return
    if (cartId && item.cartId !== cartId) return

    await tx.cartItem.delete({ where: { articleId } })
    await tx.article.updateMany({
      where: { id: articleId, status: "RESERVED" },
      data: { status: "ONLINE", reservedUntil: null },
    })
  })
}

/** Cron : libère toute réservation expirée. Idempotent, retourne le nombre de pièces libérées. */
export async function releaseExpiredReservations(): Promise<number> {
  const now = new Date()
  const expired = await prisma.article.findMany({
    where: { status: "RESERVED", reservedUntil: { lt: now } },
    select: { id: true },
  })

  for (const { id } of expired) {
    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { articleId: id } })
      await tx.article.updateMany({
        where: { id, status: "RESERVED", reservedUntil: { lt: now } },
        data: { status: "ONLINE", reservedUntil: null },
      })
    })
  }

  return expired.length
}

export type PurchaseResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "unavailable" }

/**
 * Marque une pièce comme vendue. À appeler à l'intérieur d'une transaction
 * (le webhook de paiement, phase 5) qui verrouille déjà la ligne Article via
 * `SELECT ... FOR UPDATE` — voir lib/inventory.test.ts pour le test de
 * concurrence sur cette étape.
 */
export async function markArticleSold(tx: TxClient, articleId: string): Promise<PurchaseResult> {
  const rows = await tx.$queryRaw<{ id: string; status: ArticleStatus }[]>`
    SELECT id, status FROM "Article" WHERE id = ${articleId} FOR UPDATE
  `
  const article = rows[0]
  if (!article) return { ok: false, reason: "not_found" }
  if (article.status !== "RESERVED" && article.status !== "ONLINE") {
    return { ok: false, reason: "unavailable" }
  }

  await tx.cartItem.deleteMany({ where: { articleId } })
  await tx.article.update({
    where: { id: articleId },
    data: { status: "SOLD", reservedUntil: null },
  })

  return { ok: true }
}
