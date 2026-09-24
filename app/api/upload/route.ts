import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { put } from "@vercel/blob"
import path from "path"

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Format invalide. Utilisez JPG, PNG, WebP ou GIF." },
      { status: 400 }
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Fichier trop lourd (max 5 Mo)" },
      { status: 400 }
    )
  }

  const ext = path.extname(file.name).toLowerCase() || ".jpg"
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`

  const blob = await put(`uploads/${filename}`, file, {
    access: "public",
    contentType: file.type,
  })

  return NextResponse.json({ url: blob.url })
}
