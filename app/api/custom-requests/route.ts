import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { customRequestSchema } from "@/lib/validations/contact"
import { sendNewCustomRequestNotification } from "@/lib/email"
import { siteConfig } from "@/lib/site-config"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const result = customRequestSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Données invalides", details: result.error.flatten().fieldErrors }, { status: 400 })
  }

  const ip = getClientIp(req)
  const ok = await checkRateLimit(`custom-request:ip:${ip}`, { max: 5, windowSeconds: 3600 })
  if (!ok) {
    return NextResponse.json({ error: "Trop de demandes envoyées, réessayez plus tard." }, { status: 429 })
  }

  const session = await auth()

  const customRequest = await prisma.customRequest.create({
    data: { ...result.data, budget: result.data.budget || null, userId: session?.user?.id ?? null },
  })

  await sendNewCustomRequestNotification(siteConfig.contact.email, {
    name: customRequest.name,
    email: customRequest.email,
    description: customRequest.description,
    budget: customRequest.budget,
  })

  return NextResponse.json({ success: true }, { status: 201 })
}
