import { NextResponse } from "next/server"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"
import { formatCents } from "@/lib/money"
import { siteConfig } from "@/lib/site-config"

interface Address {
  firstName: string
  lastName: string
  street: string
  complement?: string
  postalCode: string
  city: string
  country: string
}

// GET /api/admin/orders/:number/delivery-note — bon de livraison PDF imprimable.
export async function GET(_req: Request, { params }: { params: Promise<{ number: string }> }) {
  const check = await requireAdmin()
  if ("error" in check) return check.error

  const { number } = await params
  const order = await prisma.order.findUnique({ where: { number }, include: { items: true } })
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 })

  const address = order.shippingAddress as unknown as Address

  const pdf = await PDFDocument.create()
  const page = pdf.addPage([595.28, 841.89]) // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  let y = 800
  const left = 50
  const draw = (text: string, opts: { size?: number; bold?: boolean; x?: number } = {}) => {
    page.drawText(text, {
      x: opts.x ?? left,
      y,
      size: opts.size ?? 10,
      font: opts.bold ? bold : font,
      color: rgb(0.1, 0.1, 0.1),
    })
    y -= (opts.size ?? 10) + 8
  }

  draw(siteConfig.brand.name, { size: 20, bold: true })
  draw("Bon de livraison", { size: 12 })
  y -= 10
  draw(`Commande ${order.number}`, { bold: true })
  draw(`Date : ${order.createdAt.toLocaleDateString("fr-FR")}`)
  y -= 10

  draw("Adresse de livraison", { bold: true })
  draw(`${address.firstName} ${address.lastName}`)
  draw(address.street)
  if (address.complement) draw(address.complement)
  draw(`${address.postalCode} ${address.city}`)
  draw(address.country)
  y -= 15

  draw("Articles", { bold: true })
  for (const item of order.items) {
    draw(`${item.titleSnapshot}  —  ${item.skuSnapshot}  —  ${formatCents(item.priceCentsSnapshot)}`, { size: 9 })
  }
  y -= 10
  draw(`Sous-total : ${formatCents(order.subtotalCents)}`, { size: 9 })
  draw(`Livraison : ${formatCents(order.shippingCents)}`, { size: 9 })
  draw(`Total : ${formatCents(order.totalCents)}`, { bold: true })

  const bytes = await pdf.save()

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="bon-livraison-${order.number}.pdf"`,
    },
  })
}
