import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { newsletterSubscribeSchema } from "@/lib/validations/newsletter"
import { sendNewsletterConfirmationEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = newsletterSubscribeSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: "Email ou consentement invalide" }, { status: 400 })
    }

    const { email } = result.data

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } })

    if (existing) {
      if (existing.unsubscribedAt) {
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: { unsubscribedAt: null },
        })
      }
      return NextResponse.json({ success: true })
    }

    const subscriber = await prisma.newsletterSubscriber.create({
      data: { email },
    })

    await sendNewsletterConfirmationEmail(email, subscriber.unsubscribeToken)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
