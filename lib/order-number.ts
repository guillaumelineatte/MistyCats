import type { Prisma } from "@prisma/client"

/** Compteur atomique par année, incrémenté dans la même transaction que la commande. */
export async function generateOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear()
  const key = `order-${year}`

  const counter = await tx.counter.upsert({
    where: { key },
    create: { key, value: 1 },
    update: { value: { increment: 1 } },
  })

  return `CMD-${year}-${String(counter.value).padStart(4, "0")}`
}
