import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { requireAdmin } from "@/lib/require-admin"

const reorderSchema = z.array(z.object({ id: z.string(), order: z.number().int().min(0) }))

export async function PATCH(req: NextRequest) {
  const check = await requireAdmin()
  if ("error" in check) return check.error

  const body = await req.json()
  const parsed = reorderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 422 })
  }

  await prisma.$transaction(
    parsed.data.map(({ id, order }) => prisma.category.update({ where: { id }, data: { order } }))
  )

  return NextResponse.json({ success: true })
}
