import Link from "next/link"
import { Plus } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { ArticlesTable } from "@/components/admin/articles-table"

export const dynamic = "force-dynamic"

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { order: "asc" },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl tracking-widest uppercase">Articles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {articles.length} article{articles.length !== 1 ? "s" : ""} — glissez les lignes pour réordonner
          </p>
        </div>
        <Button asChild className="rounded-none tracking-widest uppercase text-xs">
          <Link href="/admin/articles/new">
            <Plus className="h-4 w-4" />
            Nouvel article
          </Link>
        </Button>
      </div>

      <ArticlesTable articles={articles} />
    </div>
  )
}
