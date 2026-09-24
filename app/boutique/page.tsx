import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CollectionView } from "@/components/collection-view"
import { LatestDropSection } from "@/components/latest-drop-section"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "La Collection | Misty Cats",
  description: "Découvrez toute la collection de bijoux upcyclés Misty Cats.",
}

const articleSelect = {
  id: true,
  slug: true,
  title: true,
  priceCents: true,
  createdAt: true,
  category: { select: { slug: true, name: true } },
  images: { orderBy: { position: "asc" as const }, take: 1 },
}

function toCardArticle<T extends { category: { slug: string; name: string }; images: { url: string }[] }>(a: T) {
  return {
    ...a,
    image: a.images[0]?.url ?? "",
    categorySlug: a.category.slug,
    categoryName: a.category.name,
  }
}

export default async function BoutiquePage() {
  const [articles, categories, latestDrop] = await Promise.all([
    // Articles standalone (sans drop)
    prisma.article.findMany({
      where: { status: "ONLINE", dropId: null },
      orderBy: { order: "asc" },
      select: articleSelect,
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    // Dernier drop publié avec ses articles
    prisma.drop.findFirst({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      include: {
        articles: {
          where: { status: "ONLINE" },
          orderBy: { order: "asc" },
          select: articleSelect,
        },
      },
    }),
  ])

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Section Dernier Drop */}
      {latestDrop && (
        <Suspense>
          <LatestDropSection drop={{ ...latestDrop, articles: latestDrop.articles.map(toCardArticle) }} />
        </Suspense>
      )}

      {/* Articles standalone */}
      <Suspense>
        <CollectionView
          articles={articles.map(toCardArticle)}
          categories={categories}
          showHeader={!latestDrop}
        />
      </Suspense>

      <Footer />
    </main>
  )
}
