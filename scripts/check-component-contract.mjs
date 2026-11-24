#!/usr/bin/env node
/**
 * Contrôle minimal du contrat composant v2-04 (tokens attendus dans le CSS).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const buttons = readFileSync(join(root, "assets/css/components/buttons.css"), "utf8");
const forms = readFileSync(join(root, "assets/css/components/forms.css"), "utf8");
const nav = readFileSync(join(root, "assets/css/components/navigation.css"), "utf8");

const checks = [
  [buttons, "--lowdit-color-action"],
  [buttons, "--lowdit-color-border-component"],
  [buttons, "--lowdit-color-focus"],
  [buttons, "@media (hover: hover)"],
  [buttons, "border-color: var(--lowdit-color-action)"],
  [forms, "--lowdit-color-border-component"],
  [forms, "--lowdit-color-focus"],
  [forms, "--lowdit-role-status-error-border"],
  [forms, 'aria-invalid="true"'],
  [nav, "aria-current"],
  [nav, "text-decoration: underline"],
];

let failed = 0;
for (const [css, needle] of checks) {
  if (!css.includes(needle)) {
    console.error(`MISSING in contract: ${needle}`);
    failed++;
  }
}

if (failed) {
  process.exit(1);
}
console.log("Contrat composant v2-04 OK.");
process.exit(0);
