import { notFound } from "next/navigation"
import Link from "next/link"
import { Check } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { formatCents } from "@/lib/money"

export const dynamic = "force-dynamic"

interface ConfirmationPageProps {
  params: Promise<{ number: string }>
}

export default async function OrderConfirmationPage({ params }: ConfirmationPageProps) {
  const { number } = await params
  const session = await auth()

  const order = await prisma.order.findUnique({
    where: { number },
    include: { items: true },
  })

  // Une commande n'est visible que par son propriétaire (compte) ou, pour une
  // commande invitée, juste après paiement (pas de session à comparer) — le
  // suivi public (email + numéro) prend le relais en phase 6 pour l'accès ultérieur.
  if (!order || (order.userId && order.userId !== session?.user?.id)) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="pt-32 sm:pt-40 pb-24">
        <div className="container mx-auto px-4 sm:px-6 max-w-xl text-center">
          <div className="h-14 w-14 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
            <Check className="h-6 w-6 text-accent-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-widest uppercase mb-3">Commande confirmée</h1>
          <p className="text-sm text-muted-foreground mb-10">
            Numéro de commande <strong className="text-foreground">{order.number}</strong>. Un email de confirmation
            vous a été envoyé à {order.email}.
          </p>

          <div className="border border-border p-6 text-left space-y-3 mb-8">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.titleSnapshot}</span>
                <span>{formatCents(item.priceCentsSnapshot)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t border-border">
              <span>Livraison</span>
              <span>{formatCents(order.shippingCents)}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t border-border">
              <span>Total</span>
              <span>{formatCents(order.totalCents)}</span>
            </div>
          </div>

          {!session?.user && (
            <p className="text-sm text-muted-foreground mb-8">
              Créez un compte pour suivre vos commandes plus facilement —{" "}
              <Link href={`/inscription?email=${encodeURIComponent(order.email)}`} className="underline underline-offset-4">
                créer un compte
              </Link>
              .
            </p>
          )}

          <Link href="/boutique" className="text-xs tracking-widest uppercase border-b border-foreground pb-0.5">
            Continuer mes achats
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  )
}
