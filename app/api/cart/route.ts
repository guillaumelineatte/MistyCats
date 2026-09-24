import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOrCreateCart } from "@/lib/cart-session"

// GET /api/cart — panier courant avec les pièces réservées.
export async function GET() {
  const cart = await getOrCreateCart()

  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    orderBy: { createdAt: "asc" },
    include: {
      article: {
        include: {
          category: { select: { name: true } },
          images: { orderBy: { position: "asc" }, take: 1 },
        },
      },
    },
  })

  return NextResponse.json({
    items: items.map((item) => ({
      articleId: item.articleId,
      reservedUntil: item.reservedUntil,
      article: {
        title: item.article.title,
        slug: item.article.slug,
        priceCents: item.article.priceCents,
        categoryName: item.article.category.name,
        image: item.article.images[0]?.url ?? null,
      },
    })),
  })
}
