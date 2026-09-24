import crypto from "crypto"

/**
 * Vérifie un mot de passe contre l'API k-anonymity de Have I Been Pwned :
 * seul un préfixe de 5 caractères du hash SHA-1 est envoyé, jamais le mot de
 * passe ni son hash complet. Fail-open si l'API est injoignable — un
 * problème réseau ne doit jamais bloquer une inscription.
 */
export async function isPasswordPwned(password: string): Promise<boolean> {
  try {
    const sha1 = crypto.createHash("sha1").update(password).digest("hex").toUpperCase()
    const prefix = sha1.slice(0, 5)
    const suffix = sha1.slice(5)

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return false

    const body = await res.text()
    return body.split("\n").some((line) => line.split(":")[0].trim() === suffix)
  } catch (err) {
    console.warn("[pwned-password] Vérification HIBP indisponible, on continue sans bloquer :", err)
    return false
  }
}
