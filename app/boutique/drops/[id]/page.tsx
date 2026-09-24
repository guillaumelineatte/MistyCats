import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ArrowUpRight } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"

export const dynamic = "force-dynamic"

interface DropPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: DropPageProps) {
  const { id } = await params
  const drop = await prisma.drop.findUnique({ where: { id }, select: { name: true } })
  if (!drop) return {}
  return {
    title: `${drop.name} | Misty Cats`,
    description: `Découvrez le drop ${drop.name} — bijoux upcyclés Misty Cats.`,
  }
}

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

export default async function DropPage({ params }: DropPageProps) {
  const { id } = await params

  const drop = await prisma.drop.findUnique({
    where: { id, published: true },
    include: {
      articles: {
        where: { status: "ONLINE" },
        orderBy: { order: "asc" },
        include: { category: true, images: { orderBy: { position: "asc" }, take: 1 } },
      },
    },
  })

  if (!drop) notFound()

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* En-tête du drop */}
      <section className="pt-40 sm:pt-48 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          <Link
            href="/boutique/drops"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wider mb-8"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Tous les drops
          </Link>

          <span className="block text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
            Dernier Drop
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-widest uppercase mb-4">
            {drop.name}
          </h1>
          {drop.description && (
            <p className="text-muted-foreground text-sm tracking-wider max-w-lg leading-relaxed">
              {drop.description}
            </p>
          )}
        </div>
      </section>

      {/* Image de couverture */}
      {drop.coverImage && (
        <div className="container mx-auto px-4 sm:px-6 pb-12">
          <div className="w-full h-56 sm:h-80 overflow-hidden rounded-sm bg-secondary">
            <img
              src={drop.coverImage}
              alt={drop.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Grille articles */}
      <section className="container mx-auto px-4 sm:px-6 pb-24">
        <div className="flex items-center justify-between mb-8">
          <span className="text-xs tracking-wider text-muted-foreground uppercase">
            {drop.articles.length} pièce{drop.articles.length !== 1 ? "s" : ""}
          </span>
          <Link
            href="/boutique"
            className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            Voir tous les articles
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {drop.articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-muted-foreground text-sm tracking-widest uppercase">
              Aucun article dans ce drop
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 animate-in fade-in duration-500">
            {drop.articles.map((article) => (
              <ProductCard
                key={article.id}
                product={{
                  id: article.id,
                  name: article.title,
                  priceCents: article.priceCents,
                  image: article.images[0]?.url ?? "",
                  category: article.category.name,
                  isNew: Date.now() - new Date(article.createdAt).getTime() < THIRTY_DAYS,
                }}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
