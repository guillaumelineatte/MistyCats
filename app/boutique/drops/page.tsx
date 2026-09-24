import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowRight } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Tous les Drops | Misty Cats",
  description: "Retrouvez toutes les collections drops Misty Cats.",
}

export default async function DropsArchivePage() {
  const drops = await prisma.drop.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { articles: true } },
      articles: {
        where: { status: "ONLINE" },
        orderBy: { order: "asc" },
        take: 4,
        select: { id: true, title: true, images: { orderBy: { position: "asc" }, take: 1 } },
      },
    },
  })

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* En-tête */}
      <section className="pt-40 pb-12 sm:pt-48 sm:pb-16 text-center">
        <span className="inline-block text-xs sm:text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
          Misty Cats
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-widest uppercase mb-4">
          Les <span className="italic font-normal">Drops</span>
        </h1>
        <p className="text-muted-foreground text-sm tracking-wider max-w-md mx-auto px-4">
          Collections thématiques à direction artistique.
        </p>
      </section>

      {/* Liste des drops */}
      <section className="container mx-auto px-4 sm:px-6 pb-24 space-y-12">
        {drops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-muted-foreground text-sm tracking-widest uppercase">
              Aucun drop disponible pour l'instant
            </p>
            <Link
              href="/boutique"
              className="mt-6 text-xs tracking-widest uppercase border-b border-foreground pb-0.5 hover:text-muted-foreground transition-colors"
            >
              Voir la collection
            </Link>
          </div>
        ) : (
          drops.map((drop) => (
            <article
              key={drop.id}
              className="border-t border-border pt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
            >
              {/* Infos */}
              <div>
                <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
                  Drop
                </span>
                <h2 className="mt-2 text-2xl sm:text-3xl font-light tracking-widest uppercase mb-3">
                  {drop.name}
                </h2>
                {drop.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
                    {drop.description}
                  </p>
                )}
                <div className="flex items-center gap-6">
                  <span className="text-xs text-muted-foreground tracking-wider">
                    {drop._count.articles} pièce{drop._count.articles !== 1 ? "s" : ""}
                  </span>
                  <Link
                    href={`/boutique/drops/${drop.id}`}
                    className="inline-flex items-center gap-2 text-xs tracking-widest uppercase border-b border-foreground pb-0.5 hover:text-muted-foreground transition-colors"
                  >
                    Voir le drop
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Aperçu images */}
              <div className="grid grid-cols-4 gap-2">
                {drop.coverImage && (
                  <div className="col-span-4 h-40 overflow-hidden rounded-sm bg-secondary mb-1">
                    <img
                      src={drop.coverImage}
                      alt={drop.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {drop.articles.slice(0, drop.coverImage ? 4 : 4).map((article) => (
                  <div
                    key={article.id}
                    className="aspect-square overflow-hidden rounded-sm bg-secondary"
                  >
                    <img
                      src={article.images[0]?.url ?? "/placeholder-product.svg"}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </article>
          ))
        )}
      </section>

      <Footer />
    </main>
  )
}
