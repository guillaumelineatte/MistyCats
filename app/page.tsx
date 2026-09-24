import { prisma } from "@/lib/prisma"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Philosophy } from "@/components/philosophy"
import { FeaturedCollection } from "@/components/featured-collection"
import { Categories } from "@/components/categories"
import { Store } from "@/components/store"
import { Provenance } from "@/components/provenance"
import { Newsletter } from "@/components/newsletter"
import { Footer } from "@/components/footer"

export const dynamic = "force-dynamic"

export default async function Home() {
  const rows = await prisma.article.findMany({
    where: { status: "ONLINE" },
    orderBy: { order: "asc" },
    take: 4,
    select: {
      id: true,
      title: true,
      priceCents: true,
      createdAt: true,
      category: { select: { name: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
    },
  })
  const articles = rows.map((a) => ({
    id: a.id,
    title: a.title,
    priceCents: a.priceCents,
    createdAt: a.createdAt,
    categoryName: a.category.name,
    image: a.images[0]?.url ?? "",
  }))

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section id="accueil"><Hero /></section>
      <section id="notre-histoire"><Philosophy /></section>
      <section id="collection"><FeaturedCollection articles={articles} /></section>
      <section id="categories"><Categories /></section>
      <Store />
      <section id="provenance"><Provenance /></section>
      <section id="newsletter"><Newsletter /></section>
      <Footer />
    </main>
  )
}
