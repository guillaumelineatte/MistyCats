import { NextResponse } from "next/server"
import { z } from "zod"
import { getOrCreateCart } from "@/lib/cart-session"
import { reserveArticleForCart } from "@/lib/inventory"

const schema = z.object({ articleId: z.string().min(1) })

// POST /api/cart/items — réserve une pièce et l'ajoute au panier courant.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 })
  }

  const cart = await getOrCreateCart()
  const outcome = await reserveArticleForCart(cart.id, result.data.articleId)

  if (!outcome.ok) {
    const message =
      outcome.reason === "not_found"
        ? "Cette pièce n'existe pas."
        : "Cette pièce vient d'être réservée ou vendue par quelqu'un d'autre."
    return NextResponse.json({ error: message }, { status: 409 })
  }

  return NextResponse.json({ success: true, reservedUntil: outcome.reservedUntil })
}
