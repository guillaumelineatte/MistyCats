import { NextResponse } from "next/server"
import { getOrCreateCart } from "@/lib/cart-session"
import { releaseReservation } from "@/lib/inventory"

// DELETE /api/cart/items/:articleId — retire une pièce du panier courant et la libère.
export async function DELETE(_req: Request, { params }: { params: Promise<{ articleId: string }> }) {
  const { articleId } = await params
  const cart = await getOrCreateCart()

  await releaseReservation(articleId, cart.id)

  return NextResponse.json({ success: true })
}
