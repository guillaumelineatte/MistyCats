import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SessionProvider } from "@/components/admin/session-provider"
import { Toaster } from "@/components/ui/sonner"
import { AccountNav } from "@/components/account-nav"
import { EmailVerificationBanner } from "@/components/email-verification-banner"

export default async function MonCompteLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/mon-compte")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, emailVerified: true },
  })

  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        {/* Header minimal */}
        <header className="border-b border-border py-5 px-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/" className="group">
              <span className="text-xl tracking-[0.3em] uppercase font-light transition-all duration-300 group-hover:tracking-[0.4em]">
                Misty Cats
              </span>
            </Link>
            <span className="text-xs tracking-widest uppercase text-muted-foreground">
              Mon compte
            </span>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-12">
            {/* Navigation latérale */}
            <AccountNav />

            {/* Contenu principal */}
            <main>
              {user && !user.emailVerified && <EmailVerificationBanner email={user.email} />}
              {children}
            </main>
          </div>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </SessionProvider>
  )
}
