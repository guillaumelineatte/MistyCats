import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { DropForm } from "@/components/admin/drop-form"
import { prisma } from "@/lib/prisma"

export default async function NewDropPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } })

  return (
    <div>
      <Link
        href="/admin/drops"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour aux drops
      </Link>

      <h1 className="font-serif text-2xl tracking-widest uppercase mb-8">
        Nouveau drop
      </h1>

      <DropForm categories={categories} />
    </div>
  )
}
