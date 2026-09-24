import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { dropSchema } from "@/lib/validations/drop"
import { eurosToCents } from "@/lib/money"

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Auto-publication des drops programmés dont la date est passée
async function autoPublishScheduled() {
  const now = new Date()
  const toPublish = await prisma.drop.findMany({
    where: { published: false, scheduledAt: { lte: now } },
    select: { id: true },
  })
  if (toPublish.length === 0) return

  const ids = toPublish.map((d) => d.id)
  await prisma.$transaction([
    prisma.drop.updateMany({ where: { id: { in: ids } }, data: { published: true } }),
    prisma.article.updateMany({
      where: { dropId: { in: ids }, status: "DRAFT" },
      data: { status: "ONLINE", publishedAt: now },
    }),
  ])
}

// GET /api/drops — liste (public : only published; admin : all)
export async function GET(req: NextRequest) {
  await autoPublishScheduled()

  const session = await auth()
  const isAdmin = !!session

  const { searchParams } = req.nextUrl
  const page = Math.max(1, Number(searchParams.get("page") ?? 1))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)))

  const where = isAdmin ? {} : { published: true }

  const [drops, total] = await prisma.$transaction([
    prisma.drop.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { articles: true } },
      },
    }),
    prisma.drop.count({ where }),
  ])

  return NextResponse.json({ drops, total, page, limit })
}

// POST /api/drops — création (admin uniquement)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = dropSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { name, description, coverImage, published, scheduledAt, articles } = parsed.data

  const scheduledDate = scheduledAt ? new Date(scheduledAt) : null

  // Si published, les articles sont aussi en ligne immédiatement
  const now = new Date()

  const drop = await prisma.drop.create({
    data: {
      name,
      description: description || null,
      coverImage: coverImage || null,
      published,
      scheduledAt: scheduledDate,
      articles: {
        create: articles.map((a, i) => ({
          title: a.title,
          shortDescription: a.shortDescription,
          description: a.description,
          priceCents: eurosToCents(a.price),
          category: { connect: { id: a.categoryId } },
          status: published ? "ONLINE" : "DRAFT",
          publishedAt: published ? now : null,
          order: i,
          slug: `${slugify(a.title)}-${Math.random().toString(36).slice(2, 8)}`,
          sku: `MC-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
          images: { create: [{ url: a.image, alt: a.title, position: 0, isPrimary: true }] },
        })),
      },
    },
    include: { articles: true, _count: { select: { articles: true } } },
  })

  return NextResponse.json(drop, { status: 201 })
}
