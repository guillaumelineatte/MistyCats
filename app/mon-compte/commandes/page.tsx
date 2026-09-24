import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatCents } from "@/lib/money"
import type { OrderStatus } from "@prisma/client"

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "En attente de paiement",
  PAID: "Payée",
  PREPARING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
}

export default async function MesCommandesPage() {
  const session = await auth()
  const orders = await prisma.order.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-light tracking-wider">Mes commandes</h2>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground mb-4">Vous n'avez pas encore de commande.</p>
          <Link href="/boutique" className="text-xs tracking-widest uppercase border-b border-foreground pb-0.5">
            Voir la collection
          </Link>
        </div>
      ) : (
        <div className="border border-border divide-y divide-border">
          {orders.map((order) => (
            <Link
              key={order.number}
              href={`/mon-compte/commandes/${order.number}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
            >
              <div>
                <p className="text-sm font-medium">{order.number}</p>
                <p className="text-xs text-muted-foreground">{order.createdAt.toLocaleDateString("fr-FR")}</p>
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
