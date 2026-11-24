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
| `assets/css/base/` | reset et typographie des éléments (aucune classe) |
| `assets/css/lowdit-base.css` | prose : ne stylise que les éléments **sans classe** |
| `assets/css/compositions.css` | compositions Every Layout (`stack`, `cluster`, `grid`, …) via `data-*` |
| `assets/css/components/` | composants `lowdit-*` |
| `assets/css/views/` | modèles de page (`lowdit--view-*`) |
| `assets/css/lowdit-shell.css`, `zones.css`, `product-doc.css` | coque et zones de page |
| `static/assets/fonts/` | polices autorisées |
| `data/lowdit-theme-presets.yaml` | préréglages de surfaces |

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

Origine : extrait de `lowdit-brand` (commit `1f11366`) et de `minigo`
(commit `1fcd9ad`) le 2026-11-24 ; l'historique des fichiers reste
consultable dans ces dépôts.
