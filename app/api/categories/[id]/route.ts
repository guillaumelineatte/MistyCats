import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { categorySchema } from "@/lib/validations/category"
import { requireAdmin } from "@/lib/require-admin"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAdmin()
  if ("error" in check) return check.error

  const { id } = await params
  const body = await req.json()
  const parsed = categorySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 422 })
  }

  const category = await prisma.category.update({
    where: { id },
    data: { name: parsed.data.name, description: parsed.data.description || null },
  })
  return NextResponse.json(category)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAdmin()
  if ("error" in check) return check.error

  const { id } = await params
  const count = await prisma.article.count({ where: { categoryId: id } })
  if (count > 0) {
    return NextResponse.json(
      { error: `Cette catégorie contient ${count} pièce${count > 1 ? "s" : ""} : déplacez-les avant de la supprimer.` },
      { status: 409 }
    )
  }

  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
