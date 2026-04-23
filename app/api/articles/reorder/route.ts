import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const reorderSchema = z.array(
  z.object({ id: z.string(), order: z.number().int().min(0) })
)

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = reorderSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 422 })
  }

  await prisma.$transaction(
    parsed.data.map(({ id, order }) =>
      prisma.article.update({ where: { id }, data: { order } })
    )
  )

  return NextResponse.json({ success: true })
}
