import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAuthEvent } from "@/lib/auth-log"

const schema = z.object({ password: z.string().min(1) })

// POST /api/user/delete — suppression RGPD du compte. Les commandes sont
// anonymisées (userId détaché) plutôt que supprimées, pour l'intégrité
// comptable — voir PROJECT.md. Adresses, panier, tokens : supprimés en
// cascade par le schéma. Messages de contact/sur-mesure : détachés (SetNull).
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Mot de passe requis" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const valid = await bcrypt.compare(result.data.password, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 400 })
  }

  await prisma.$transaction([
    prisma.order.updateMany({ where: { userId: user.id }, data: { userId: null } }),
    prisma.user.delete({ where: { id: user.id } }),
  ])

  logAuthEvent("account_deleted", { userId: user.id })

  return NextResponse.json({ success: true })
}
