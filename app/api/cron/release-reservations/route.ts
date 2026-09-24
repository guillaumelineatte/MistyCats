import { NextRequest, NextResponse } from "next/server"
import { releaseExpiredReservations } from "@/lib/inventory"

// GET /api/cron/release-reservations — appelée par Vercel Cron (voir vercel.json).
// Idempotente : ne touche que les pièces RESERVED dont reservedUntil est dépassé.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const released = await releaseExpiredReservations()
  return NextResponse.json({ success: true, released })
}
