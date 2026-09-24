import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatCents } from "@/lib/money"

interface Address {
  firstName: string
  lastName: string
  street: string
  complement?: string
  postalCode: string
  city: string
  country: string
}

export default async function MaCommandeDetailPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params
  const session = await auth()

  const order = await prisma.order.findUnique({
    where: { number },
    include: {
      items: true,
      shipment: { include: { events: { orderBy: { occurredAt: "desc" } } } },
    },
  })

  // Numéro de commande séquentiel donc devinable : la propriété doit être
  // revérifiée ici, pas seulement supposée depuis l'URL (voir e2e IDOR test).
  if (!order || order.userId !== session?.user.id) {
    notFound()
  }

  const shipping = order.shippingAddress as unknown as Address

  return (
    <div className="space-y-8">
      <Link href="/mon-compte/commandes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-4 w-4" />
        Mes commandes
      </Link>

      <div>
        <h2 className="text-2xl font-light tracking-wider">{order.number}</h2>
        <p className="text-sm text-muted-foreground mt-1">Commandée le {order.createdAt.toLocaleDateString("fr-FR")}</p>
      </div>

      <div className="border border-border divide-y divide-border">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between px-5 py-3 text-sm">
            <span>{item.titleSnapshot}</span>
            <span>{formatCents(item.priceCentsSnapshot)}</span>
          </div>
        ))}
        <div className="flex justify-between px-5 py-3 text-sm text-muted-foreground">
          <span>Livraison ({order.shippingMethod})</span>
          <span>{formatCents(order.shippingCents)}</span>
        </div>
        <div className="flex justify-between px-5 py-3 text-sm font-medium">
          <span>Total</span>
          <span>{formatCents(order.totalCents)}</span>
        </div>
      </div>

      <div>
        <h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Adresse de livraison</h3>
        <p className="text-sm text-muted-foreground">
          {shipping.firstName} {shipping.lastName}<br />
          {shipping.street}{shipping.complement ? `, ${shipping.complement}` : ""}<br />
          {shipping.postalCode} {shipping.city}<br />
          {shipping.country}
        </p>
      </div>

      {order.shipment && order.shipment.events.length > 0 && (
        <div>
          <h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Suivi</h3>
          <ol className="space-y-3">
            {order.shipment.events.map((e) => (
              <li key={e.id} className="text-sm">
                <p>{e.label}{e.location ? ` — ${e.location}` : ""}</p>
                <p className="text-xs text-muted-foreground">{e.occurredAt.toLocaleString("fr-FR")}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
