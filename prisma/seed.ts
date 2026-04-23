import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  const email = process.env.ADMIN_EMAIL ?? "admin@mistycats.fr"
  const password = process.env.ADMIN_PASSWORD ?? "changez-ce-mot-de-passe"

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`Admin déjà existant : ${email}`)
    await pool.end()
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.user.create({
    data: { email, passwordHash, role: "ADMIN" },
  })

  console.log(`✓ Admin créé : ${email}`)
  console.log("  → Changez le mot de passe après la première connexion.")
  await pool.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
