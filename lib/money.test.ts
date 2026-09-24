import { describe, expect, it } from "vitest"
import { centsToEuros, eurosToCents, formatCents } from "./money"

describe("money", () => {
  it("converts euros to cents without float drift", () => {
    expect(eurosToCents(30)).toBe(3000)
    expect(eurosToCents(19.9)).toBe(1990)
    expect(eurosToCents(0.1)).toBe(10)
  })

  it("converts cents back to euros", () => {
    expect(centsToEuros(3000)).toBe(30)
    expect(centsToEuros(1990)).toBe(19.9)
  })

  it("formats cents as fr-FR EUR", () => {
    // L'espace utilisée par Intl fr-FR est une espace insécable étroite (U+202F), pas U+0020.
    expect(formatCents(3000)).toMatch(/^30,00.€$/)
    expect(formatCents(1990)).toMatch(/^19,90.€$/)
  })
})
