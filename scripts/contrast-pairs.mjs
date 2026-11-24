/**
 * Paires de contraste du DS — déclarées par jetons, jamais par valeurs.
 *
 * Les valeurs sont lues dans assets/css/tokens/colors.css par check-contrast.mjs :
 * une couleur modifiée dans les jetons est contrôlée immédiatement, sans copie
 * à tenir à jour ici.
 *
 * Chaque paire est vérifiée dans chaque thème listé (`themes`, défaut : les deux).
 * Un thème absent doit être justifié par `debt` : la dette reste visible.
 */

/** Seuils WCAG 2.2 : 1.4.3 (texte) et 1.4.11 (composants d'interface). */
export const TEXT = 4.5;
export const UI = 3;

/** @typedef {{ fg: string, bg: string, min: number, themes?: ("light"|"dark")[], debt?: string }} Pair */

/** @type {Pair[]} */
export const pairs = [
  // Contrat sémantique consommé par les composants
  { fg: "--lowdit-color-text", bg: "--lowdit-color-background", min: TEXT },
  { fg: "--lowdit-color-text", bg: "--lowdit-color-surface", min: TEXT },
  { fg: "--lowdit-color-text-muted", bg: "--lowdit-color-background", min: TEXT },
  { fg: "--lowdit-color-text-muted", bg: "--lowdit-color-surface", min: TEXT },
  { fg: "--lowdit-color-link", bg: "--lowdit-color-background", min: TEXT },
  { fg: "--lowdit-color-link", bg: "--lowdit-color-surface", min: TEXT },
  { fg: "--lowdit-color-action", bg: "--lowdit-color-background", min: UI },
  { fg: "--lowdit-color-action-foreground", bg: "--lowdit-color-action", min: TEXT },
  { fg: "--lowdit-role-action-foreground", bg: "--lowdit-role-action-hover", min: TEXT },
  { fg: "--lowdit-color-focus", bg: "--lowdit-color-background", min: UI },
  { fg: "--lowdit-color-focus", bg: "--lowdit-color-surface", min: UI },
  { fg: "--lowdit-color-border-component", bg: "--lowdit-color-background", min: UI },
  { fg: "--lowdit-color-border-component", bg: "--lowdit-color-surface", min: UI },

  // Accents de module (texte)
  { fg: "--lowdit-role-accent-repogo-text", bg: "--lowdit-color-background", min: TEXT },
  { fg: "--lowdit-role-accent-repogo-text", bg: "--lowdit-color-surface", min: TEXT },
  { fg: "--lowdit-role-accent-violet-text", bg: "--lowdit-color-background", min: TEXT },
  { fg: "--lowdit-role-accent-violet-text", bg: "--lowdit-color-surface", min: TEXT },
  { fg: "--lowdit-role-accent-turquoise-text", bg: "--lowdit-color-background", min: TEXT },
  { fg: "--lowdit-role-accent-turquoise-text", bg: "--lowdit-color-surface", min: TEXT },

  // Statuts
  ...["success", "warning", "error", "info"].flatMap((s) => [
    { fg: `--lowdit-role-status-${s}-text`, bg: "--lowdit-color-surface", min: TEXT, themes: ["light"], debt: "statuts sombres non définis" },
    { fg: `--lowdit-role-status-${s}-border`, bg: "--lowdit-color-surface", min: UI, themes: ["light"], debt: "statuts sombres non définis" },
  ]),
];
