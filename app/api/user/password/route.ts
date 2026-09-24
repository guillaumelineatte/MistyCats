import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { changePasswordSchema } from "@/lib/validations/auth"
import { isSessionFresh } from "@/lib/session-freshness"
import { isPasswordPwned } from "@/lib/pwned-password"
import { sendPasswordChangedEmail } from "@/lib/email"
import { logAuthEvent } from "@/lib/auth-log"

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!(await isSessionFresh(session))) {
    return NextResponse.json({ error: "Session expirée, reconnectez-vous." }, { status: 401 })
  }

  try {
    const body = await req.json()
    const result = changePasswordSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides", details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = result.data

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: "Le mot de passe actuel est incorrect." },
        { status: 400 }
      )
    }

    if (await isPasswordPwned(newPassword)) {
      return NextResponse.json(
        {
          error:
            "Ce mot de passe a été exposé dans une fuite de données connue. Choisissez-en un autre pour votre sécurité.",
        },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)

    // tokenVersion++ invalide les autres sessions actives de ce compte.
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, tokenVersion: { increment: 1 } },
    })

    logAuthEvent("password_changed", { userId: user.id })
    await sendPasswordChangedEmail(user.email)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
