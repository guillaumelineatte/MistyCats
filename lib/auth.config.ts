import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login", // page de connexion utilisateur
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
        token.name = user.name
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.name = token.name as string | null
      }
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
