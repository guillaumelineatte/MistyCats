/**
 * Toutes les sommes du projet circulent en centimes entiers (Int), jamais en
 * float — seul ce module convertit vers/depuis une représentation humaine.
 */

const formatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
})

export function formatCents(cents: number): string {
  return formatter.format(cents / 100)
}

export function eurosToCents(euros: number): number {
  return Math.round(euros * 100)
}

export function centsToEuros(cents: number): number {
  return cents / 100
}

/** Parse un affichage fr-FR type "4,90 €" (lib/site-config.ts) en centimes entiers. */
export function parseEuroDisplayToCents(display: string): number {
  const normalized = display.replace(/[^\d,.-]/g, "").replace(",", ".")
  return eurosToCents(parseFloat(normalized))
}
