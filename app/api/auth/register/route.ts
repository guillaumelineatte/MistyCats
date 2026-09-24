import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validations/auth"
import { isPasswordPwned } from "@/lib/pwned-password"
import { createVerificationToken } from "@/lib/verification-tokens"
import { sendVerificationEmail } from "@/lib/email"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { logAuthEvent } from "@/lib/auth-log"

const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    const ipOk = await checkRateLimit(`register:ip:${ip}`, { max: 5, windowSeconds: 3600 })
    if (!ipOk) {
      return NextResponse.json({ error: "Trop de tentatives, réessayez plus tard." }, { status: 429 })
    }

    const body = await req.json()
    const result = registerSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides", details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, password } = result.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cette adresse email." },
        { status: 409 }
      )
    }

    if (await isPasswordPwned(password)) {
      return NextResponse.json(
        {
          error:
            "Ce mot de passe a été exposé dans une fuite de données connue. Choisissez-en un autre pour votre sécurité.",
        },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: "CUSTOMER" },
    })

    logAuthEvent("register", { email, ip, userId: user.id })

    const token = await createVerificationToken(user.id, "EMAIL_VERIFY", EMAIL_VERIFY_TTL_MS)
    await sendVerificationEmail(email, token)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
