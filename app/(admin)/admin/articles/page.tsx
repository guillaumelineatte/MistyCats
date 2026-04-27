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
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl tracking-widest uppercase">Articles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {articles.length} article{articles.length !== 1 ? "s" : ""}
            <span className="hidden sm:inline"> — glissez les lignes pour réordonner</span>
          </p>
        </div>
        <Button asChild className="rounded-none tracking-widest uppercase text-xs shrink-0">
          <Link href="/admin/articles/new">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouvel article</span>
            <span className="sm:hidden">Nouveau</span>
          </Link>
        </Button>
      </div>

      <ArticlesTable articles={articles} />
    </div>
  )
}
