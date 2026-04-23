import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Package, User, KeyRound, MapPin } from "lucide-react"
import Link from "next/link"

export default async function MonComptePage() {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { name: true, lastName: true, email: true, createdAt: true },
  })

  const memberSince = user?.createdAt
    ? new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(user.createdAt)
    : null

  return (
    <div className="space-y-10">
      {/* Accueil */}
      <div>
        <h2 className="text-2xl font-light tracking-wider">
          Bonjour{user?.name ? `, ${user.name}${user.lastName ? ` ${user.lastName}` : ""}` : ""}
        </h2>
        {memberSince && (
          <p className="mt-1 text-sm text-muted-foreground">
            Membre depuis {memberSince}
          </p>
        )}
      </div>

      {/* Raccourcis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/mon-compte/profil"
          className="group border border-border p-6 hover:border-foreground transition-colors"
        >
          <User className="h-5 w-5 mb-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <p className="text-sm font-medium tracking-wider uppercase">Mon profil</p>
          <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
        </Link>

        <Link
          href="/mon-compte/adresses"
          className="group border border-border p-6 hover:border-foreground transition-colors"
        >
          <MapPin className="h-5 w-5 mb-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <p className="text-sm font-medium tracking-wider uppercase">Mes adresses</p>
          <p className="text-xs text-muted-foreground mt-1">Livraison &amp; facturation</p>
        </Link>

        <Link
          href="/mon-compte/mot-de-passe"
          className="group border border-border p-6 hover:border-foreground transition-colors"
        >
          <KeyRound className="h-5 w-5 mb-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <p className="text-sm font-medium tracking-wider uppercase">Mot de passe</p>
          <p className="text-xs text-muted-foreground mt-1">Modifier</p>
        </Link>

        <Link
          href="/mon-compte/commandes"
          className="group border border-border p-6 hover:border-foreground transition-colors opacity-50 pointer-events-none"
          aria-disabled
        >
          <Package className="h-5 w-5 mb-4 text-muted-foreground" />
          <p className="text-sm font-medium tracking-wider uppercase">Mes commandes</p>
          <p className="text-xs text-muted-foreground mt-1">Bientôt disponible</p>
        </Link>
      </div>
    </div>
  )
}
