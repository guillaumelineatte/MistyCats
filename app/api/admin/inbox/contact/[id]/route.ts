import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAdmin()
  if ("error" in check) return check.error

  const { id } = await params
  const message = await prisma.contactMessage.update({ where: { id }, data: { processed: true } })
  return NextResponse.json(message)
}
