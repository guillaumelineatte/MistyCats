import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { addressSchema } from "@/lib/validations/auth"

type Params = Promise<{ type: string }>

function parseType(raw: string) {
  const t = raw.toUpperCase()
  if (t === "SHIPPING" || t === "BILLING") return t as "SHIPPING" | "BILLING"
  return null
}

export async function GET(req: Request, { params }: { params: Params }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { type: rawType } = await params
  const type = parseType(rawType)
  if (!type) return NextResponse.json({ error: "Type invalide" }, { status: 400 })

  const address = await prisma.address.findUnique({
    where: { userId_type: { userId: session.user.id, type } },
  })

  return NextResponse.json(address ?? null)
}

export async function PUT(req: Request, { params }: { params: Params }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { type: rawType } = await params
  const type = parseType(rawType)
  if (!type) return NextResponse.json({ error: "Type invalide" }, { status: 400 })

  try {
    const body = await req.json()
    const result = addressSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides", details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { firstName, lastName, street, complement, postalCode, city, country, phone } =
      result.data

    const address = await prisma.address.upsert({
      where: { userId_type: { userId: session.user.id, type } },
      create: {
        type,
        firstName,
        lastName,
        street,
        complement: complement || null,
        postalCode,
        city,
        country,
        phone: phone || null,
        userId: session.user.id,
      },
      update: {
        firstName,
        lastName,
        street,
        complement: complement || null,
        postalCode,
        city,
        country,
        phone: phone || null,
      },
    })

    return NextResponse.json(address)
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
