import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, FileText } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatCents } from "@/lib/money"
import { OrderActions } from "@/components/admin/order-actions"

export const dynamic = "force-dynamic"

interface Address {
  firstName: string
  lastName: string
  street: string
  complement?: string
  postalCode: string
  city: string
  country: string
  phone?: string
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params
  const order = await prisma.order.findUnique({
    where: { number },
    include: {
      items: true,
      shipment: { include: { events: { orderBy: { occurredAt: "desc" } } } },
      user: { select: { id: true, email: true, name: true, lastName: true } },
    },
  })

  if (!order) notFound()

  const shipping = order.shippingAddress as unknown as Address
  const billing = order.billingAddress as unknown as Address

  return (
    <div>
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" />
        Retour aux commandes
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl tracking-widest uppercase">{order.number}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {order.createdAt.toLocaleDateString("fr-FR")} — {order.email}
            {order.user && (
              <>
                {" — "}
                <Link href={`/admin/customers/${order.user.id}`} className="underline underline-offset-4">
                  {order.user.name} {order.user.lastName}
                </Link>
              </>
            )}
          </p>
        </div>
        <a
          href={`/api/admin/orders/${order.number}/delivery-note`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase border border-border px-4 py-2 hover:bg-secondary/30 transition-colors"
        >
          <FileText className="h-4 w-4" />
          Bon de livraison
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div>
          <h2 className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Articles</h2>
          <div className="border border-border divide-y divide-border">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between px-4 py-3 text-sm">
                <span>{item.titleSnapshot}</span>
                <span>{formatCents(item.priceCentsSnapshot)}</span>
              </div>
            ))}
            <div className="flex justify-between px-4 py-3 text-sm text-muted-foreground">
              <span>Livraison ({order.shippingMethod})</span>
              <span>{formatCents(order.shippingCents)}</span>
            </div>
            <div className="flex justify-between px-4 py-3 text-sm font-medium">
              <span>Total</span>
              <span>{formatCents(order.totalCents)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <h2 className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Livraison</h2>
            <p className="text-sm">
              {shipping.firstName} {shipping.lastName}<br />
              {shipping.street}{shipping.complement ? `, ${shipping.complement}` : ""}<br />
              {shipping.postalCode} {shipping.city}<br />
              {shipping.country}
            </p>
          </div>
          <div>
            <h2 className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Facturation</h2>
            <p className="text-sm">
              {billing.firstName} {billing.lastName}<br />
              {billing.street}{billing.complement ? `, ${billing.complement}` : ""}<br />
              {billing.postalCode} {billing.city}<br />
              {billing.country}
            </p>
          </div>
        </div>
      </div>

      {order.shipment && order.shipment.events.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Historique de suivi</h2>
          <div className="border border-border divide-y divide-border">
            {order.shipment.events.map((e) => (
              <div key={e.id} className="px-4 py-3 text-sm">
                <p>{e.label}{e.location ? ` — ${e.location}` : ""}</p>
                <p className="text-xs text-muted-foreground">{e.occurredAt.toLocaleString("fr-FR")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <OrderActions orderNumber={order.number} status={order.status} hasShipment={!!order.shipment} />
    </div>
  )
}
