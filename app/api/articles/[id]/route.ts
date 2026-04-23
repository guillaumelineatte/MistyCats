import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { articleSchema } from "@/lib/validations/article"

// GET /api/articles/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const article = await prisma.article.findUnique({ where: { id } })

  if (!article) {
    return NextResponse.json({ error: "Article introuvable" }, { status: 404 })
  }

  return NextResponse.json(article)
}

// PUT /api/articles/:id — mise à jour (admin uniquement)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = articleSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const existing = await prisma.article.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Article introuvable" }, { status: 404 })
  }

  const article = await prisma.article.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json(article)
}

// DELETE /api/articles/:id — suppression (admin uniquement)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.article.findUnique({ where: { id } })

  if (!existing) {
    return NextResponse.json({ error: "Article introuvable" }, { status: 404 })
  }

  await prisma.article.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
