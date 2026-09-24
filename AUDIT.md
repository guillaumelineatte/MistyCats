# AUDIT.md

Audit final du site Misty Cats — mission "site marchand complet" (phases 0-10).
Inventaire exhaustif des éléments interactifs, écran par écran, public et admin,
avec leur état réel : ✅ fonctionnel, ⚠️ partiel (raison précisée), ❌ en attente
d'une information externe. Vérifié en lisant le code et en testant contre la vraie
base (Neon, projet `mistycates`) — pas deviné.

Le premier audit (phase 0, avant cette mission) est conservé plus bas pour
mémoire ; cette section décrit l'état après les 10 phases.

## 1. Site public

### 1.1 Header (`components/header.tsx`)

| Élément | Statut | Détail |
|---|---|---|
| Logo → `/` | ✅ | |
| Boutique → `/boutique` | ✅ | |
| Notre Histoire, Collections, Magasin, Nos Matières (ancres) | ⚠️ | Fonctionnent depuis `/`. Fiabilité du scroll cross-page (ex. depuis `/boutique`) non re-testée cette mission — déjà noté comme fragile en phase 0, hors périmètre explicite de cette mission. |
| Icône compte → `/mon-compte` ou `/login` | ✅ | |
| Icône panier → `/panier`, compteur réel | ✅ | Corrigé cette mission : badge « 0 » en dur → compteur réel (`lib/cart-events.ts`). |
| Icône recherche | ❌ | Toujours décorative. Aucune fonctionnalité de recherche dans le modèle de données de cette mission — non demandé, non construit. |

### 1.2 Accueil (`app/page.tsx`)

| Élément | Statut | Détail |
|---|---|---|
| Hero — boutons « Découvrir la Collection », « Notre Histoire » | ✅ | Corrigé cette mission : n'avaient ni `href` ni `onClick`. Pointent maintenant vers `/boutique` et `#notre-histoire`. |
| Collection en vedette | ✅ | Données réelles (`Article.status = ONLINE`), cartes cliquables vers la fiche produit. |
| Catégories — compteurs et images | ✅ | Corrigé cette mission : 24/18/15 en dur → comptage réel par catégorie, image = première pièce en ligne de la catégorie. |
| Magasin — téléphone affiché vs lien `tel:` | ❌ | Incohérence déjà relevée en phase 0, toujours présente (`03 75 08 92 47` affiché, `tel:+33123456789` en lien) : aucun des deux numéros n'a jamais été confirmé réel par la cliente, donc aucun choix n'a été tranché à sa place. **Nécessite votre confirmation du vrai numéro.** |
| Magasin — adresse/horaires | ⚠️ | Présents, jamais formellement confirmés par la cliente (`lib/site-config.ts`). |
| Newsletter — case de consentement | ✅ | Corrigé en amont de cette mission (lot 1) : vraie case à cocher, lien réel vers `/confidentialite`, inscription fonctionnelle avec email de confirmation. |

### 1.3 Boutique (`app/boutique`, `app/boutique/produit/[slug]`, `app/boutique/drops`)

| Élément | Statut | Détail |
|---|---|---|
| Listing + filtre par catégorie | ✅ | |
| Fiche produit | ✅ | Créée cette mission (n'existait pas). Galerie multi-image, JSON-LD `Product`, histoire/matières/dimensions. |
| Bouton « Ajouter au panier » | ✅ | Réserve la pièce 30 min (verrou transactionnel, testé en concurrence réelle). Désactivé et libellé « Indisponible » si la pièce n'est pas `ONLINE`. |
| Drops (collections thématiques) | ✅ | CRUD admin, publication programmée, page publique. |

### 1.4 Panier → commande → paiement → suivi

| Élément | Statut | Détail |
|---|---|---|
| `/panier` — retrait, compte à rebours | ✅ | |
| `/commande` — tunnel 3 étapes | ✅ | Coordonnées/adresses → livraison → récapitulatif/paiement. Commande invitée autorisée. |
| Paiement simulé | ✅ | 4 cartes de test documentées sur l'écran, mention « paiement simulé » visible. Jamais confirmé côté client — webhook interne signé uniquement. |
| `/commande/confirmation/[number]` | ✅ | |
| `/suivi` — suivi public (numéro + email) | ✅ | Rate limité. |
| Emails transactionnels (vérification, reset, confirmation de commande, expédition, livraison) | ✅ | Layout partagé, mode dégradé (`SMTP_HOST` absent) → console + fichier HTML dans `os.tmpdir()`, jamais dans le dépôt. |

### 1.5 Compte client (`app/mon-compte`)

| Élément | Statut | Détail |
|---|---|---|
| Inscription, connexion, mot de passe oublié | ✅ | Vérification d'email obligatoire avant commande (comptes connectés uniquement — un achat invité n'a pas de compte à vérifier), mot de passe ≥ 12 caractères + contrôle Have I Been Pwned, rate limiting. |
| Profil, adresses | ✅ | |
| Mot de passe | ✅ | Déconnexion forcée après changement (toutes les sessions deviennent invalides). |
| Commandes — historique et détail | ✅ | Corrigé cette mission : lien désactivé (« Bientôt ») → réellement branché, avec vérification de propriété (test IDOR Playwright dédié). |
| Confidentialité (RGPD) | ✅ | Export JSON complet, suppression de compte (mot de passe requis, commandes anonymisées et conservées pour l'intégrité comptable). |

### 1.6 Formulaires et pages légales

| Élément | Statut | Détail |
|---|---|---|
| Contact (`/contact`) | ✅ | Créé cette mission. Stockage + email de notification interne. |
| Sur-mesure (`/sur-mesure`) | ✅ | Créé cette mission. Idem. |
| CGV, Confidentialité, Mentions légales, Livraison & Retours | ⚠️ | Pages présentes (créées en amont de cette mission), structurées et sérieuses, mais **ne remplacent pas une relecture juridique professionnelle**. Identité légale de la cliente (raison sociale, SIRET, forme juridique) toujours volontairement absente — placeholder honnête affiché plutôt qu'inventée. |
| Footer — Nouveautés, Meilleures ventes, Promotions | ❌ | 404. Aucun concept de « nouveauté »/« best-seller »/« promotion » dans le modèle de données de cette mission (pas demandé) — nécessiterait une décision produit avant construction. |
| Footer — Notre histoire (page dédiée), L'upcycling, FAQ | ❌ | 404. Contenu éditorial hors périmètre explicite de cette mission (pas de modèle de données correspondant). |

## 2. Espace admin (`/admin`)

Protection en profondeur sur tout l'espace : `proxy.ts` (middleware, sans accès
DB) **et** `requireAdmin()` (chaque page/route, avec vérification du rôle en
base) — voir décision D9. Vérifié par 3 tests Playwright réels.

| Écran | Statut | Détail |
|---|---|---|
| Connexion admin | ✅ | |
| Tableau de bord | ✅ | Agrégats réels : pièces par statut, CA du mois, commandes à préparer, dernières commandes, messages en attente. |
| Articles — liste, création, édition | ✅ | Recherche/filtre non ajoutés (liste simple, volume actuel faible) ; réordonnancement glisser-déposer, upload multi-image Vercel Blob, génération auto slug/référence, statut de cycle de vie. |
| Articles — suppression | ✅ | Toujours un archivage (`status = ARCHIVED`), jamais une suppression physique — la contrainte FK `Restrict` sur `OrderItem` empêche de toute façon de supprimer une pièce déjà vendue. |
| Catégories — CRUD + ordre | ✅ | Réordonnancement par flèches haut/bas (plus simple que le glisser-déposer pour un nombre de catégories toujours faible). |
| Drops — CRUD | ✅ | |
| Commandes — liste, filtre par statut, détail | ✅ | |
| Commandes — changement de statut | ✅ | |
| Commandes — saisie transporteur/suivi | ✅ | Déclenche l'email d'expédition. |
| Commandes — événements de suivi manuels | ✅ | |
| Commandes — bon de livraison PDF | ✅ | |
| Clientes — liste + détail (lecture seule) | ✅ | |
| Boîte de réception | ✅ | Vide tant qu'aucun message/demande n'a été envoyé (formulaires publics créés cette mission). |

## 3. Sécurité — points notables de cette mission

- **Faille corrigée (D9)** : les routes API admin ne vérifiaient pas le rôle,
  seulement la présence d'une session — n'importe quelle cliente connectée
  pouvait créer/modifier/supprimer des articles et des drops. Corrigée et
  vérifiée par test.
- **Bug corrigé (D9)** : boucle de redirection infinie pour une cliente
  connectée visitant `/admin/*` (découvert par le test écrit pour vérifier le
  point précédent).
- Réservation de pièce unique : verrouillage `SELECT ... FOR UPDATE`, testé en
  concurrence réelle (deux réservations, deux ventes simultanées).
- Paiement : jamais confirmé côté client, uniquement par webhook interne signé
  et idempotent.
- IDOR : vérification de propriété systématique sur les commandes (testée).
- En-têtes de sécurité + CSP dans `next.config.mjs`, vérifiés sans erreur
  console en conditions réelles (navigateur headless).
- `next.config.mjs` : `typescript.ignoreBuildErrors` retiré (était à `true`
  depuis l'origine du projet) — le build échoue maintenant sur une vraie
  erreur de type, comme `npm run typecheck` déjà vert en continu depuis la
  phase 1.

## 4. Ce qui reste à faire avant une ouverture réelle

1. **Identité légale de la cliente** (raison sociale, SIRET, forme juridique) —
   nécessaire pour des mentions légales et des CGV valides.
2. **Relecture juridique professionnelle** des pages légales.
3. **Vrai numéro de téléphone** du magasin (incohérence entre affichage et lien).
4. **Vraies photos** des pièces (la seule pièce réelle en base utilise un
   placeholder local).
5. Passage à un vrai prestataire de paiement (Stripe) — liste exacte des
   fichiers à modifier dans `PROJECT.md`, décision D7.
6. `SMTP_HOST` à configurer en production pour un envoi d'email réel (mode
   dégradé actif tant qu'absent — fonctionnel mais pas silencieux : logué).

---

## Annexe — audit phase 0 (avant cette mission, conservé pour mémoire)

Consulter l'historique git (`git show 4425e57:AUDIT.md`) pour le contenu
original de la phase 0 (inventaire des liens morts, données en dur, etc.
avant le début de la mission "site marchand complet").
