import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    name?: string | null
    role?: string
    tokenVersion?: number
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      role?: string
      tokenVersion?: number
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
    tokenVersion?: number
  }
}
