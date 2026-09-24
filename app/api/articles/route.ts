import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { articleSchema } from "@/lib/validations/article"
import { eurosToCents } from "@/lib/money"

// GET /api/articles — liste paginée
// Paramètres : ?published=true&page=1&limit=20&category=colliers (slug)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const publishedParam = searchParams.get("published")
  const page = Math.max(1, Number(searchParams.get("page") ?? 1))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)))
  const categorySlug = searchParams.get("category")

  // ?standalone=true exclut les articles liés à un drop (pour la boutique publique)
  const standaloneParam = searchParams.get("standalone")

  const where = {
    ...(publishedParam !== null ? { status: publishedParam === "true" ? "ONLINE" as const : { not: "ONLINE" as const } } : {}),
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(standaloneParam === "true" ? { dropId: null } : {}),
  }

  const [articles, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      include: { category: true, images: { orderBy: { position: "asc" } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.article.count({ where }),
  ])

  return NextResponse.json({ articles, total, page, limit })
}

// POST /api/articles — création (admin uniquement)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = articleSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { price, images, categoryId, status, ...rest } = parsed.data
  const count = await prisma.article.count()
  const slugBase = rest.title.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

  const article = await prisma.article.create({
    data: {
      ...rest,
      priceCents: eurosToCents(price),
      category: { connect: { id: categoryId } },
      status,
      order: count,
      slug: `${slugBase}-${Math.random().toString(36).slice(2, 8)}`,
      sku: `MC-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      publishedAt: status === "ONLINE" ? new Date() : null,
      images: {
        create: images.map((img, i) => ({ ...img, position: i })),
      },
    },
  })
  return NextResponse.json(article, { status: 201 })
}
