/**
 * Garde-fou lot 1.1 : échoue si une image (code ou base) pointe vers un
 * domaine externe. Toutes les images du projet doivent être servies depuis
 * /public, le store Vercel Blob du projet (uploads admin, voir
 * app/api/upload/route.ts), ou un domaine explicitement listé ci-dessous.
 * Ajuster ALLOWED_HOSTS / ALLOWED_HOST_SUFFIXES uniquement si un domaine
 * externe devient réellement nécessaire (jamais par convenance).
 */
import "dotenv/config"
import { readFileSync } from "node:fs"
import { readdirSync, statSync } from "node:fs"
import { join, extname } from "node:path"
import { prisma } from "../lib/prisma"

const ALLOWED_HOSTS: string[] = []
// Vercel Blob attribue un sous-domaine par store (ex. edu2bv6f40pgh69n.public.blob.vercel-storage.com) :
// on autorise le domaine par suffixe plutôt qu'en dur, pour survivre à une recréation du store.
const ALLOWED_HOST_SUFFIXES: string[] = [".public.blob.vercel-storage.com"]

const SCAN_DIRS = ["app", "components"]
const SCAN_EXT = new Set([".ts", ".tsx"])
const SRC_URL_RE = /(?:src|coverImage|image)\s*=?\s*[{"'`]\s*(https?:\/\/[^\s"'`}]+)/g

function isAllowed(url: string): boolean {
  try {
    const host = new URL(url).host
    return ALLOWED_HOSTS.includes(host) || ALLOWED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))
  } catch {
    return false
  }
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      walk(full, out)
    } else if (SCAN_EXT.has(extname(full))) {
      out.push(full)
    }
  }
  return out
}

function scanCode(): string[] {
  const violations: string[] = []
  for (const dir of SCAN_DIRS) {
    for (const file of walk(dir)) {
      const content = readFileSync(file, "utf8")
      for (const match of content.matchAll(SRC_URL_RE)) {
        const url = match[1]
        if (!isAllowed(url)) {
          violations.push(`${file} → ${url}`)
        }
      }
    }
  }
  return violations
}

async function scanDatabase(): Promise<string[]> {
  const violations: string[] = []

  const images = await prisma.articleImage.findMany({
    where: { url: { startsWith: "http" } },
    select: { id: true, url: true, article: { select: { title: true } } },
  })
  for (const img of images) {
    if (!isAllowed(img.url)) {
      violations.push(`Article "${img.article.title}" (image ${img.id}) → ${img.url}`)
    }
  }

  const drops = await prisma.drop.findMany({
    where: { coverImage: { startsWith: "http" } },
    select: { id: true, name: true, coverImage: true },
  })
  for (const d of drops) {
    if (d.coverImage && !isAllowed(d.coverImage)) {
      violations.push(`Drop "${d.name}" (${d.id}) → ${d.coverImage}`)
    }
  }

  return violations
}

async function main() {
  const codeViolations = scanCode()
  const dbViolations = await scanDatabase()
  const violations = [...codeViolations, ...dbViolations]

  if (violations.length > 0) {
    console.error("Images hébergées sur un domaine externe non autorisé :\n")
    for (const v of violations) console.error(`  - ${v}`)
    console.error(
      "\nToutes les images doivent être locales (/public) ou uploadées via /api/upload (Vercel Blob). " +
        "Corrige la source, ou ajoute le domaine à ALLOWED_HOSTS/ALLOWED_HOST_SUFFIXES dans scripts/check-image-domains.ts si réellement nécessaire.",
    )
    process.exit(1)
  }

  console.log("✓ Aucune image externe non autorisée détectée (code + base).")
}

main()
  .catch((err) => {
    console.error("Échec du contrôle des domaines d'images :", err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
