import { fileURLToPath } from "node:url"

const projectRoot = fileURLToPath(new URL(".", import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Un package-lock.json existe aussi dans un dossier parent (hors de ce
  // dépôt) ; sans ce réglage, Turbopack déduit une racine de workspace
  // incorrecte et échoue à résoudre les dépendances en dev.
  turbopack: {
    root: projectRoot,
  },
  images: {
    unoptimized: true,
    // Aucun domaine externe autorisé : toutes les images passent par /public
    // ou /uploads (voir app/api/upload/route.ts). Ajouter ici uniquement un
    // domaine réellement nécessaire, jamais un domaine tiers de convenance.
    remotePatterns: [],
  },
}

export default nextConfig
