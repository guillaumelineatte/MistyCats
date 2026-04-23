import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { ArticleForm } from "@/components/admin/article-form"

export default function NewArticlePage() {
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
        Nouvel article
      </h1>

      <ArticleForm />
    </div>
  )
}
