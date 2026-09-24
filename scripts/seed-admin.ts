/**
 * Crée ou met à jour le compte administrateur à partir de ADMIN_EMAIL /
 * ADMIN_PASSWORD. Idempotent : relancer ce script écrase le mot de passe de
 * ce compte avec la valeur courante de ADMIN_PASSWORD et force role=ADMIN,
 * emailVerified=true. Aucune route d'inscription n'accorde jamais ce rôle.
 */
import "dotenv/config"
import bcrypt from "bcryptjs"
import { prisma } from "../lib/prisma"

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.error("ADMIN_EMAIL et ADMIN_PASSWORD sont requis (voir .env.example).")
    process.exit(1)
  }
  if (password.length < 12) {
    console.error("ADMIN_PASSWORD doit contenir au moins 12 caractères.")
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
    update: {
      passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  })

  console.log(`Compte admin prêt : ${user.email} (id ${user.id})`)
}

main()
  .catch((err) => {
    console.error("Échec du seed admin :", err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
