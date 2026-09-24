import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import type { VerificationTokenType } from "@prisma/client"

const TOKEN_BYTES = 32

function hashToken(rawToken: string) {
  return crypto.createHash("sha256").update(rawToken).digest("hex")
}

/**
 * Crée un token à usage unique (email de vérification ou reset de mot de
 * passe). Le token brut n'est renvoyé qu'une fois, ici, pour partir dans
 * l'email — seul son hash est stocké en base.
 */
export async function createVerificationToken(
  userId: string,
  type: VerificationTokenType,
  ttlMs: number
) {
  const rawToken = crypto.randomBytes(TOKEN_BYTES).toString("hex")

  // Un seul token actif par utilisateur et par type : on invalide les précédents.
  await prisma.verificationToken.deleteMany({ where: { userId, type, usedAt: null } })

  await prisma.verificationToken.create({
    data: {
      userId,
      type,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + ttlMs),
    },
  })

  return rawToken
}

/**
 * Vérifie un token brut reçu (lien email). Le marque comme utilisé s'il est
 * valide. Retourne l'userId ou null si invalide/expiré/déjà utilisé.
 */
export async function consumeVerificationToken(
  rawToken: string,
  type: VerificationTokenType
): Promise<string | null> {
  const tokenHash = hashToken(rawToken)

  const record = await prisma.verificationToken.findUnique({ where: { tokenHash } })
  if (!record || record.type !== type || record.usedAt || record.expiresAt < new Date()) {
    return null
  }

  await prisma.verificationToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  })

  return record.userId
}
