#!/usr/bin/env node
/**
 * Contraste des paires déclarées dans contrast-pairs.mjs, calculé sur les
 * valeurs réelles de assets/css/tokens/colors.css (thèmes clair et sombre).
 *
 * Vérifie aussi que le bloc sombre automatique (prefers-color-scheme) est
 * identique au bloc data-theme="dark" : deux copies qui ne doivent pas dériver.
 *
 * Sans dépendance npm. Sortie : 0 si tout passe, 1 sinon.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pairs } from "./contrast-pairs.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "assets/css/tokens/colors.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

/** Déclarations `--x: valeur;` du premier bloc dont le sélecteur correspond. */
function block(selector) {
  const start = css.search(selector);
  if (start < 0) throw new Error(`Bloc introuvable : ${selector}`);
  const open = css.indexOf("{", start);
  let depth = 0;
  let end = open;
  for (; end < css.length; end += 1) {
    if (css[end] === "{") depth += 1;
    if (css[end] === "}" && --depth === 0) break;
  }
  const decls = new Map();
  for (const [, name, value] of css.slice(open + 1, end).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    decls.set(name, value.trim().toLowerCase());
  }
  return decls;
}

const base = block(/^:root\s*\{/m);
const dark = block(/^:root\[data-theme="dark"\]\s*\{/m);
const auto = block(/:root\[data-theme="auto"\]\s*\{/);

const scopes = { light: base, dark: new Map([...base, ...dark]) };
const failures = [];

for (const [name, value] of dark) {
  if (auto.get(name) !== value) failures.push(`sombre auto ≠ data-theme="dark" : ${name} (${auto.get(name) ?? "absent"} ≠ ${value})`);
}
for (const name of auto.keys()) {
  if (!dark.has(name)) failures.push(`sombre auto définit ${name}, absent de data-theme="dark"`);
}

function resolve(scope, name, seen = []) {
  const value = scope.get(name);
  if (value === undefined) throw new Error(`jeton non défini : ${[...seen, name].join(" → ")}`);
  const ref = value.match(/^var\((--[\w-]+)\)$/);
  if (ref) return resolve(scope, ref[1], [...seen, name]);
  if (/^#[0-9a-f]{6}$/.test(value)) return value;
  throw new Error(`valeur non mesurable (${value}) : ${[...seen, name].join(" → ")}`);
}

function luminance(hex) {
  const channel = (i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const short = (t) => t.replace(/^--lowdit-/, "");
const pad = (s, w) => String(s).padEnd(w);
const rows = [];
const debts = new Set();

for (const pair of pairs) {
  for (const theme of ["light", "dark"]) {
    if (pair.themes && !pair.themes.includes(theme)) {
      debts.add(`${theme} : ${pair.debt ?? "non justifié"}`);
      continue;
    }
    try {
      const fg = resolve(scopes[theme], pair.fg);
      const bg = resolve(scopes[theme], pair.bg);
      const r = ratio(fg, bg);
      const ok = r >= pair.min - 1e-4;
      rows.push([theme, short(pair.fg), short(pair.bg), fg, bg, r.toFixed(2), pair.min, ok ? "OK" : "ÉCHEC"]);
      if (!ok) failures.push(`${theme} ${short(pair.fg)} / ${short(pair.bg)} : ${r.toFixed(2)} < ${pair.min}`);
    } catch (error) {
      failures.push(`${theme} : ${error.message}`);
    }
  }
}

console.log("Contraste — jetons de assets/css/tokens/colors.css\n");
for (const r of rows) {
  console.log([pad(r[0], 6), pad(r[1], 32), pad(r[2], 26), pad(r[3], 8), pad(r[4], 8), pad(r[5], 6), pad(r[6], 4), r[7]].join(" "));
}
for (const d of debts) console.log(`\nDette déclarée — ${d}`);

if (failures.length) {
  console.error(`\n${failures.length} échec(s) :\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`\n${rows.length} mesure(s) OK, sombre auto = data-theme="dark".`);
