import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { ArticleForm } from "@/components/admin/article-form"

interface EditArticlePageProps {
  params: Promise<{ id: string }>
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params
  const article = await prisma.article.findUnique({ where: { id } })

  if (!article) notFound()

  return (
    <div>
      {/* Retour */}
      <Link
        href="/admin/articles"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour aux articles
      </Link>

      <h1 className="font-serif text-2xl tracking-widest uppercase mb-8">
        Modifier l'article
      </h1>

      <ArticleForm article={article} />
    </div>
  )
}
