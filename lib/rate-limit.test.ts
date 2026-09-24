import "dotenv/config"
import { afterAll, describe, expect, it } from "vitest"
import { prisma } from "./prisma"
import { checkRateLimit, getClientIp } from "./rate-limit"

describe("rate-limit", () => {
  const key = `test:rate-limit:${Date.now()}`

  afterAll(async () => {
    await prisma.rateLimitHit.deleteMany({ where: { key } })
    await prisma.$disconnect()
  })

  it("allows requests under the limit and blocks past it", async () => {
    for (let i = 0; i < 3; i++) {
      expect(await checkRateLimit(key, { max: 3, windowSeconds: 60 })).toBe(true)
    }
    expect(await checkRateLimit(key, { max: 3, windowSeconds: 60 })).toBe(false)
  })

  it("reads the client IP from x-forwarded-for, falling back to unknown", () => {
    const withHeader = new Request("http://localhost", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } })
    expect(getClientIp(withHeader)).toBe("1.2.3.4")

    const withoutHeader = new Request("http://localhost")
    expect(getClientIp(withoutHeader)).toBe("unknown")
  })
})
