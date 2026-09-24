import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatCents } from "@/lib/money"
import type { OrderStatus } from "@prisma/client"

export const dynamic = "force-dynamic"

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "En attente de paiement",
  PAID: "Payée",
  PREPARING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
}

const FILTERS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "Toutes", value: "all" },
  { label: "Payées", value: "PAID" },
  { label: "En préparation", value: "PREPARING" },
  { label: "Expédiées", value: "SHIPPED" },
  { label: "Livrées", value: "DELIVERED" },
]

interface AdminOrdersPageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const { status } = await searchParams
  const filter = status && status !== "all" ? (status as OrderStatus) : undefined

  const orders = await prisma.order.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <div>
      <h1 className="font-serif text-xl sm:text-2xl tracking-widest uppercase mb-6">Commandes</h1>

      <div className="flex items-center gap-1 mb-6 overflow-x-auto">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "all" ? "/admin/orders" : `/admin/orders?status=${f.value}`}
            className={`px-4 py-2 text-xs tracking-widest uppercase whitespace-nowrap border-b-2 transition-colors ${
              (status ?? "all") === f.value ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune commande.</p>
      ) : (
        <div className="border border-border rounded-md overflow-hidden divide-y divide-border">
          {orders.map((order) => (
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
                <p className="text-xs text-muted-foreground">{STATUS_LABELS[order.status]}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
