import { prisma } from "@/lib/prisma"

/** IP publique du client. Vercel injecte x-forwarded-for ; "unknown" en dernier recours (dev local). */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return req.headers.get("x-real-ip") ?? "unknown"
}

interface RateLimitOptions {
  max: number
  windowSeconds: number
}

/**
 * Fenêtre fixe adossée à Postgres (pas de Redis dans ce projet). `key` doit
 * déjà inclure l'action et l'identifiant (IP, email…) : ex. "login:1.2.3.4".
 * Retourne false si la limite est dépassée — l'appelant décide de la réponse
 * HTTP (429, message générique…).
 */
export async function checkRateLimit(key: string, { max, windowSeconds }: RateLimitOptions): Promise<boolean> {
  const windowMs = windowSeconds * 1000
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs)

  const hit = await prisma.rateLimitHit.upsert({
    where: { key_windowStart: { key, windowStart } },
    create: { key, windowStart, count: 1 },
    update: { count: { increment: 1 } },
  })

  return hit.count <= max
}
