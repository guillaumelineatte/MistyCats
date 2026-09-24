"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { User, KeyRound, Package, MapPin, ShieldCheck, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/mon-compte", label: "Tableau de bord", icon: null, exact: true },
  { href: "/mon-compte/profil", label: "Mon profil", icon: User },
  { href: "/mon-compte/adresses", label: "Mes adresses", icon: MapPin },
  { href: "/mon-compte/mot-de-passe", label: "Mot de passe", icon: KeyRound },
  { href: "/mon-compte/commandes", label: "Commandes", icon: Package },
  { href: "/mon-compte/confidentialite", label: "Confidentialité", icon: ShieldCheck },
]

export function AccountNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)

        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm transition-colors",
              isActive ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
            <span>{item.label}</span>
          </Link>
        )
      })}

      <div className="pt-4 mt-4 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span>Se déconnecter</span>
        </button>
      </div>
    </nav>
  )
}
