import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { contactSchema } from "@/lib/validations/contact"
import { sendNewContactMessageNotification } from "@/lib/email"
import { siteConfig } from "@/lib/site-config"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const result = contactSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Données invalides", details: result.error.flatten().fieldErrors }, { status: 400 })
  }

  const ip = getClientIp(req)
  const ok = await checkRateLimit(`contact:ip:${ip}`, { max: 5, windowSeconds: 3600 })
  if (!ok) {
    return NextResponse.json({ error: "Trop de messages envoyés, réessayez plus tard." }, { status: 429 })
  }

  const session = await auth()

  const message = await prisma.contactMessage.create({
    data: { ...result.data, subject: result.data.subject || null, userId: session?.user?.id ?? null },
  })

  await sendNewContactMessageNotification(siteConfig.contact.email, {
    name: message.name,
    email: message.email,
    subject: message.subject,
    message: message.message,
  })

  return NextResponse.json({ success: true }, { status: 201 })
}
