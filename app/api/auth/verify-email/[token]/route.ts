import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { consumeVerificationToken } from "@/lib/verification-tokens"
import { logAuthEvent } from "@/lib/auth-log"

// GET /api/auth/verify-email/:token — lien cliqué depuis l'email, redirige vers /login.
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const userId = await consumeVerificationToken(token, "EMAIL_VERIFY")

  const url = req.nextUrl.clone()
  url.pathname = "/login"
  url.search = ""

  if (!userId) {
    url.searchParams.set("verification", "invalid")
    return NextResponse.redirect(url)
  }

  await prisma.user.update({ where: { id: userId }, data: { emailVerified: new Date() } })
  logAuthEvent("email_verified", { userId })

  url.searchParams.set("verification", "success")
  return NextResponse.redirect(url)
}
