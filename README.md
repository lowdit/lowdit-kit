# lowdit-kit

Kit générique de l'univers Lowdit : **jetons, base, compositions, composants,
modèles (vues), coque CSS, polices**. Aucune marque client, aucun contenu.

C'est un module Hugo. Chaque site ou module l'importe ; rien n'est recopié.

```text
Marque (réglages, optionnelle) ─┐
                                ▼
Kit (ce dépôt) ──► Modules (minigo, repogo, sligo, resugo, fromago, pedago, quizago) ──► Sites
```

## Contrat

Règle de rangement : **toute page de tout site en a besoin → kit** ; il faut
plusieurs pages et des rubriques → minigo ; un seul usage → son module ;
service tiers (partage, commentaires, statistiques) → non fourni.

| Dossier | Contenu |
| --- | --- |
| `assets/css/tokens/` | jetons : couleurs (rôles, clair/sombre), typographie, espacements, gabarits, mouvement, élévation |
| `assets/css/overgo/` | **Overgo**, la base de base, sans aucune classe : `reset`, `elements`, `prose` (la prose ne stylise que les éléments sans classe) |
| `assets/css/compositions.css` | compositions Every Layout (`stack`, `cluster`, `grid`, …) via `data-*` |
| `assets/css/components/` | composants `lowdit-*` |
| `assets/css/views/` | modèles de page (`lowdit--view-*`) |
| `assets/css/lowdit-shell.css`, `zones.css`, `product-doc.css` | coque et zones de page |
| `static/assets/fonts/` | polices autorisées |
| `data/lowdit-theme-presets.yaml` | préréglages de surfaces |
| `layouts/_partials/lowdit/` | coque et tête : `overgo` (charge la base), `view-tokens`, `theme-vars`, `logo`, `favicon`, `social-meta`, `hub-shell`… |
| `layouts/_partials/components/` | composants : `button`, `accordion`, `disclosure`, `error-summary`, `field` |
| `layouts/_partials/debug/` | outils de test et de débogage (développement) |

Chaque fichier existe une fois ; `config.toml` l'expose aussi sous
`static/assets/css/` (liens directs) et sous les alias historiques
`lowdit-colors.css` et `minigo.css`.

## Utiliser le kit

Un module l'importe dans sa config :

```toml
[[module.imports]]
  path = "github.com/lowdit/lowdit-kit"
```

En local, l'espace de travail `../bin/hugo.work` résout le kit sur ce dépôt
(réglé dans la config de chaque site : `[module] workspace = …`). En CI, la
version est épinglée par `go.mod`.

## Contrôles

```sh
node scripts/check-contrast.mjs          # contraste mesuré sur les jetons réels, clair + sombre
node scripts/check-css-layers.mjs        # base sans composant, pas de li + li global, pas de doublon
node scripts/check-component-contract.mjs
node scripts/check-fluid-scale.mjs
node scripts/check-layout-templates.mjs
```

## Lignée

> *Rien ne se perd, tout se compose.*

La couche `overgo/` porte le nom du framework CSS
[Overgo](https://github.com/bertrandkeller/overgo) (2020) : un thème minimal,
« base de base », pensé dès le départ pour être partagé entre tous les projets.
Il lui manquait le moyen de ce partage ; c'est ce que fait ce kit, importé comme
module au lieu d'être recopié. Plusieurs fichiers du kit (`debug.css`,
`checka11y.css`, `mermaid.css`) en descendent directement.

Origine : extrait de `lowdit-brand` (commit `1f11366`) et de `minigo`
(commit `1fcd9ad`) le 2026-11-24 ; l'historique des fichiers reste
consultable dans ces dépôts.
