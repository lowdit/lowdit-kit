#!/usr/bin/env node
/**
 * Contrôle des couches CSS — empêche le retour des bugs de cascade.
 *
 *  1. Base sans composant : la couche overgo/ (reset, éléments, prose)
 *     ne nomment aucune classe, hors racines de prose et dette déclarée.
 *  2. Pas de rythme global : aucun sélecteur ne commence par `li + li` (le
 *     rythme des listes appartient à la prose ou au composant).
 *  3. Pas de sélecteur dupliqué dans une même liste (`.a, .a { }`).
 *
 * Usage : node scripts/check-css-layers.mjs   (sortie 0 si conforme)
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const kit = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Classes permises dans la base : racines de prose et bloc de code Chroma. */
const PROSE = new Set(["doc-body", "lowdit-body", "lowdit-intro", "lowdit-hero__intro", "pub-workspace__note", "highlight"]);
/** Dette déclarée : `.lowdit-lead` définie dans la base et dans lowdit-system.css. */
const DEBT = new Set(["lowdit-lead"]);

const walk = (dir) =>
  !existsSync(dir)
    ? []
    : readdirSync(dir).flatMap((n) => {
        const p = join(dir, n);
        return statSync(p).isDirectory() ? walk(p) : p.endsWith(".css") ? [p] : [];
      });

/** Listes de sélecteurs d'un fichier CSS (commentaires retirés, at-rules ignorées). */
function selectorLists(css) {
  // Commentaires remplacés par autant de sauts de ligne : les numéros restent justes.
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ""));
  const out = [];
  for (const m of clean.matchAll(/([^{};]+)\{/g)) {
    const head = m[1].trim();
    if (!head || head.startsWith("@") || /^(from|to|\d+%)/.test(head)) continue;
    const line = clean.slice(0, m.index + m[1].length - m[1].trimStart().length).split("\n").length;
    out.push({ line, selectors: head.split(/,(?![^(]*\))/).map((s) => s.trim().replace(/\s+/g, " ")) });
  }
  return out;
}

const failures = [];
const baseFiles = walk(join(kit, "assets/css/overgo"));
const allFiles = walk(join(kit, "assets/css"));

for (const file of allFiles) {
  const rel = relative(kit, file);
  const isBase = baseFiles.includes(file);
  for (const { line, selectors } of selectorLists(readFileSync(file, "utf8"))) {
    const seen = new Set();
    for (const sel of selectors) {
      if (seen.has(sel)) failures.push(`${rel}:${line} — sélecteur dupliqué : ${sel}`);
      seen.add(sel);
      if (/^li\s*\+\s*li\b/.test(sel)) failures.push(`${rel}:${line} — rythme global « ${sel} »`);
      if (isBase) {
        for (const [, cls] of sel.matchAll(/\.([\w-]+)/g)) {
          if (!PROSE.has(cls) && !DEBT.has(cls)) failures.push(`${rel}:${line} — classe de composant dans la base : .${cls}`);
        }
      }
    }
  }
}

if (failures.length) {
  console.error(`check-css-layers : ${failures.length} écart(s)\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`check-css-layers : OK (${allFiles.length} fichiers, base ${baseFiles.length})`);
