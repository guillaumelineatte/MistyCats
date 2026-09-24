import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/lib/auth.config"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { logAuthEvent } from "@/lib/auth-log"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const ip = request ? getClientIp(request) : "unknown"

        // 10 tentatives / 5 min par IP, et par email : ralentit le brute-force
        // sans pouvoir servir de déni de service sur un compte précis.
        const [ipOk, emailOk] = await Promise.all([
          checkRateLimit(`login:ip:${ip}`, { max: 10, windowSeconds: 300 }),
          checkRateLimit(`login:email:${email}`, { max: 10, windowSeconds: 300 }),
        ])
        if (!ipOk || !emailOk) {
          logAuthEvent("login_failure", { email, ip, reason: "rate_limited" })
          return null
        }

        const user = await prisma.user.findUnique({ where: { email } })

        // Même chemin (bcrypt.compare sur un hash factice) que le cas
        // "utilisateur inexistant", pour ne pas laisser fuiter par le timing
        // de réponse quels emails ont un compte.
        const passwordValid = await bcrypt.compare(
          credentials.password as string,
          user?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva"
        )

        if (!user || !passwordValid) {
          logAuthEvent("login_failure", { email, ip, reason: "invalid_credentials" })
          return null
        }

        logAuthEvent("login_success", { email, ip, userId: user.id })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tokenVersion: user.tokenVersion,
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
})
