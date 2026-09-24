import "dotenv/config"
import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  // Ces tests tournent contre la vraie base Neon (pas de branche de test éphémère
  // dans ce projet) via une connexion non poolée : en parallèle, plusieurs
  // connexions simultanées (login, requêtes DB par page) saturent le pool et
  // font timeout des requêtes sans rapport avec le code testé. Un seul worker.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run build && npm run start -- -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 180_000,
    env: { ...process.env, AUTH_URL: "http://localhost:3100" } as Record<string, string>,
  },
})
