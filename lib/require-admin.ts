import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import type { Session } from "next-auth"

/**
 * Défense en profondeur : proxy.ts protège déjà les pages /admin/*, mais les
 * routes API (/api/articles, /api/drops, …) n'y sont PAS soumises — seul ce
 * helper, appelé en tête de chaque route/Server Action admin, empêche un
 * compte CUSTOMER authentifié d'agir dessus.
 *
 * Usage :
 *   const check = await requireAdmin()
 *   if ("error" in check) return check.error
 *   const { session } = check
 */
export async function requireAdmin(): Promise<{ session: Session } | { error: NextResponse }> {
  const session = await auth()
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Non autorisé" }, { status: 401 }) }
  }
  if (session.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Réservé à l'administration" }, { status: 403 }) }
  }
  return { session }
}
