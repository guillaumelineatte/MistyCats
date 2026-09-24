import { cookies } from "next/headers"
import crypto from "crypto"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const CART_COOKIE = "cart_token"
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 jours

/**
 * Résout le panier courant : celui de l'utilisateur connecté, ou un panier
 * anonyme identifié par un cookie httpOnly (créé au besoin). À appeler
 * uniquement depuis une route handler (seul contexte où on peut poser un
 * cookie sur la réponse).
 */
export async function getOrCreateCart() {
  const session = await auth()

  if (session?.user?.id) {
    return prisma.cart.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id },
      update: {},
    })
  }

  const jar = await cookies()
  const token = jar.get(CART_COOKIE)?.value

  if (token) {
    const existing = await prisma.cart.findUnique({ where: { anonToken: token } })
    if (existing) return existing
  }

  const newToken = crypto.randomBytes(24).toString("hex")
  const cart = await prisma.cart.create({ data: { anonToken: newToken } })
  jar.set(CART_COOKIE, newToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: CART_COOKIE_MAX_AGE,
    path: "/",
  })
  return cart
}

export async function getAnonCartToken() {
  const jar = await cookies()
  return jar.get(CART_COOKIE)?.value ?? null
}

export async function clearAnonCartCookie() {
  const jar = await cookies()
  jar.delete(CART_COOKIE)
}
