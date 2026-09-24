import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { DropForm } from "@/components/admin/drop-form"

interface EditDropPageProps {
  params: Promise<{ id: string }>
}

export default async function EditDropPage({ params }: EditDropPageProps) {
  const { id } = await params

  const [drop, categories] = await Promise.all([
    prisma.drop.findUnique({
      where: { id },
      include: {
        articles: {
          orderBy: { order: "asc" },
          include: { images: { orderBy: { position: "asc" }, take: 1 } },
        },
      },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ])

  if (!drop) notFound()

  // Sérialisation des dates + aplatissement pour le formulaire client
  const dropData = {
    id: drop.id,
    name: drop.name,
    description: drop.description,
    coverImage: drop.coverImage,
    published: drop.published,
    scheduledAt: drop.scheduledAt?.toISOString() ?? null,
    articles: drop.articles.map((a) => ({
      id: a.id,
      title: a.title,
      shortDescription: a.shortDescription,
      description: a.description,
      priceCents: a.priceCents,
      categoryId: a.categoryId,
      image: a.images[0]?.url ?? "",
    })),
  }

  return (
    <div>
      <Link
        href="/admin/drops"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour aux drops
      </Link>

      <h1 className="font-serif text-2xl tracking-widest uppercase mb-2">
        {drop.name}
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        {drop.articles.length} article{drop.articles.length !== 1 ? "s" : ""}
      </p>

      <DropForm drop={dropData} categories={categories} />
    </div>
  )
}
