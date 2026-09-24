import Link from "next/link"
import { Plus } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { DropsTable } from "@/components/admin/drops-table"

export const dynamic = "force-dynamic"

// Auto-publication des drops programmés
async function autoPublishScheduled() {
  const now = new Date()
  const toPublish = await prisma.drop.findMany({
    where: { published: false, scheduledAt: { lte: now } },
    select: { id: true },
  })
  if (toPublish.length === 0) return
  const ids = toPublish.map((d) => d.id)
  await prisma.$transaction([
    prisma.drop.updateMany({ where: { id: { in: ids } }, data: { published: true } }),
    prisma.article.updateMany({
      where: { dropId: { in: ids }, status: "DRAFT" },
      data: { status: "ONLINE", publishedAt: now },
    }),
  ])
}

export default async function AdminDropsPage() {
  await autoPublishScheduled()

  const drops = await prisma.drop.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { articles: true } } },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl tracking-widest uppercase">Drops</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {drops.length} drop{drops.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild className="rounded-none tracking-widest uppercase text-xs shrink-0">
          <Link href="/admin/drops/new">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouveau drop</span>
            <span className="sm:hidden">Nouveau</span>
          </Link>
        </Button>
      </div>

      <DropsTable drops={drops} />
    </div>
  )
}
