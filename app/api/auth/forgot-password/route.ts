import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { forgotPasswordSchema } from "@/lib/validations/auth"
import { sendPasswordResetEmail } from "@/lib/email"
import { createVerificationToken } from "@/lib/verification-tokens"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { logAuthEvent } from "@/lib/auth-log"

const RESET_TTL_MS = 60 * 60 * 1000 // 1 heure

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = forgotPasswordSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 })
    }

    const { email } = result.data
    const ip = getClientIp(req)

    const [ipOk, emailOk] = await Promise.all([
      checkRateLimit(`forgot-password:ip:${ip}`, { max: 10, windowSeconds: 3600 }),
      checkRateLimit(`forgot-password:email:${email}`, { max: 3, windowSeconds: 3600 }),
    ])

    const user = ipOk && emailOk ? await prisma.user.findUnique({ where: { email } }) : null

    // Répondre toujours avec succès pour éviter l'énumération des emails
    // (et ne rien laisser fuiter sur un éventuel rate limit dépassé).
    if (!user) {
      return NextResponse.json({ success: true })
    }

    const token = await createVerificationToken(user.id, "PASSWORD_RESET", RESET_TTL_MS)
    await sendPasswordResetEmail(email, token)
    logAuthEvent("password_reset_requested", { email, ip, userId: user.id })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
