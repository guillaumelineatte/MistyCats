import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "Lien invalide" }, { status: 400 })
  }

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { unsubscribeToken: token },
  })

  if (!subscriber) {
    return NextResponse.json({ error: "Lien invalide" }, { status: 404 })
  }

  await prisma.newsletterSubscriber.update({
    where: { unsubscribeToken: token },
    data: { unsubscribedAt: new Date() },
  })

  return NextResponse.redirect(new URL("/?desinscription=ok", req.url))
}
