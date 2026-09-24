import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { categorySchema } from "@/lib/validations/category"
import { requireAdmin } from "@/lib/require-admin"

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { articles: true } } },
  })
  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const check = await requireAdmin()
  if ("error" in check) return check.error

  const body = await req.json()
  const parsed = categorySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 422 })
  }

  const count = await prisma.category.count()
  const baseSlug = slugify(parsed.data.name)
  let slug = baseSlug
  let suffix = 1
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++suffix}`
  }

  const category = await prisma.category.create({
    data: { name: parsed.data.name, description: parsed.data.description || null, slug, order: count },
  })
  return NextResponse.json(category, { status: 201 })
}
