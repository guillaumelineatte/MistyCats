import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatCents } from "@/lib/money"

export const dynamic = "force-dynamic"

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customer = await prisma.user.findUnique({
    where: { id, role: "CUSTOMER" },
    include: {
      addresses: true,
      orders: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!customer) notFound()

  return (
    <div>
      <Link href="/admin/customers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" />
        Retour aux clientes
      </Link>

      <h1 className="font-serif text-xl sm:text-2xl tracking-widest uppercase mb-1">{customer.name} {customer.lastName}</h1>
      <p className="text-sm text-muted-foreground mb-8">
        {customer.email} — {customer.emailVerified ? "email vérifié" : "email non vérifié"} — inscrite le {customer.createdAt.toLocaleDateString("fr-FR")}
      </p>

      {customer.addresses.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Adresses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {customer.addresses.map((a) => (
              <div key={a.id} className="border border-border p-4 text-sm">
                <p className="text-xs tracking-wider uppercase text-muted-foreground mb-1">{a.type === "SHIPPING" ? "Livraison" : "Facturation"}</p>
                <p>{a.firstName} {a.lastName}</p>
                <p>{a.street}{a.complement ? `, ${a.complement}` : ""}</p>
                <p>{a.postalCode} {a.city}</p>
                <p>{a.country}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Commandes</h2>
        {customer.orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune commande.</p>
        ) : (
          <div className="border border-border divide-y divide-border">
            {customer.orders.map((o) => (
              <Link key={o.number} href={`/admin/orders/${o.number}`} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors">
                <span className="text-sm">{o.number}</span>
                <span className="text-sm text-muted-foreground">{formatCents(o.totalCents)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
