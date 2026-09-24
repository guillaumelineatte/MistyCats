import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAnonCartToken, clearAnonCartCookie } from "@/lib/cart-session"

// POST /api/cart/merge — fusionne le panier anonyme (cookie) dans le panier de
// l'utilisateur qui vient de se connecter. À appeler juste après signIn().
// CartItem.articleId est unique : si la même pièce est aussi (improbablement)
// déjà réservée par le panier utilisateur, l'item anonyme est simplement
// abandonné plutôt que de provoquer une erreur de contrainte.
export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const anonToken = await getAnonCartToken()
  if (!anonToken) {
    return NextResponse.json({ success: true, merged: 0 })
  }

  const anonCart = await prisma.cart.findUnique({
    where: { anonToken },
    include: { items: true },
  })

  if (!anonCart) {
    await clearAnonCartCookie()
    return NextResponse.json({ success: true, merged: 0 })
  }

  const userCart = await prisma.cart.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  })

  let merged = 0
  for (const item of anonCart.items) {
    try {
      await prisma.cartItem.update({
        where: { articleId: item.articleId },
        data: { cartId: userCart.id },
      })
      merged++
    } catch {
      // Pièce déjà présente dans le panier utilisateur (contrainte unique) : on l'ignore.
    }
  }

  await prisma.cart.delete({ where: { id: anonCart.id } })
  await clearAnonCartCookie()

  return NextResponse.json({ success: true, merged })
}
