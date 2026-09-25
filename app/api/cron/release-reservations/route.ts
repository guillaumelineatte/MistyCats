import { NextRequest, NextResponse } from "next/server"
import { releaseExpiredReservations } from "@/lib/inventory"

// GET /api/cron/release-reservations — appelée par Vercel Cron (voir vercel.json).
// Idempotente : ne touche que les pièces RESERVED dont reservedUntil est dépassé.
// Une fois par jour seulement : le plan Hobby de Vercel limite les cron jobs à une
// exécution quotidienne. Ce n'est pas un problème de correction — reserveArticleForCart
// et markArticleSold (lib/inventory.ts) récupèrent déjà une réservation expirée à la
// volée dès qu'une autre cliente essaie de la prendre ou de payer. Ce cron ne fait que
// nettoyer le statut affiché pour les pièces que personne n'a retentées entre-temps.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const released = await releaseExpiredReservations()
  return NextResponse.json({ success: true, released })
}
