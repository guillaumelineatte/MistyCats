# PROJECT.md

> Documentation vivante du projet : stack, conventions, état des lieux, journal de décisions.

## Stack

- **Framework** : Next.js 16.2.2 (App Router), React 19.2, TypeScript 5
- **Style** : Tailwind CSS v4 (`@theme inline`, tokens OKLCH dans `app/globals.css`), shadcn/ui (`components/ui/*`)
- **Base de données** : PostgreSQL (Neon), Prisma ORM 7.6 (`prisma/schema.prisma`)
- **Auth** : NextAuth v5 beta.30, provider Credentials (email/mot de passe), sessions JWT
- **Email** : nodemailer (SMTP), layout HTML partagé (`lib/email.ts`) ; sans `SMTP_HOST`, écrit dans
  `os.tmpdir()/mistycats-mail` + console (jamais dans le dépôt, filesystem Vercel en lecture seule)
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
- **D4 (24/09/2026, phase 2)** — Durcissement auth complet, vérifié en conditions réelles (inscription, lien de
  vérification, réutilisation rejetée, rate limit, HIBP — contre la vraie base Neon, comptes de test nettoyés
  ensuite). `User.resetToken`/`resetTokenExpiry` (clair) supprimés, remplacés par `VerificationToken` (hashé SHA-256,
  usage unique, expirant, un seul actif par type/utilisateur). Mot de passe : 12 caractères minimum (au lieu de 8),
  + vérification k-anonymity contre l'API Have I Been Pwned (`lib/pwned-password.ts`, fail-open si l'API est
  injoignable — jamais bloquant sur un problème réseau). Rate limiting maison sur `RateLimitHit` (Postgres, fenêtre
  fixe, pas de Redis) : login (10/5 min par IP et par email), inscription (5/h par IP), reset et renvoi de
  vérification. `User.tokenVersion` incrémenté à chaque changement de mot de passe → `lib/session-freshness.ts`
  (`isSessionFresh`) revérifie ce compteur dans les routes sensibles déjà en place (`/api/user/password`,
  `/api/user/profile`, `/api/user/address/[type]`) ; la page de changement de mot de passe déconnecte
  immédiatement l'utilisateur après succès (JWT devenu périmé). Changer d'email dans le profil réinitialise
  `emailVerified` et renvoie un email de confirmation. CSRF : cookie de session `sameSite: "lax"` + `httpOnly` +
  `secure` (prod) explicite dans `lib/auth.config.ts` — pas de librairie de token CSRF séparée (voir raisonnement
  dans le plan de session). Événements loggés en JSON sur stdout (`lib/auth-log.ts`) : register, login
  success/failure, email vérifié, password reset demandé/complété, password changé.
- **D5 (24/09/2026, phase 3)** — Dernières données en dur remplacées par de vraies requêtes : compteurs de
  catégories sur l'accueil (`components/categories.tsx`, prenait 24/18/15 en dur), image de catégorie = première
  image d'une pièce `ONLINE` de cette catégorie. Fiche produit publique créée
  (`app/boutique/produit/[slug]/page.tsx`, absente jusqu'ici — `AUDIT.md` lot 4.1), avec `generateMetadata` +
  JSON-LD `Product`, galerie multi-image, champs métier (histoire, matières, dimensions, longueur de chaîne, poids).
  Cartes produit (`components/product-card.tsx`) rendues cliquables (lien vers la fiche, jusqu'ici `cursor-pointer`
  sans action). Bouton panier présent mais désactivé sur la fiche produit — branché en phase 4, même logique que
  `/mon-compte/commandes` (« Bientôt », choix assumé plutôt qu'un bouton mort). `app/sitemap.ts`/`app/robots.ts`
  ajoutés (absents jusqu'ici), balise `keywords` retirée (ignorée par les moteurs), Open Graph/Twitter Card ajoutés
  dans `app/layout.tsx`. Vérifié contre la vraie base (fiche ZOZO, compteurs réels, sitemap/robots 200).
- **D6 (24/09/2026, phase 4)** — Panier + réservation pièce unique (`lib/inventory.ts`). Verrou
  `SELECT ... FOR UPDATE` sur la ligne `Article` dans une transaction Prisma interactive, à la fois à la réservation
  (`reserveArticleForCart`) et à la vente (`markArticleSold`, utilisé par le webhook de paiement en phase 5) :
  deux tentatives concurrentes sur la même pièce ne peuvent jamais toutes les deux réussir. `CartItem.articleId`
  est `@unique` — deuxième filet de sécurité au niveau contrainte DB, une pièce ne peut être dans deux paniers à
  la fois. Réservation expirée récupérable immédiatement (lazy expiry) sans attendre le cron ; re-ajout par le
  panier qui détient déjà la pièce = prolongation, pas une nouvelle réservation. Panier anonyme via cookie
  httpOnly (`lib/cart-session.ts`), fusionné dans le panier utilisateur à la connexion
  (`POST /api/cart/merge`, appelé juste après `signIn()`). Cron Vercel toutes les 5 min
  (`vercel.json` → `/api/cron/release-reservations`, protégé par `CRON_SECRET`) qui libère les réservations
  expirées. `lib/inventory.test.ts` : deux tests de concurrence réels (réservation, vente) qui lancent deux
  transactions en parallèle sur la même pièce via `Promise.all` contre la vraie base Neon — un seul gagne à
  chaque fois, vérifié en conditions réelles (pas mocké), données de test nettoyées dans `afterAll`. Bouton
  « Ajouter au panier » de la fiche produit branché pour de vrai (état désactivé de la phase 3 remplacé).
  Icône panier du header affiche maintenant un vrai compteur (`lib/cart-events.ts`, bus d'événements léger,
  pas de state manager global). Page `/panier` avec compte à rebours par pièce. Le bouton « Passer commande »
  reste un stub (toast) — tunnel de commande réel en phase 5, juste après.
- **D7 (24/09/2026, phase 5)** — Tunnel de commande (`/commande`, 3 étapes : coordonnées → livraison →
  récapitulatif/paiement) + paiement simulé. `lib/payment/types.ts` définit l'interface `PaymentProvider`
  (`createIntent`, `confirm`, `refund`, `handleWebhook`) ; `lib/payment/mock-payment.ts` l'implémente. La commande
  n'est **jamais** confirmée par la route qui reçoit la carte : `POST /api/orders` crée la commande en
  `PENDING_PAYMENT` + un `Payment` `PENDING` (numéro atomique via `lib/order-number.ts`, table `Counter`) ;
  `POST /api/payments/:ref/confirm` déclenche `MockPaymentProvider.confirm()`, qui fait un aller-retour HTTP signé
  HMAC (`PAYMENT_WEBHOOK_SECRET`) vers `POST /api/payments/webhook` — seul endroit qui appelle
  `markArticleSold` et passe la commande à `PAID` (`lib/payment/apply-outcome.ts`, idempotent : un webhook
  rejoué sur un paiement déjà traité est un no-op, vérifié en conditions réelles). 4 cartes de test
  (acceptée/refusée/fonds insuffisants/délai 5s) implémentées exactement comme spécifié. Un paiement refusé
  laisse la pièce `RESERVED` (la cliente peut réessayer) ; le webhook applique lui-même un filet de sécurité
  (transaction + `markArticleSold` re-vérifié) si une pièce devenait indisponible entre la commande et le
  paiement. Commande invité autorisée (`Order.userId` nullable) ; email vérifié obligatoire uniquement pour
  les comptes connectés, pas de barrière pour les invités. Vérifié en conditions réelles contre la vraie base
  (Neon) et un vrai serveur dev : réservation → commande → paiement accepté → `PAID`/`SOLD`/email envoyé,
  paiement refusé → `PENDING_PAYMENT`/`RESERVED` conservés, re-confirmation rejetée (409), rejeu du webhook
  sans double traitement, signature invalide rejetée. Toutes les données de test nettoyées après coup.
  **Points à modifier pour brancher Stripe plus tard** (aucun autre fichier ne doit changer) :
  1. Nouvelle classe `StripePaymentProvider implements PaymentProvider` dans `lib/payment/stripe-payment.ts` —
     `createIntent` appelle `stripe.paymentIntents.create`, `confirm` n'est plus nécessaire côté serveur (Stripe.js
     gère la confirmation client-side), `handleWebhook` vérifie la signature via `stripe.webhooks.constructEvent`.
  2. `app/api/payments/webhook/route.ts` : passer de `x-mock-signature` à l'en-tête `stripe-signature`, et
     `export const paymentProvider = new StripePaymentProvider()` au lieu de `MockPaymentProvider`.
  3. L'écran de paiement (`app/commande/page.tsx`, étape 3) : remplacer le champ carte factice par
     `@stripe/react-stripe-js` (`PaymentElement`) et appeler `stripe.confirmPayment()` côté client au lieu de
     `POST /api/payments/:ref/confirm`.
  4. `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` en variables d'environnement, `PAYMENT_WEBHOOK_SECRET` retiré.
  5. `lib/payment/apply-outcome.ts` ne change pas — c'est tout l'intérêt de l'interface.
- **D8 (24/09/2026, phase 6)** — Expédition et suivi public. `Shipment` créé automatiquement (statut implicite via
  son premier `ShipmentEvent`, pas de champ statut redondant sur `Shipment` lui-même) dès qu'un paiement réussit
  (`lib/payment/apply-outcome.ts`), pour que le suivi ait toujours quelque chose à afficher dès la confirmation.
  Page publique `/suivi` (numéro de commande + email, sans connexion, `POST /api/tracking`, rate-limitée 20/h par
  IP) affichant la timeline des `ShipmentEvent`. Emails `sendOrderShippedEmail`/`sendOrderDeliveredEmail` ajoutés
  au layout partagé (`lib/email.ts`) — pas encore déclenchés : la saisie transporteur/numéro de suivi et l'ajout
  d'événements manuels sont une action admin, phase 8. Vérifié en conditions réelles : achat complet →
  `Shipment`/premier événement créés → suivi renvoie la bonne timeline → mauvais email rejeté (404 générique,
  n'indique pas lequel des deux champs est faux).
