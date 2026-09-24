import { prisma } from "@/lib/prisma"
import type { Session } from "next-auth"

/**
 * Un changement de mot de passe incrémente User.tokenVersion ; les JWT émis
 * avant restent valides côté NextAuth (JWT = stateless) mais échouent ce
 * contrôle. À appeler dans les Server Actions/routes sensibles (paiement,
 * changement d'adresse, admin…), pas dans proxy.ts qui reste volontairement
 * sans accès DB (voir PROJECT.md).
 */
export async function isSessionFresh(session: Session | null): Promise<boolean> {
  if (!session?.user?.id) return false

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tokenVersion: true },
  })

  return user !== null && user.tokenVersion === (session.user.tokenVersion ?? 0)
}
