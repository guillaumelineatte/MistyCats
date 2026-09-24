import { fileURLToPath } from "node:url"

const projectRoot = fileURLToPath(new URL(".", import.meta.url))

// 'unsafe-eval' uniquement en dev : le HMR de Next.js (webpack eval) en a besoin,
// jamais nécessaire en production.
const isDev = process.env.NODE_ENV !== "production"
const csp = [
  "default-src 'self'",
  // va.vercel-scripts.com : @vercel/analytics (components/layout.tsx) charge son
  // script depuis là en dev ; en prod sur Vercel il est servi en same-origin,
  // mais l'autoriser explicitement ne coûte rien et évite un piège en dev.
  `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.public.blob.vercel-storage.com",
  "font-src 'self' data:",
  "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ")

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Règle d'ingénierie du projet : TypeScript strict, aucune erreur ignorée
  // au build (npm run typecheck est vert en continu depuis la phase 1).
  typescript: {
    ignoreBuildErrors: false,
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ]
  },
}

export default nextConfig
