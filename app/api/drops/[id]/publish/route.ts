import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"

interface Params {
  params: Promise<{ id: string }>
}

// PATCH /api/drops/:id/publish — publication immédiate (admin)
export async function PATCH(req: NextRequest, { params }: Params) {
  const check = await requireAdmin()
  if ("error" in check) return check.error

  const { id } = await params

  const drop = await prisma.drop.findUnique({ where: { id } })
  if (!drop) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  await prisma.$transaction([
    prisma.drop.update({
      where: { id },
      data: { published: true, scheduledAt: null },
    }),
    prisma.article.updateMany({
      where: { dropId: id, status: "DRAFT" },
      data: { status: "ONLINE", publishedAt: new Date() },
    }),
  ])

  return NextResponse.json({ success: true })
}
