import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { articleSchema } from "@/lib/validations/article"

// GET /api/articles — liste paginée
// Paramètres : ?published=true&page=1&limit=20&category=Colliers
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const publishedParam = searchParams.get("published")
  const page = Math.max(1, Number(searchParams.get("page") ?? 1))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)))
  const category = searchParams.get("category")

  const where = {
    ...(publishedParam !== null ? { published: publishedParam === "true" } : {}),
    ...(category ? { category } : {}),
  }

  const [articles, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
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

  const count = await prisma.article.count()
  const article = await prisma.article.create({
    data: { ...parsed.data, order: count },
  })
  return NextResponse.json(article, { status: 201 })
}
