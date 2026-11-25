# Changelog — lowdit-kit

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versions
SemVer. Chaque entrée dit **quoi · où · migrer**. « Non publié » = ce que
reçoivent les sites qui suivent `main`. Politique :
`lowtech-dev-method/docs/TAGS-MODULES-HUGO.md`.

## Non publié

### Cassé

- **Les feuilles de vue quittent le kit** et rejoignent le module qui sert le
  modèle, au même chemin (`assets/css/views/<nom>.css`) : `publisher` →
  repogo, `cv-vitrine` → resugo, `deck-studio` → sligo, `drill` → quizago,
  `inquiry` → fromago, `thinktank` et `catalog` → minigo, `lowdit-home` →
  Brand. Leurs règles de `charte-premium.css` et `components/forms.css` les
  ont suivies. Rien à faire pour un site qui importe le module du modèle.
  Où : un site qui règle `view` (ou `siteProfile`) sur un modèle **sans**
  importer son module : la feuille n'est plus liée (plus de repli sur
  `catalog`, plus de lien cassé).
  Migrer : importer le module (ex. repogo pour `publisher`) ou `view = "none"`.
  Effet de bord : un site ne publie plus les neuf feuilles de vue, seulement
  celle de son modèle.
- **`lowdit/render-home` et `lowdit/home-hub-shell` retirés du kit.** Routeur
  d'accueil propre au site Brand, il y a été déplacé.
  Où : un site qui appelle `partial "lowdit/render-home.html"`.
  Migrer : copier les deux partials dans le site (`layouts/_partials/lowdit/`).
- **`lowdit/hub-shell` retiré du kit.** Seul le site Brand l'utilisait (et il
  appelait `product/breadcrumb`, propre à Brand) : déplacé dans Brand.
  Où : un site qui appelle `partial "lowdit/hub-shell.html"`.
  Migrer : copier le partial depuis `lowdit-brand/layouts/_partials/lowdit/`.
- **Logo et favicons sans valeur par défaut.** Le kit ne suppose plus
  `logos/minigo.png` ni `favicons/minigo`.
  Où : un site qui importe le kit **sans** minigo et sans régler ces clés
  (avec minigo : aucun changement, minigo fournit ses valeurs par défaut).
  Migrer : `[params.lowdit] logo = "logos/<nom>.png"` et
  `faviconDir = "favicons/<nom>"`.

### Déprécié

- **`[params.lowdit] skin`** → `view`. Warning `lowdit-params-skin` ;
  retrait en v0.4.0.

### Ajouté

- **Gabarit de base** `_default/baseof.html` : la coque commune (tête,
  en-tête, navigation, contenu, débogage). Blocs `title`, `head`, `main`,
  `footer`, `script`.
- **Points d'accroche** vides `lowdit/hooks/{head,header,body-end}` : un module
  les redéfinit au lieu de réécrire le gabarit.
- **Replis** `_default/single`, `_default/list`, `_default/single.product`,
  `section/installation` : un module seul reste navigable ; une rubrique
  `layout: gallery` affiche la galerie de catalogue.
- `lowdit/main-nav` (venu de minigo) : rubrique courante marquée
  `aria-current` sur ses sous-pages ; `id="main-nav"`.
- `lowdit/display-flags` : surcharge par page ou rubrique (front matter
  `lowdit:`), contexte page ou dict.
- `lowdit/deprecated` : annonce d'une dépréciation au build (`warnidf`).
- `i18n/` : libellés de la coque (lien d'évitement, liens d'export).
- `assets/js/` (Mermaid, css-doodle, outils de débogage) et shortcodes
  `mermaid`, `css-doodle`, venus de minigo : `lowdit/diagrams` et
  `debug/*` les appelaient déjà ; sans minigo, aucun schéma ne se dessinait.
- Contrat `contract/api.json` et contrôle `scripts/check-public-api.mjs`.
- **Page introuvable** `404.html` commune (libellés `404-*`) : les modules
  n'en fournissent plus chacun une.

### Corrigé

- Schémas Mermaid rendus sur un site sans minigo (le script manquait).
- `<body>` n'affiche plus `ZgotmplZ` quand aucun attribut `data-*` n'est
  réglé (`safeHTMLAttr`).

## v0.1.0 — 2026-11-25

Première version : jetons, couche Overgo (reset, éléments, prose),
compositions, composants, vues, coque CSS, polices ; partials de tête, de
coque, de composants, de catalogue et de débogage. Extrait de `lowdit-brand`
(`1f11366`) et de `minigo` (`1fcd9ad`).
