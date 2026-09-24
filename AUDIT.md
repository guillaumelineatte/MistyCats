# AUDIT.md

Audit du dépôt Misty Cats — phase 0. Vérifié en lisant le code de routage et les données réelles en base
(Neon, projet `mistycates`), pas deviné. Mis à jour à la fin de chaque lot.

## Légende statuts
- ✅ 200 — route existe, fonctionne
- ❌ 404 — aucune route ne correspond
- ⚠️ — fonctionne mais problème de fond (donnée fausse, lien cassé fonctionnellement, ancre fragile)
- ➖ — lien externe, non vérifiable depuis le code (hors périmètre de vérification statique)

## 1. Liens du header (`components/header.tsx`)

| Libellé | Cible | Statut | Détail |
|---|---|---|---|
| Notre Histoire | `#notre-histoire` | ⚠️ | Section existe sur `/` (id présent dans `app/page.tsx`). Depuis une autre page, le code fait `router.push('/#notre-histoire')`, mais rien ne garantit le scroll une fois la page chargée côté client (pas de gestion d'ancre post-navigation observée). À vérifier/fiabiliser lot 2.3. |
| Boutique | `/boutique` | ✅ | `app/boutique/page.tsx` |
| Collections | `#categories` | ⚠️ | Même situation que Notre Histoire — section existe sur `/`, fiabilité du scroll cross-page à vérifier. |
| Magasin | `#magasin` | ⚠️ | Idem, section `id="magasin"` dans `components/store.tsx`. |
| Avis | `#avis` | ⚠️ | Idem, section existe (`Testimonials`), mais le contenu lui-même est un problème légal — voir lot 1.2. |
| Logo Misty Cats | `/` | ✅ | |
| Icône compte | `/mon-compte` (connecté) ou `/login` | ✅ | `aria-label="Mon compte"`, icône seule. **Le texte littéral `/login` évoqué dans la mission n'a pas été retrouvé dans le code** (voir PROJECT.md, décision D1). |
| Icône recherche | — | ⚠️ | Bouton présent, aucune action câblée. Décoratif actuellement. |
| Icône panier | — | ⚠️ | Bouton présent, badge « 0 » toujours affiché, aucune action câblée. Décoratif actuellement. |

## 2. Liens du footer (`components/footer.tsx`)

| Section | Libellé | Cible | Statut |
|---|---|---|---|
| Marque | Logo | `/` | ✅ |
| Marque | Instagram | `https://www.instagram.com/_mistycats/` | ➖ externe |
| Marque | Facebook | `https://facebook.com` | ❌ fonctionnel | Pointe vers le domaine générique, aucune page. |
| Marque | Email | `mailto:contact@mistycats.fr` | ⚠️ | Adresse à confirmer réelle (voir bloc ACTION REQUISE). |
| Boutique | Tous les bijoux | `/boutique` | ✅ | |
| Boutique | Nouveautés | `/boutique/nouveautes` | ❌ 404 | Aucune route. |
| Boutique | Meilleures ventes | `/boutique/meilleures-ventes` | ❌ 404 | Aucune route. |
| Boutique | Promotions | `/boutique/promotions` | ❌ 404 | Aucune route. |
| Informations | Notre histoire | `/notre-histoire` | ❌ 404 | N'existe qu'en tant qu'ancre sur `/`, pas de page dédiée. |
| Informations | L'upcycling | `/upcycling` | ❌ 404 | Aucune route. |
| Informations | FAQ | `/faq` | ❌ 404 | Aucune route. |
| Informations | Contact | `/contact` | ❌ 404 | Aucune route. |
| Légal | Mentions légales | `/mentions-legales` | ❌ 404 | Aucune route. |
| Légal | CGV | `/cgv` | ❌ 404 | Aucune route. |
| Légal | Confidentialité | `/confidentialite` | ❌ 404 | Aucune route. |
| Légal | Livraison & Retours | `/livraison-retours` | ❌ 404 | Aucune route. |

**9 liens sur 12 en 404** (les 3 boutique/informations restants pointent vers de vraies routes ou sont à trancher lot 2.1).

## 3. Page d'accueil — sections et données (`app/page.tsx` + composants)

| Élément | Fichier | Statut | Détail |
|---|---|---|---|
| Catégories : compteurs | `components/categories.tsx` | ❌ donnée fausse | 24 / 18 / 15 en dur. Réalité en base : **1 seul article publié**, catégorie « Boucles d'oreilles ». |
| Filtre catégorie → boutique | `components/categories.tsx` | ✅ | `/boutique?categorie=...`, correctement géré par `CollectionView`. |
| Avis clients | `components/testimonials.tsx` | ❌ risque légal | 3 témoignages inventés (Marie L., Sophie D., Claire M.) — voir lot 1.2. |
| Image héros | `components/hero.tsx` | ⚠️ placeholder | `/elegant-jewelry-flat-lay-on-natural-linen-fabric-w.jpg`, image de stock générée, locale (pas de risque légal de tiers), à remplacer par une vraie photo. |
| Boutons héros (« Découvrir la Collection », « Notre Histoire ») | `components/hero.tsx` | ⚠️ | Aucun `href`/`onClick` — boutons non fonctionnels. Hors périmètre explicite de la mission mais à signaler. |
| Photo du magasin | `components/store.tsx` | ❌ | C'est le favicon (`/favori-icon.png`) réutilisé en photo de devanture. |
| Téléphone affiché vs lien `tel:` | `components/store.tsx` | ❌ incohérence | Texte affiché : `03 75 08 92 47`. Lien réel : `tel:+33123456789`. Deux numéros différents, aucun des deux confirmé réel. |
| Adresse / horaires | `components/store.tsx` | ⚠️ à confirmer | 7 Rue Lamarck, 80000 Amiens ; Mar 14h-19h, Mer-Sam 11h-19h. Déjà présent dans le code, semble réel mais non confirmé par l'utilisateur. |
| Lien Google Maps | `components/store.tsx` | ➖ externe | Pointe vers une fiche Google Maps précise pour l'adresse ci-dessus — cohérent avec l'adresse. |
| Newsletter — case consentement | `components/newsletter.tsx` | ❌ | Aucune case à cocher. Le texte « vous acceptez notre politique de confidentialité » n'est même pas un lien (texte brut), et la page ciblée n'existe pas. |
| Newsletter — soumission | `components/newsletter.tsx` | ⚠️ | `handleSubmit` vide le champ, ne fait aucun appel réseau. Aucune route `/api/newsletter`. Backend inexistant, à trancher au lot 1.4. |

## 4. Image produit hébergée chez un tiers (lot 1.1 — risque légal)

Vérifié directement en base (Neon, projet `mistycates`) :

| Article | Image | Domaine |
|---|---|---|
| ZOZO (boucles d'oreilles, publié, stock 2) | `https://www.bijouxbaume.com/upload/image/boucles-d-oreilles-or-jaune-godronne-p-image-133958-grande.jpg` | `bijouxbaume.com` — site d'un autre bijoutier |

C'est le **seul article publié actuellement**. Aucune autre URL externe trouvée dans le code ou dans les autres
tables (`Drop` est vide). Le formulaire admin (`components/admin/article-form.tsx`) ne permet pas de saisir une URL
directement — l'image passe uniquement par `/api/upload`. Cette URL externe a donc été insérée autrement (SQL direct,
seed, ou test manuel), pas via le formulaire. Le garde-fou du lot 1.1 reste nécessaire pour empêcher toute
réintroduction, quel que soit le vecteur.

**Photos en attente** : le produit "ZOZO" nécessite une vraie photo hébergée par le projet. Aucun autre produit à
ce jour.

## 5. Fiche produit (lot 4.1)

Aucune route de détail produit n'existe (`app/boutique/[id]` ou équivalent absent de l'arborescence `app/`).
`components/product-card.tsx` est une simple `<div>` avec `cursor-pointer` : **aucun lien, aucune navigation**, sur
la boutique comme sur l'accueil. Cliquer sur une carte produit ne fait rien.

## 6. SEO (lot 4.2)

| Élément | État |
|---|---|
| `export const metadata` | Seulement sur `app/layout.tsx` (racine), `app/boutique/page.tsx`, `app/boutique/drops/page.tsx`, `app/boutique/drops/[id]/page.tsx`. Toutes les autres pages (login, inscription, mon-compte, mots de passe, admin) héritent du titre/description de l'accueil. |
| `keywords` | Présent dans `app/layout.tsx` (`meta name="keywords"`) — balise ignorée par les moteurs depuis longtemps, à retirer. |
| Open Graph / Twitter Card | Absents partout. |
| Schema.org (`LocalBusiness`, `Product`) | Absents partout. |
| `sitemap.xml` / `robots.txt` | Aucun fichier `app/sitemap.ts` ni `app/robots.ts` — n'existent pas. |
| Rendu serveur | `/boutique`, `/boutique/drops`, `/boutique/drops/[id]`, `/` sont déjà des Server Components (`async function`, pas de `"use client"` en tête de fichier de page) — donc déjà indexables. Pas de fiche produit à vérifier puisqu'elle n'existe pas encore (lot 4.1). |

## 7. Pages légales (lot 1.3)

Les 4 pages n'existent pas du tout dans `app/` : pas de `mentions-legales`, `cgv`, `confidentialite`,
`livraison-retours`. Les liens du footer pointent dessus → 404 garanti (voir section 2).

## 8. Comptes et admin — liens vérifiés, fonctionnels

| Zone | Lien | Statut |
|---|---|---|
| `components/account-nav.tsx` | `/mon-compte`, `/mon-compte/profil`, `/mon-compte/adresses`, `/mon-compte/mot-de-passe` | ✅ toutes existent |
| `components/account-nav.tsx` | `/mon-compte/commandes` | ⚠️ intentionnellement désactivé (`href="#"`, badge « Bientôt ») — pas un lien cassé, choix assumé. |
| `components/admin/admin-sidebar.tsx` | `/admin/articles`, `/admin/drops`, `/` (nouvel onglet) | ✅ toutes existent |
| Pages auth (`/login`, `/inscription`, `/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe/[token]`) | Liens croisés entre elles + vers `/` | ✅ toutes existent |
| `app/boutique/drops/page.tsx`, `app/boutique/drops/[id]/page.tsx` | Liens vers `/boutique`, `/boutique/drops` | ✅ toutes existent (feature « drops » en cours, non committée) |

## 9. Points hors périmètre explicite de la mission mais relevés

- Boutons héros non fonctionnels (pas de lien/action).
- Icônes recherche et panier du header non câblées (décoratives).
- `next.config.mjs` : `typescript.ignoreBuildErrors: true` — masque les erreurs de type au build (voir PROJECT.md).
- Aucun framework de test installé, aucun script `typecheck` (voir PROJECT.md — bloquant pour respecter les règles
  d'ingénierie de fin de lot).
- Upload d'image non fonctionnel en production sur Vercel (filesystem en lecture seule) — voir PROJECT.md, bloquant
  pour publier de vraies photos au lot 1.1.

## 10. Rappel — pages légales : pas un avis juridique

Les pages légales produites au lot 1.3 seront une base structurée et sérieuse, rédigée à partir des informations
fournies, mais **ne remplacent pas la relecture par un professionnel du droit avant ouverture réelle de la
boutique**. Rappel répété en commentaire en tête de chacune de ces pages.

## 11. Suivi — état final par point (mis à jour à la fin de chaque lot)

*(à compléter au fil des lots — vide en phase 0)*
