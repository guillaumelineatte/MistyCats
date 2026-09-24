import { prisma } from "@/lib/prisma"
import { InboxItem } from "@/components/admin/inbox-item"

export const dynamic = "force-dynamic"

export default async function AdminInboxPage() {
  const [messages, customRequests] = await Promise.all([
    prisma.contactMessage.findMany({ orderBy: [{ processed: "asc" }, { createdAt: "desc" }] }),
    prisma.customRequest.findMany({ orderBy: [{ processed: "asc" }, { createdAt: "desc" }] }),
  ])

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-serif text-xl sm:text-2xl tracking-widest uppercase mb-6">Boîte de réception</h1>
      </div>

      <div>
        <h2 className="text-xs tracking-widest uppercase text-muted-foreground mb-4">
          Messages de contact ({messages.filter((m) => !m.processed).length} en attente)
        </h2>
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun message.</p>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <InboxItem key={m.id} endpoint={`/api/admin/inbox/contact/${m.id}`} processed={m.processed}>
                <p className="text-sm font-medium">{m.name} — <span className="text-muted-foreground">{m.email}</span></p>
                {m.subject && <p className="text-sm mt-1">{m.subject}</p>}
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{m.message}</p>
                <p className="text-xs text-muted-foreground mt-2">{m.createdAt.toLocaleString("fr-FR")}</p>
              </InboxItem>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xs tracking-widest uppercase text-muted-foreground mb-4">
          Demandes sur-mesure ({customRequests.filter((r) => !r.processed).length} en attente)
        </h2>
        {customRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune demande.</p>
        ) : (
          <div className="space-y-3">
            {customRequests.map((r) => (
              <InboxItem key={r.id} endpoint={`/api/admin/inbox/custom-requests/${r.id}`} processed={r.processed}>
                <p className="text-sm font-medium">{r.name} — <span className="text-muted-foreground">{r.email}</span></p>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{r.description}</p>
                {r.budget && <p className="text-xs text-muted-foreground mt-1">Budget : {r.budget}</p>}
                <p className="text-xs text-muted-foreground mt-2">{r.createdAt.toLocaleString("fr-FR")}</p>
              </InboxItem>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
