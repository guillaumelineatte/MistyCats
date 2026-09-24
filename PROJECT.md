# PROJECT.md

> Documentation vivante du projet : stack, conventions, état des lieux, journal de décisions.

## Stack

- **Framework** : Next.js 16.2.2 (App Router), React 19.2, TypeScript 5
- **Style** : Tailwind CSS v4 (`@theme inline`, tokens OKLCH dans `app/globals.css`), shadcn/ui (`components/ui/*`)
- **Base de données** : PostgreSQL (Neon), Prisma ORM 7.6 (`prisma/schema.prisma`)
- **Auth** : NextAuth v5 beta.30, provider Credentials (email/mot de passe), sessions JWT
- **Email** : nodemailer (SMTP), utilisé uniquement pour la réinitialisation de mot de passe (`lib/email.ts`)
- **Déploiement** : Vercel (projet `mistycats`, org `lineatteg-gmailcoms-projects`)
- **Package manager** : npm (`package-lock.json`) — pas pnpm, malgré la convention pnpm mentionnée dans certains briefs de mission
- **Origine** : projet initialement généré via v0.dev (`package.json` name: `my-v0-project`)

## Structure

- `app/` — routes App Router. Groupe `(admin)` pour l'espace admin protégé.
- `components/` — composants métier ; `components/ui/` = bibliothèque shadcn (ne pas modifier la logique interne sans raison forte).
- `lib/` — `auth.ts`/`auth.config.ts` (NextAuth), `prisma.ts` (client), `email.ts` (SMTP), `validations/*` (schémas Zod).
- `prisma/` — schéma + migrations. La plus récente, `20260924221500_commerce_schema`, porte le modèle e-commerce
  complet (voir décision D3).

## Mission en cours (24/09/2026) — site marchand complet

Nouvelle mission reçue : transformer le site en boutique opérationnelle (compte client, panier avec
réservation de pièce unique, tunnel de commande + paiement simulé, suivi de livraison, admin riche).
La mission supposait à tort qu'aucun back-end n'existait et imposait Drizzle/Better Auth/Resend —
décision utilisateur (voir D2) : on **garde et prolonge la stack existante** (Prisma/NextAuth/nodemailer)
plutôt que de tout réécrire. Plan détaillé phase par phase dans le plan de session (10 phases, cf. lots
ci-dessous pour la numérotation historique de phase 0).

## Modèles de données (Prisma)

- `User` (rôles ADMIN/CUSTOMER, `emailVerified`, `tokenVersion` pour invalidation de session),
  `Address`, `Category` (slug/nom/ordre), `Article` (= la pièce, voir D3), `ArticleImage` (multi-image),
  `Drop` (regroupement marketing d'articles), `Cart`/`CartItem` (réservation pièce unique),
  `Order`/`OrderItem` (instantané figé au moment de l'achat), `Shipment`/`ShipmentEvent`, `Payment`,
  `ContactMessage`, `CustomRequest`, `VerificationToken`, `RateLimitHit`, `Counter`.
- `Article.priceCents` : centimes entiers (`Int`), plus jamais de `Float` — voir `lib/money.ts`.

## Base de données réelle — attention, piège identifié

Le compte Neon associé à ce Vercel contient **plusieurs projets aux noms très proches** :
`mistycates` (la bonne, tables Prisma `Article`/`User`/`Address`/`Drop`), `MistyCatss` (double s, schéma Drizzle
totalement différent, sans rapport avec ce dépôt). Une confusion entre les deux a cassé la prod plus tôt dans la
session. **Toujours vérifier `get_database_tables` avant de brancher une connection string.** Le projet Neon correct
est `mistycates` (id `square-fire-43209862`).

État réel de la base au 24/09/2026 : **1 seul article publié** ("ZOZO", boucles d'oreilles, image hébergée chez
`bijouxbaume.com` — un concurrent), **0 drop**, table `User`/`Address` non auditées en détail (hors périmètre phase 0).

## Infrastructure — état actuel

- **Upload d'images** : `app/api/upload/route.ts` utilise Vercel Blob (`@vercel/blob`, store public
  `mistycats-uploads`, `BLOB_READ_WRITE_TOKEN` fourni par `vercel env pull`). Fonctionne en local et en
  prod. Le garde-fou `scripts/check-image-domains.ts` (branché dans `npm run build`) autorise les images
  locales (`/public`) et le domaine `*.public.blob.vercel-storage.com`, bloque tout le reste.
- **`next.config.mjs`** a toujours `typescript.ignoreBuildErrors: true` (le build ignore les erreurs de
  type — le `npm run typecheck` séparé, lui, est strict et fait partie de la gate de chaque phase). Pas
  encore retiré : laissé pour une phase de nettoyage dédiée plutôt que risquer de bloquer un build Vercel
  en cours de mission sur un flag de config sans rapport avec la phase en cours.
- **Tests** : Vitest installé (`npm test`), premier test sur `lib/money.ts`. Playwright pas encore
  installé (prévu dès qu'un parcours à tester existe — panier/checkout).
- `npm run typecheck` (`tsc --noEmit`) existe.
- **Turbopack + `next dev`** : un `package-lock.json` existe aussi dans `~/Documents/Projets` (hors de ce
  dépôt), ce qui faisait échouer la résolution de `tailwindcss` en dev (Turbopack déduisait la mauvaise
  racine de workspace). Fixé avec `turbopack.root` explicite dans `next.config.mjs`. `next build` n'était
  pas affecté (déjà vert avant le fix).

## Conventions observées

- Tout le texte visible est en français — déjà respecté partout.
- `Link` (next/link) pour la navigation interne, ancres gérées à la main avec scroll animé custom dans `header.tsx`.
- Formulaires : `react-hook-form` + `zodResolver` + schémas dans `lib/validations/`.
- Design tokens centralisés dans `app/globals.css` (OKLCH), palette chaude/élégante, coins arrondis (`--radius`),
  ombres douces. **Direction visuelle actuelle = template élégant conventionnel**, potentiellement à réaligner sur
  une direction maximaliste vintage — décision utilisateur en attente, voir lot 5 de la mission en cours.

## Journal de décisions

- **D1 (24/09/2026)** — Confirmé que la revendication « le menu affiche littéralement `/login` comme texte de lien »
  (mission, point 2.2) ne se vérifie pas dans le code actuel : le lien compte utilisateur de `header.tsx` utilise une
  icône avec `aria-label="Mon compte"`, aucun texte `/login` visible nulle part dans le code. Noté dans `AUDIT.md`,
  pas de correctif appliqué faute de bug reproductible — à re-vérifier si l'utilisateur pointe vers un endroit précis.
- **D2 (24/09/2026)** — Nouvelle mission « site marchand complet » reçue, en contradiction avec l'état réel du dépôt
  (elle suppose l'absence de back-end et impose Drizzle/Better Auth/Resend). Décision utilisateur : prolonger la
  stack existante (Prisma/NextAuth/nodemailer) plutôt que tout réécrire. Rien de ce qui fonctionnait n'est jeté.
- **D3 (24/09/2026, phase 1)** — La contrainte « pièce unique » a forcé une refonte transverse du modèle `Article` :
  `stock`/`published` (Boolean) → `status` (`DRAFT|ONLINE|RESERVED|SOLD|ARCHIVED`), `price` (Float) → `priceCents`
  (Int), `category` (String libre) → `categoryId` (FK vers une vraie table `Category`), `image` (String unique) →
  `ArticleImage[]` (multi-image, upload Vercel Blob). Migration `20260924221500_commerce_schema` : additive +
  backfill de la donnée réelle existante (l'article "ZOZO"), aucun reset. Nom de table conservé (`Article`, pas
  `Product`) — changement cosmétique à fort risque pour un gain nul. La suppression d'un article dans l'admin est
  désormais un archivage (`status = ARCHIVED`), jamais une suppression physique ; la contrainte FK `Restrict` sur
  `OrderItem.articleId` empêchera toute suppression réelle d'une pièce déjà vendue une fois les commandes en place
  (phase 5). Compte admin (`admin@mistycats.fr`) créé/mis à jour via `npm run db:seed:admin` (idempotent, lit
  `ADMIN_EMAIL`/`ADMIN_PASSWORD`).
