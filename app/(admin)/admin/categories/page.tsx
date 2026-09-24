import { prisma } from "@/lib/prisma"
import { CategoriesManager } from "@/components/admin/categories-manager"

export const dynamic = "force-dynamic"

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { articles: true } } },
  })

  return (
    <div>
      <h1 className="font-serif text-xl sm:text-2xl tracking-widest uppercase mb-8">Catégories</h1>
      <CategoriesManager categories={categories} />
    </div>
  )
}
