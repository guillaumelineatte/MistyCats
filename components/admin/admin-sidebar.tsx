"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { LayoutList, LogOut, ExternalLink, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/admin/articles", label: "Articles", icon: LayoutList },
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
        <Link
          href="/admin/articles"
          className="font-serif text-lg tracking-widest text-sidebar-foreground uppercase"
          onClick={onClose}
        >
          Misty Cats
          <span className="ml-2 text-xs tracking-wider text-muted-foreground uppercase">Admin</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Pied de sidebar */}
      <div className="border-t border-sidebar-border px-3 py-4 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          Voir le site
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 px-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Déconnexion
        </Button>
      </div>
    </div>
  )
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Sidebar desktop — toujours visible */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-60 flex-col bg-sidebar border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Header mobile */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between bg-sidebar border-b border-sidebar-border px-4">
        <Link href="/admin/articles" className="font-serif text-lg tracking-widest text-sidebar-foreground uppercase">
          Misty Cats
          <span className="ml-2 text-xs tracking-wider text-muted-foreground uppercase">Admin</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-sidebar-foreground hover:text-foreground p-1"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Drawer mobile */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border flex flex-col animate-in slide-in-from-left duration-200">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}
    </>
  )
}
