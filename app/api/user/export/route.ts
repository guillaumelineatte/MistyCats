import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/user/export — export RGPD des données personnelles (soi-même uniquement).
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      lastName: true,
      phone: true,
      emailVerified: true,
      createdAt: true,
      addresses: true,
      orders: { include: { items: true, shipment: { include: { events: true } } } },
      contactMessages: true,
      customRequests: true,
    },
  })

  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  return NextResponse.json(user, {
    headers: { "Content-Disposition": "attachment; filename=mes-donnees-mistycats.json" },
  })
}
