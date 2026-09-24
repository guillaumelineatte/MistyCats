# Misty Cats

Boutique en ligne de bijoux artisanaux upcyclés — chaque pièce est unique.
Next.js (App Router) + TypeScript + Prisma/PostgreSQL (Neon) + NextAuth v5.

Documentation technique complète, conventions et journal de décisions :
voir [`PROJECT.md`](./PROJECT.md). État fonctionnel détaillé, écran par écran :
voir [`AUDIT.md`](./AUDIT.md).

## Prérequis

- Node.js 20+
- Un projet Neon (PostgreSQL) — voir [neon.com](https://neon.com)
- Un compte Vercel avec le CLI installé (`npm i -g vercel`) pour Vercel Blob et
  les variables d'environnement

## Installation

```bash
npm install
cp .env.example .env
```

Renseignez `.env` (voir les commentaires dans `.env.example` pour chaque
variable) : `DATABASE_URL` (Neon), `AUTH_SECRET` (`openssl rand -base64 32`),
`AUTH_URL`, `ADMIN_EMAIL`/`ADMIN_PASSWORD`, `CRON_SECRET` et
`PAYMENT_WEBHOOK_SECRET` (`openssl rand -hex 32` chacun).

Si le projet est lié à Vercel (`vercel link`), `BLOB_READ_WRITE_TOKEN` est
récupéré automatiquement :

```bash
vercel env pull .env.local
```

### Base de données

```bash
npx prisma migrate deploy   # applique les migrations
npm run db:seed:admin       # crée/synchronise le compte admin (idempotent)
```

### Lancer en développement

```bash
npm run dev
```

Sans `SMTP_HOST` configuré, les emails transactionnels sont écrits en console
et dans un fichier HTML sous `os.tmpdir()/mistycats-mail` — jamais dans le
dépôt. Sans provisionner Vercel Blob, l'upload d'images échouera ; pour tester
en local sans Blob, provisionnez un store (`vercel blob create-store <nom>
--access public`) puis `vercel env pull`.

## Commandes utiles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production (garde-fou images + Prisma + Next.js) |
| `npm run typecheck` | `tsc --noEmit`, strict |
| `npm run lint` | ESLint |
| `npm test` | Tests unitaires (Vitest) — contre la vraie base Neon, pas de DB de test dédiée |
| `npm run test:e2e` | Tests end-to-end (Playwright) — build + serveur réel sur le port 3100 |
| `npm run db:migrate` | Nouvelle migration Prisma (dev) |
| `npm run db:seed:admin` | Crée/synchronise le compte admin depuis `.env` |
| `npm run db:studio` | Prisma Studio |
| `npm run guard:images` | Vérifie qu'aucune image externe non autorisée n'est référencée (code + base) |

## Déploiement (Vercel)

1. `vercel link` puis renseigner les variables d'environnement de production
   (`vercel env add <NOM>`) — mêmes clés que `.env.example`.
2. Provisionner Vercel Blob (`vercel blob create-store ... --access public`) et
   relier le store au projet.
3. `npx prisma migrate deploy` contre la base de production avant le premier
   déploiement (ou via une étape de build dédiée).
4. Le cron de libération des réservations expirées (`vercel.json`, toutes les
   5 minutes) est actif automatiquement dès le déploiement.
5. Configurer `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`SMTP_FROM` pour
   un envoi d'email réel — sans ça, les emails restent en mode dégradé
   (fonctionnel mais silencieux pour les destinataires réels).

Le déploiement lui-même (`vercel deploy` / `vercel --prod`) n'est jamais
déclenché automatiquement par un agent travaillant sur ce dépôt.
