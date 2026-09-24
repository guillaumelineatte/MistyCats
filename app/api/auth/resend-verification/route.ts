import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { createVerificationToken } from "@/lib/verification-tokens"
import { sendVerificationEmail } from "@/lib/email"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

const schema = z.object({ email: z.string().email() })
const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000

// POST /api/auth/resend-verification — toujours une réponse générique pour
// ne pas laisser deviner quels emails ont un compte ou sont déjà vérifiés.
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = schema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 })
    }

    const ip = getClientIp(req)
    const [ipOk, emailOk] = await Promise.all([
      checkRateLimit(`resend-verif:ip:${ip}`, { max: 5, windowSeconds: 3600 }),
      checkRateLimit(`resend-verif:email:${result.data.email}`, { max: 3, windowSeconds: 3600 }),
    ])
    if (!ipOk || !emailOk) {
      return NextResponse.json({ success: true })
    }

    const user = await prisma.user.findUnique({ where: { email: result.data.email } })
    if (user && !user.emailVerified) {
      const token = await createVerificationToken(user.id, "EMAIL_VERIFY", EMAIL_VERIFY_TTL_MS)
      await sendVerificationEmail(user.email, token)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
