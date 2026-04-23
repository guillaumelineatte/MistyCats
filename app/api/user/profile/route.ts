import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateProfileSchema } from "@/lib/validations/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, lastName: true, email: true, phone: true },
  })

  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  return NextResponse.json(user)
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const result = updateProfileSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides", details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, lastName, email, phone } = result.data

    // Vérifier si l'email est déjà pris par un autre compte
    if (email !== session.user.email) {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing && existing.id !== session.user.id) {
        return NextResponse.json(
          { error: "Cette adresse email est déjà utilisée." },
          { status: 409 }
        )
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, lastName, email, phone: phone || null },
      select: { id: true, name: true, lastName: true, email: true, phone: true },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
