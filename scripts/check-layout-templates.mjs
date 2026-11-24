#!/usr/bin/env node
/**
 * Contrôle la présence des gabarits et des @container documentés.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = [
  readFileSync(join(root, "assets/css/tokens/templates.css"), "utf8"),
  readFileSync(join(root, "assets/css/compositions.css"), "utf8"),
].join("\n");

const requiredTokens = [
  "--lowdit-cq-sm",
  "--lowdit-cq-md",
  "--lowdit-cq-lg",
  "--lowdit-cq-xl",
];

const requiredClasses = [
  ".wrapper",
  '.wrapper[data-width="reading"]',
  '.wrapper[data-width="wide"]',
  '.wrapper[data-width="full"]',
  ".with-sidebar",
  ".stack",
  ".cluster",
  ".grid",
  ".lowdit-cq",
  ".lowdit-cq-stack",
  ".lowdit-cq-grid",
  ".lowdit-cq-measure",
];

let failed = 0;

for (const token of requiredTokens) {
  if (!css.includes(`${token}:`)) {
    console.error(`MISSING token ${token}`);
    failed++;
  }
}

for (const cls of requiredClasses) {
  if (!css.includes(cls)) {
    console.error(`MISSING class ${cls}`);
    failed++;
  }
}

const containerRules = css.match(/@container lowdit/g) ?? [];
if (containerRules.length < 4) {
  console.error(`FAIL: attendu >= 4 règles @container lowdit, trouvé ${containerRules.length}`);
  failed++;
}

if (failed) {
  process.exit(1);
}
console.log(`Gabarits OK (${requiredClasses.length} classes, ${containerRules.length} @container).`);
process.exit(0);
