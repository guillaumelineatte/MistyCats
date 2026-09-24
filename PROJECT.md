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
- `prisma/` — schéma + migrations (`migrations/20260416173200_init`, `migrations/20260422170711_add_article_order`).

## Modèles de données (Prisma)

- `User` (rôles ADMIN/CUSTOMER), `Address`, `Article`, `Drop` (regroupement d'articles, feature en cours).
- **Décision à prendre plus tard** : `Article.price` est un `Float`, pas des centimes entiers comme le demandent les règles d'ingénierie de la mission en cours. Migration à part entière si on veut corriger — pas fait en phase 0, une seule ligne de données réelle actuellement donc le risque est faible le jour où on le fera.

## Base de données réelle — attention, piège identifié

Le compte Neon associé à ce Vercel contient **plusieurs projets aux noms très proches** :
`mistycates` (la bonne, tables Prisma `Article`/`User`/`Address`/`Drop`), `MistyCatss` (double s, schéma Drizzle
totalement différent, sans rapport avec ce dépôt). Une confusion entre les deux a cassé la prod plus tôt dans la
session. **Toujours vérifier `get_database_tables` avant de brancher une connection string.** Le projet Neon correct
est `mistycates` (id `square-fire-43209862`).

État réel de la base au 24/09/2026 : **1 seul article publié** ("ZOZO", boucles d'oreilles, image hébergée chez
`bijouxbaume.com` — un concurrent), **0 drop**, table `User`/`Address` non auditées en détail (hors périmètre phase 0).

## Infrastructure — points sensibles identifiés en phase 0

- **Upload d'images cassé en production** : `app/api/upload/route.ts` écrit sur le système de fichiers local
  (`public/uploads` via `fs/promises`). Sur Vercel, le système de fichiers de déploiement est en lecture seule
  (hors `/tmp`, non persistant). Cet upload ne fonctionnera pas en prod telle quelle. À corriger avant de pouvoir
  publier de vraies photos (lot 1.1) — probablement via un stockage blob (Vercel Blob ou équivalent), à trancher
  au moment de l'implémentation.
- **`next.config.mjs`** a `typescript.ignoreBuildErrors: true` — le build ignore actuellement toutes les erreurs de
  type. Contredit directement la règle d'ingénierie « TypeScript strict, aucun `any` ». À retirer, ce qui va très
  probablement faire apparaître des erreurs de type existantes à corriger (lot 6, ou plus tôt si ça bloque un lot).
- **Aucun test n'existe dans le projet** (pas de `test` script, pas de framework de test installé). Le lot 2 exige un
  test E2E de liens morts, et les règles d'ingénierie exigent `pnpm test` (`npm test` ici) en fin de lot. Un
  framework de test devra être choisi et installé au lot 1 ou 2 (Playwright est le choix naturel pour un test E2E de
  parcours de liens).
- **Aucun script `typecheck`** dans `package.json`. À ajouter (`tsc --noEmit`).
- **Images** : la majorité des visuels du site utilisent `<img>` brut, pas `next/image` — `next.config.mjs` a de
  toute façon `images.unoptimized: true`. Un `remotePatterns` seul ne suffira donc pas à bloquer les domaines
  externes ; la garde demandée en 1.1 doit être un test/script dédié, pas seulement la config Next.

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
