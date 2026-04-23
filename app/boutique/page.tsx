import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CollectionView } from "@/components/collection-view"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "La Collection | Misty Cats",
  description: "Découvrez toute la collection de bijoux upcyclés Misty Cats.",
}

export default async function BoutiquePage() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      price: true,
      image: true,
      category: true,
      createdAt: true,
    },
  })

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Suspense>
        <CollectionView articles={articles} />
      </Suspense>
      <Footer />
    </main>
  )
}
