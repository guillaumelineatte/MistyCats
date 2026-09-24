import { test, expect } from "@playwright/test"
import bcrypt from "bcryptjs"
import { prisma } from "../lib/prisma"

/**
 * Une cliente ne doit jamais pouvoir lire la commande d'une autre en changeant
 * l'identifiant dans l'URL. Le numéro de commande est séquentiel (CMD-2026-0001…)
 * donc trivialement devinable — la protection doit venir de la vérification de
 * propriété côté serveur, pas de l'obscurité du numéro.
 */

const OWNER_EMAIL = `e2e-owner-${Date.now()}@example.com`
const INTRUDER_EMAIL = `e2e-intruder-${Date.now()}@example.com`
const PASSWORD = "CorrectHorseBatteryStaple9!"

let orderNumber: string
let categoryId: string
let articleId: string

test.describe("Propriété d'une commande (IDOR)", () => {
  test.beforeAll(async () => {
    const passwordHash = await bcrypt.hash(PASSWORD, 12)

    const owner = await prisma.user.create({
      data: { email: OWNER_EMAIL, passwordHash, role: "CUSTOMER", emailVerified: new Date() },
    })
    await prisma.user.create({
      data: { email: INTRUDER_EMAIL, passwordHash, role: "CUSTOMER", emailVerified: new Date() },
    })

    const category = await prisma.category.create({
      data: { slug: `e2e-cat-${Date.now()}`, name: "E2E" },
    })
    categoryId = category.id

    const article = await prisma.article.create({
      data: {
        slug: `e2e-article-${Date.now()}`,
        sku: `E2E-${Date.now()}`,
        title: "Pièce E2E",
        shortDescription: "test",
        description: "test",
        priceCents: 1000,
        categoryId,
        status: "SOLD",
      },
    })
    articleId = article.id

    const order = await prisma.order.create({
      data: {
        number: `E2E-${Date.now()}`,
        userId: owner.id,
        email: OWNER_EMAIL,
        shippingAddress: { firstName: "A", lastName: "B", street: "x", postalCode: "75000", city: "Paris", country: "France" },
        billingAddress: { firstName: "A", lastName: "B", street: "x", postalCode: "75000", city: "Paris", country: "France" },
        shippingMethod: "Test",
        subtotalCents: 1000,
        shippingCents: 0,
        totalCents: 1000,
        status: "PAID",
        items: { create: { articleId, titleSnapshot: "Pièce E2E", skuSnapshot: "E2E", priceCentsSnapshot: 1000 } },
      },
    })
    orderNumber = order.number
  })

  test.afterAll(async () => {
    await prisma.orderItem.deleteMany({ where: { order: { number: orderNumber } } })
    await prisma.order.deleteMany({ where: { number: orderNumber } })
    await prisma.article.deleteMany({ where: { id: articleId } })
    await prisma.category.deleteMany({ where: { id: categoryId } })
    await prisma.user.deleteMany({ where: { email: { in: [OWNER_EMAIL, INTRUDER_EMAIL] } } })
    await prisma.$disconnect()
  })

  test("la propriétaire voit sa commande", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("Email").fill(OWNER_EMAIL)
    await page.getByLabel("Mot de passe", { exact: true }).fill(PASSWORD)
    await page.getByRole("button", { name: "Se connecter" }).click()
    await expect(page).toHaveURL(/\/mon-compte/)

    await page.goto(`/mon-compte/commandes/${orderNumber}`)
    await expect(page.getByText(orderNumber)).toBeVisible()
  })

  test("une autre cliente ne peut pas lire cette commande via l'URL", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("Email").fill(INTRUDER_EMAIL)
    await page.getByLabel("Mot de passe", { exact: true }).fill(PASSWORD)
    await page.getByRole("button", { name: "Se connecter" }).click()
    await expect(page).toHaveURL(/\/mon-compte/)

    const res = await page.goto(`/mon-compte/commandes/${orderNumber}`)
    expect(res?.status()).toBe(404)
    await expect(page.getByText(orderNumber)).not.toBeVisible()
  })
})
