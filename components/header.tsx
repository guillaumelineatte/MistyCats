"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Menu, X, ShoppingBag, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "#notre-histoire", label: "Notre Histoire" },
  { href: "/boutique", label: "Boutique" },
  { href: "#categories", label: "Collections" },
  { href: "#magasin", label: "Magasin" },
  { href: "#avis", label: "Avis" },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNavClick = () => {
    setIsOpen(false)
  }

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute("href")
    if (!href || !href.startsWith("#")) return

    e.preventDefault()
    setIsOpen(false)

    // Depuis une autre page : naviguer vers la homepage avec l'ancre
    if (pathname !== "/") {
      router.push(`/${href}`)
      return
    }

    // Sur la homepage : scroll fluide avec easing personnalisé
    const target = document.querySelector(href) as HTMLElement | null
    if (!target) return

    const headerHeight = scrolled ? 60 : 80
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight
    const startTop = window.scrollY
    const distance = targetTop - startTop
    const duration = Math.min(900, Math.max(500, Math.abs(distance) * 0.4))
    const startTime = performance.now()

    function easeInOutCubic(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    function step(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      window.scrollTo(0, startTop + distance * easeInOutCubic(progress))
      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled ? "bg-background/95 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-6",
      )}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <nav className="flex items-center justify-between lg:justify-between gap-4 sm:gap-8">
          {/* Left Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.slice(0, 2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleSmoothScroll}
                className="text-sm tracking-widest uppercase text-foreground/80 hover:text-foreground transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Logo - centered on mobile, flex on desktop */}
          <Link href="/" className="flex flex-col items-center group flex-1 lg:flex-none">
            <span className="text-2xl sm:text-3xl md:text-4xl font-light tracking-[0.3em] text-foreground transition-all duration-300 group-hover:tracking-[0.4em]">
              Misty Cats
            </span>
            <span className="text-[8px] sm:text-[10px] tracking-[0.5em] uppercase text-muted-foreground mt-1">Bijoux Upcyclés</span>
          </Link>

          {/* Right Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.slice(2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleSmoothScroll}
                className="text-sm tracking-widest uppercase text-foreground/80 hover:text-foreground transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <Button variant="ghost" size="icon" className="hidden md:flex hover:bg-secondary h-9 w-9 sm:h-10 sm:w-10">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="flex hover:bg-secondary h-9 w-9 sm:h-10 sm:w-10" asChild>
              <Link href={session?.user ? "/mon-compte" : "/login"} aria-label="Mon compte">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative hover:bg-secondary h-9 w-9 sm:h-10 sm:w-10">
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                0
              </span>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 sm:h-10 sm:w-10" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-500 ease-in-out",
            isOpen ? "max-h-96 opacity-100 mt-6" : "max-h-0 opacity-0",
          )}
        >
          <div className="flex flex-col items-center gap-6 py-8 border-t border-border">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg tracking-widest uppercase text-foreground/80 hover:text-foreground transition-colors"
                onClick={handleSmoothScroll}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
