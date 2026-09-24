import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { dropSchema } from "@/lib/validations/drop"
import { eurosToCents } from "@/lib/money"
import { requireAdmin } from "@/lib/require-admin"

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

interface Params {
  params: Promise<{ id: string }>
}

// GET /api/drops/:id — détail avec articles (public si publié, sinon admin)
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params
  const session = await auth()

  const drop = await prisma.drop.findUnique({
    where: { id },
    include: {
      articles: { orderBy: { order: "asc" } },
    },
  })

  if (!drop) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  if (!drop.published && session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  return NextResponse.json(drop)
}

// PUT /api/drops/:id — mise à jour complète (admin)
export async function PUT(req: NextRequest, { params }: Params) {
  const check = await requireAdmin()
  if ("error" in check) return check.error

  const { id } = await params
  const body = await req.json()
  const parsed = dropSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const {
    name,
    description,
    coverImage,
    published,
    scheduledAt,
    articles,
    articlesToRelease = [],
  } = parsed.data

  const scheduledDate = scheduledAt ? new Date(scheduledAt) : null

  // Articles actuels du drop en base
  const currentArticles = await prisma.article.findMany({
    where: { dropId: id },
    select: { id: true },
  })
  const currentIds = currentArticles.map((a) => a.id)

  // IDs des articles soumis (ceux qui ont déjà un ID en base)
  const submittedIds = articles.flatMap((a) => (a.articleDbId ? [a.articleDbId] : []))

  // Articles à supprimer = ceux en base qui ne sont plus dans le formulaire et pas libérés
  const idsToDelete = currentIds.filter(
    (dbId) => !submittedIds.includes(dbId) && !articlesToRelease.includes(dbId)
  )

  await prisma.$transaction(async (tx) => {
    // Mise à jour des métadonnées du drop
    await tx.drop.update({
      where: { id },
      data: {
        name,
        description: description || null,
        coverImage: coverImage || null,
        published,
        scheduledAt: scheduledDate,
      },
    })

    const now = new Date()

    // Mise à jour des articles existants
    for (const a of articles.filter((a) => a.articleDbId)) {
      await tx.article.update({
        where: { id: a.articleDbId },
        data: {
          title: a.title,
          shortDescription: a.shortDescription,
          description: a.description,
          priceCents: eurosToCents(a.price),
          category: { connect: { id: a.categoryId } },
          images: { deleteMany: {}, create: [{ url: a.image, alt: a.title, position: 0, isPrimary: true }] },
          ...(published ? { status: "ONLINE", publishedAt: now } : {}),
        },
      })
    }

    // Création des nouveaux articles
    const newArticles = articles.filter((a) => !a.articleDbId)
    for (let i = 0; i < newArticles.length; i++) {
      const a = newArticles[i]
      await tx.article.create({
        data: {
          title: a.title,
          shortDescription: a.shortDescription,
          description: a.description,
          priceCents: eurosToCents(a.price),
          category: { connect: { id: a.categoryId } },
          status: published ? "ONLINE" : "DRAFT",
          publishedAt: published ? now : null,
          order: submittedIds.length + i,
          drop: { connect: { id } },
          slug: `${slugify(a.title)}-${Math.random().toString(36).slice(2, 8)}`,
          sku: `MC-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
          images: { create: [{ url: a.image, alt: a.title, position: 0, isPrimary: true }] },
        },
      })
    }

    // Suppression des articles retirés
    if (idsToDelete.length > 0) {
      await tx.article.deleteMany({ where: { id: { in: idsToDelete } } })
    }

    // Libération des articles (passage en standalone)
    if (articlesToRelease.length > 0) {
      await tx.article.updateMany({
        where: { id: { in: articlesToRelease } },
        data: { dropId: null },
      })
    }

    // Publication de tous les articles restants du drop si le drop est publié
    if (published) {
      await tx.article.updateMany({
        where: {
          dropId: id,
          id: { notIn: articlesToRelease },
          status: "DRAFT",
        },
        data: { status: "ONLINE", publishedAt: now },
      })
    }
  })

  const updated = await prisma.drop.findUnique({
    where: { id },
    include: { articles: { orderBy: { order: "asc" } } },
  })

  return NextResponse.json(updated)
}

// DELETE /api/drops/:id — suppression (admin)
export async function DELETE(req: NextRequest, { params }: Params) {
  const check = await requireAdmin()
  if ("error" in check) return check.error

  const { id } = await params

  // On libère les articles avant de supprimer le drop (OnDelete: SetNull le fait en DB aussi)
  await prisma.drop.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
