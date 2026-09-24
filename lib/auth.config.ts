import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login", // page de connexion utilisateur
  },
  // sameSite: "lax" + httpOnly + secure (en prod) est la stratégie CSRF de ce
  // projet : une requête state-changing cross-site ne porte jamais ce cookie
  // (seule une navigation top-level GET le fait sous "lax"). Voir PROJECT.md.
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string; tokenVersion?: number }).role
        token.name = user.name
        token.tokenVersion = (user as { tokenVersion?: number }).tokenVersion ?? 0
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.name = token.name as string | null
        session.user.tokenVersion = (token.tokenVersion as number) ?? 0
      }
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
