import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { resetPasswordSchema } from "@/lib/validations/auth"
import { consumeVerificationToken } from "@/lib/verification-tokens"
import { sendPasswordChangedEmail } from "@/lib/email"
import { isPasswordPwned } from "@/lib/pwned-password"
import { logAuthEvent } from "@/lib/auth-log"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token, ...rest } = body

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token manquant" }, { status: 400 })
    }

    const result = resetPasswordSchema.safeParse(rest)
    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides", details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    if (await isPasswordPwned(result.data.password)) {
      return NextResponse.json(
        {
          error:
            "Ce mot de passe a été exposé dans une fuite de données connue. Choisissez-en un autre pour votre sécurité.",
        },
        { status: 400 }
      )
    }

    const userId = await consumeVerificationToken(token, "PASSWORD_RESET")
    if (!userId) {
      return NextResponse.json(
        { error: "Ce lien est invalide ou a expiré. Veuillez en demander un nouveau." },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(result.data.password, 12)

    const user = await prisma.user.update({
      where: { id: userId },
      data: { passwordHash, tokenVersion: { increment: 1 } },
    })

    logAuthEvent("password_reset_completed", { userId })
    await sendPasswordChangedEmail(user.email)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
