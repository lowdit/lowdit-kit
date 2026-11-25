#!/usr/bin/env node
/**
 * Contrôle de l'API publique d'un module Lowdit (contract/api.json).
 *
 *   node scripts/check-public-api.mjs [dossier-du-module]
 *
 * Échoue si :
 *  - un gabarit, partial ou bloc public a disparu sans être déclaré « removed »
 *    (et mentionné au CHANGELOG) ;
 *  - un partial existe sans être classé public ou interne (choix explicite) ;
 *  - une clé [params.lowdit] publique n'est plus lue nulle part ;
 *  - un élément déprécié n'émet pas son warning ou manque au CHANGELOG.
 * Politique : lowtech-dev-method/docs/TAGS-MODULES-HUGO.md
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), "..");
const contract = JSON.parse(readFileSync(join(root, "contract/api.json"), "utf8"));
const changelogPath = join(root, "CHANGELOG.md");
const changelog = existsSync(changelogPath) ? readFileSync(changelogPath, "utf8") : "";
const layouts = join(root, "layouts");
const partialsDir = join(layouts, "_partials");

const errors = [];
const fail = (msg) => errors.push(msg);

const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        return statSync(path).isDirectory() ? walk(path) : [path];
      })
    : [];

const templates = walk(layouts).filter((f) => f.endsWith(".html"));
const source = templates.map((f) => readFileSync(f, "utf8")).join("\n");

// 1. Gabarits publics
for (const layout of contract.layouts ?? []) {
  if (!existsSync(join(layouts, layout))) fail(`gabarit public absent : layouts/${layout}`);
}

// 2. Blocs du gabarit de base
const baseof = join(layouts, "_default/baseof.html");
if (contract.blocks?.length) {
  const html = existsSync(baseof) ? readFileSync(baseof, "utf8") : "";
  for (const block of contract.blocks) {
    if (!html.includes(`block "${block}"`)) fail(`bloc public absent du baseof : ${block}`);
  }
}

// 3. Partials : publics présents, et tout partial classé
const declared = new Set([...(contract.partials ?? []), ...(contract.internal ?? [])]);
for (const name of contract.partials ?? []) {
  if (!existsSync(join(partialsDir, `${name}.html`))) {
    fail(`partial public absent : ${name} — le déclarer « removed » avec une entrée « Cassé » au CHANGELOG`);
  }
}
for (const file of walk(partialsDir).filter((f) => f.endsWith(".html"))) {
  const name = relative(partialsDir, file).replace(/\.html$/, "");
  if (!declared.has(name)) fail(`partial non classé (public ou internal) : ${name}`);
}

// 4. Clés [params.lowdit] encore lues
for (const key of contract.params ?? []) {
  const read = new RegExp(`(Params\\.lowdit\\.${key}\\b|\\.${key}\\b|"${key}")`);
  if (!read.test(source)) fail(`clé [params.lowdit] publique plus lue : ${key}`);
}

// 5. Dépréciations : warning émis + CHANGELOG
for (const dep of contract.deprecated ?? []) {
  const file = join(root, dep.file);
  const body = existsSync(file) ? readFileSync(file, "utf8") : "";
  if (!body.includes(`"id" "${dep.id}"`)) fail(`déprécié sans warning : ${dep.old} (${dep.file})`);
  if (!changelog.includes(`lowdit-${dep.id}`)) fail(`déprécié absent du CHANGELOG : lowdit-${dep.id}`);
}

// 6. Retraits : annoncés au CHANGELOG, et vraiment retirés
for (const gone of contract.removed ?? []) {
  if (!changelog.includes(gone.name)) fail(`retrait absent du CHANGELOG (« Cassé ») : ${gone.name}`);
  if (existsSync(join(partialsDir, `${gone.name}.html`))) fail(`déclaré retiré mais encore présent : ${gone.name}`);
}

if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  process.exit(1);
}
console.log(`check-public-api: OK (${relative(process.cwd(), root) || "."} — ${(contract.partials ?? []).length} partials, ${(contract.params ?? []).length} clés)`);
