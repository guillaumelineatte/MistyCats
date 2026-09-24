import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatCents } from "@/lib/money"

export const dynamic = "force-dynamic"

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "En attente de paiement",
  PAID: "Payée",
  PREPARING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
}

export default async function AdminDashboardPage() {
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [
    onlineCount,
    soldCount,
    reservedCount,
    draftCount,
    monthRevenue,
    toPrepareCount,
    recentOrders,
    pendingContactCount,
    pendingCustomRequestCount,
  ] = await prisma.$transaction([
    prisma.article.count({ where: { status: "ONLINE" } }),
    prisma.article.count({ where: { status: "SOLD" } }),
    prisma.article.count({ where: { status: "RESERVED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "PREPARING", "SHIPPED", "DELIVERED"] }, createdAt: { gte: monthStart } },
      _sum: { totalCents: true },
    }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { number: true, email: true, status: true, totalCents: true, createdAt: true },
    }),
    prisma.contactMessage.count({ where: { processed: false } }),
    prisma.customRequest.count({ where: { processed: false } }),
  ])

  const stats = [
    { label: "Pièces en ligne", value: onlineCount },
    { label: "Pièces vendues", value: soldCount },
    { label: "Pièces réservées", value: reservedCount },
    { label: "Brouillons", value: draftCount },
  ]

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-xl sm:text-2xl tracking-widest uppercase">Tableau de bord</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-border p-5">
            <p className="text-2xl font-light">{s.value}</p>
            <p className="text-xs tracking-wider uppercase text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="border border-border p-5">
          <p className="text-2xl font-light">{formatCents(monthRevenue._sum.totalCents ?? 0)}</p>
          <p className="text-xs tracking-wider uppercase text-muted-foreground mt-1">Chiffre d'affaires du mois</p>
        </div>
        <Link href="/admin/orders" className="border border-border p-5 hover:bg-secondary/30 transition-colors">
          <p className="text-2xl font-light">{toPrepareCount}</p>
          <p className="text-xs tracking-wider uppercase text-muted-foreground mt-1">Commandes à préparer</p>
        </Link>
        <Link href="/admin/inbox" className="border border-border p-5 hover:bg-secondary/30 transition-colors">
          <p className="text-2xl font-light">{pendingContactCount + pendingCustomRequestCount}</p>
          <p className="text-xs tracking-wider uppercase text-muted-foreground mt-1">Messages en attente</p>
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs tracking-widest uppercase text-muted-foreground">Dernières commandes</h2>
          <Link href="/admin/orders" className="text-xs tracking-widest uppercase border-b border-foreground pb-0.5">
            Toutes les commandes
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune commande pour l'instant.</p>
        ) : (
          <div className="border border-border divide-y divide-border">
            {recentOrders.map((order) => (
              <Link
                key={order.number}
                href={`/admin/orders/${order.number}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{order.number}</p>
                  <p className="text-xs text-muted-foreground">{order.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{formatCents(order.totalCents)}</p>
                  <p className="text-xs text-muted-foreground">{ORDER_STATUS_LABELS[order.status] ?? order.status}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
