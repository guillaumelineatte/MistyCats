import Link from "next/link"
import { Instagram, Facebook, Mail } from "lucide-react"

const footerLinks = {
  boutique: [
    { label: "Tous les bijoux", href: "/boutique" },
    { label: "Nouveautés", href: "/boutique/nouveautes" },
    { label: "Meilleures ventes", href: "/boutique/meilleures-ventes" },
    { label: "Promotions", href: "/boutique/promotions" },
  ],
  informations: [
    { label: "Notre histoire", href: "/notre-histoire" },
    { label: "L'upcycling", href: "/upcycling" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Mentions légales", href: "/mentions-legales" },
    { label: "CGV", href: "/cgv" },
    { label: "Confidentialité", href: "/confidentialite" },
    { label: "Livraison & Retours", href: "/livraison-retours" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-secondary py-16 md:py-20">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-light tracking-[0.2em]">Misty Cats</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm mb-6">
              Des bijoux artisanaux créés avec amour à partir de matériaux upcyclés. Chaque pièce raconte une histoire
              unique.
            </p>
            <div className="flex gap-4">
              <Link
                href="https://www.instagram.com/_mistycats/"
                target="_blank"
                className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </Link>
              <Link
                href="https://facebook.com"
                target="_blank"
                className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </Link>
              <Link
                href="mailto:contact@mistycats.fr"
                className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium mb-6 tracking-wider uppercase text-sm">Boutique</h4>
            <ul className="space-y-3">
              {footerLinks.boutique.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-6 tracking-wider uppercase text-sm">Informations</h4>
            <ul className="space-y-3">
              {footerLinks.informations.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-6 tracking-wider uppercase text-sm">Légal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Misty Cats. Tous droits réservés.
          </p>
          <p className="text-sm text-muted-foreground">Bijoux artisanaux • Fabriqué en France 🇫🇷</p>
        </div>
      </div>
    </footer>
  )
}
