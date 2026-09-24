import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000"

  const [articles, drops] = await Promise.all([
    prisma.article.findMany({
      where: { status: { in: ["ONLINE", "RESERVED", "SOLD"] } },
      select: { slug: true, updatedAt: true },
    }),
    prisma.drop.findMany({
      where: { published: true },
      select: { id: true, updatedAt: true },
    }),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/boutique`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/boutique/drops`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/cgv`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/confidentialite`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/livraison-retours`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/mentions-legales`, changeFrequency: "yearly", priority: 0.2 },
  ]

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${baseUrl}/boutique/produit/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  const dropRoutes: MetadataRoute.Sitemap = drops.map((d) => ({
    url: `${baseUrl}/boutique/drops/${d.id}`,
    lastModified: d.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }))

  return [...staticRoutes, ...articleRoutes, ...dropRoutes]
}
