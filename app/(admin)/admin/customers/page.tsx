import Link from "next/link"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      lastName: true,
      email: true,
      emailVerified: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  })

  return (
    <div>
      <h1 className="font-serif text-xl sm:text-2xl tracking-widest uppercase mb-6">
        Clientes <span className="text-sm text-muted-foreground normal-case tracking-normal">({customers.length})</span>
      </h1>

      {customers.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune cliente pour l'instant.</p>
      ) : (
        <div className="border border-border rounded-md overflow-hidden divide-y divide-border">
          {customers.map((c) => (
            <Link
              key={c.id}
              href={`/admin/customers/${c.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
            >
              <div>
                <p className="text-sm font-medium">{c.name} {c.lastName}</p>
                <p className="text-xs text-muted-foreground">{c.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">{c._count.orders} commande{c._count.orders !== 1 ? "s" : ""}</p>
                <p className="text-xs text-muted-foreground">{c.emailVerified ? "Email vérifié" : "Non vérifié"}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
