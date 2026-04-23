import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (req.auth?.user as any)?.role as string | undefined

  // Protéger /admin/* — réserver aux admins (sauf la page de login admin)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!isLoggedIn || role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", req.nextUrl))
    }
  }

  // Protéger /mon-compte/* — requiert d'être connecté
  if (pathname.startsWith("/mon-compte")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.nextUrl)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Rediriger les utilisateurs déjà connectés hors des pages auth utilisateur
  if (isLoggedIn && (pathname === "/login" || pathname === "/inscription")) {
    return NextResponse.redirect(
      new URL(role === "ADMIN" ? "/admin/articles" : "/mon-compte", req.nextUrl)
    )
  }

  // Rediriger les admins déjà connectés hors de la page login admin
  if (isLoggedIn && pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin/articles", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/mon-compte/:path*", "/login", "/inscription"],
}
