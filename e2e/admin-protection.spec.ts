import { test, expect } from "@playwright/test"
import { prisma } from "../lib/prisma"

/**
 * Protection en profondeur de /admin : proxy.ts (middleware) ET requireAdmin()
 * (chaque page/route) doivent tous les deux refuser l'accès. Ce test vérifie
 * le comportement observable de bout en bout, pas juste l'un des deux mécanismes.
 */

const TEST_EMAIL = `e2e-customer-${Date.now()}@example.com`
const TEST_PASSWORD = "CorrectHorseBatteryStaple9!"

test.describe("Protection de /admin", () => {
  test.afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: TEST_EMAIL } })
    await prisma.$disconnect()
  })

  test("un visiteur anonyme est redirigé vers /admin/login", async ({ page }) => {
    await page.goto("/admin/articles")
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test("une route API admin refuse une requête anonyme (401)", async ({ request }) => {
    const res = await request.post("/api/articles", { data: {} })
    expect(res.status()).toBe(401)
  })

  test("une cliente connectée (CUSTOMER) est refusée sur /admin et sur l'API", async ({ page, request, context }) => {
    // Inscription + connexion d'une cliente jetable pour ce test.
    const registerRes = await request.post("/api/auth/register", {
      data: {
        name: "E2E",
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
      },
    })
    expect(registerRes.ok()).toBeTruthy()

    await page.goto("/login")
    await page.getByLabel("Email").fill(TEST_EMAIL)
    await page.getByLabel("Mot de passe", { exact: true }).fill(TEST_PASSWORD)
    await page.getByRole("button", { name: "Se connecter" }).click()
    await expect(page).toHaveURL(/\/mon-compte/)

    // Page admin : redirigée, jamais le contenu admin.
    await page.goto("/admin/articles")
    await expect(page).toHaveURL(/\/admin\/login/)

    // Route API admin : 403 (authentifiée mais pas admin), pas 401.
    const cookies = await context.cookies()
    const apiRes = await request.post("/api/articles", {
      data: {},
      headers: { cookie: cookies.map((c) => `${c.name}=${c.value}`).join("; ") },
    })
    expect(apiRes.status()).toBe(403)
  })
})
