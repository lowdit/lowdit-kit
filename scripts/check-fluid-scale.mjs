#!/usr/bin/env node
/**
 * Vérifie les clamp() des tokens typo + espacement aux viewports cibles.
 * Sans dépendance npm.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const VIEWPORTS = [390, 1280, 1920];
const ROOT_PX = 16;

function remToPx(rem) {
  return rem * ROOT_PX;
}

/** @param {number} px */
function pxToRem(px) {
  return px / ROOT_PX;
}

/**
 * @param {string} expr — ex. 0.96rem + 0.2vw
 * @param {number} viewportPx
 */
function evalPreferred(expr, viewportPx) {
  const parts = expr.split("+").map((s) => s.trim());
  let totalPx = 0;
  for (const part of parts) {
    if (part.endsWith("rem")) {
      totalPx += remToPx(parseFloat(part));
    } else if (part.endsWith("vw")) {
      totalPx += (parseFloat(part) / 100) * viewportPx;
    } else if (part.endsWith("ch")) {
      totalPx += remToPx(parseFloat(part) * 0.5);
    } else {
      throw new Error(`Unité non gérée dans « ${expr} »`);
    }
  }
  return pxToRem(totalPx);
}

/** @param {string} value */
function evalClamp(value, viewportPx) {
  const m = value.match(/clamp\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/);
  if (!m) return parseFloat(value);
  const min = parseFloat(m[1]);
  const max = parseFloat(m[3]);
  const mid = evalPreferred(m[2], viewportPx);
  return Math.min(max, Math.max(min, mid));
}

function extractClamps(css, prefix) {
  const re = new RegExp(`${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:\\s*([^;]+);`, "g");
  const out = [];
  let match;
  while ((match = re.exec(css))) {
    out.push({ name: prefix, raw: match[1].trim() });
  }
  return out;
}

function collectSteps(css, pattern) {
  const steps = [];
  const re = new RegExp(`(--${pattern}-[^:]+):\\s*([^;]+);`, "g");
  let m;
  while ((m = re.exec(css))) {
    steps.push({ token: m[1], raw: m[2].trim() });
  }
  return steps.sort((a, b) => a.token.localeCompare(b.token, undefined, { numeric: true }));
}

const typography = readFileSync(join(root, "assets/css/tokens/typography.css"), "utf8");
const layout = readFileSync(join(root, "assets/css/tokens/layout.css"), "utf8");

const TYPE_ORDER = [
  "--lowdit-type-xs",
  "--lowdit-type-sm",
  "--lowdit-type-base",
  "--lowdit-type-md",
  "--lowdit-type-lg",
  "--lowdit-type-xl",
  "--lowdit-type-2xl",
  "--lowdit-type-3xl",
  "--lowdit-type-4xl",
];

function readToken(css, token) {
  const m = css.match(new RegExp(`${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:\\s*([^;]+);`));
  return m?.[1]?.trim() ?? "";
}

const typeSteps = TYPE_ORDER.map((token) => ({
  token,
  raw: readToken(typography, token),
})).filter((s) => s.raw);

const SPACE_ORDER = [
  "--lowdit-space-unit",
  ...["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => `--lowdit-space-${n}`),
];

let failed = 0;

function resolveSpace(token, css) {
  if (token === "--lowdit-space-unit") {
    const m = css.match(/--lowdit-space-unit:\s*([^;]+);/);
    return m?.[1]?.trim() ?? "";
  }
  const m = css.match(new RegExp(`${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:\\s*([^;]+);`));
  return m?.[1]?.trim() ?? "";
}

function evalToken(raw, viewportPx, css) {
  if (raw.includes("var(--lowdit-space-unit)")) {
    const unitRaw = resolveSpace("--lowdit-space-unit", css);
    const unit =
      unitRaw.startsWith("clamp") ? evalClamp(unitRaw, viewportPx) : parseFloat(unitRaw);
    const mult = parseFloat(raw.match(/\*\s*(\d+)/)?.[1] ?? "1");
    return unit * mult;
  }
  if (raw.startsWith("clamp(")) return evalClamp(raw, viewportPx);
  if (raw.startsWith("var(")) return null;
  return parseFloat(raw);
}

console.log("Échelles fluides — viewports", VIEWPORTS.join(", "), "px\n");

for (const vp of VIEWPORTS) {
  const sizes = typeSteps.map(({ token, raw }) => ({
    token,
    rem: evalClamp(raw, vp),
  }));
  for (let i = 1; i < sizes.length; i++) {
    if (sizes[i].rem <= sizes[i - 1].rem) {
      console.error(`FAIL typo ${vp}px : ${sizes[i].token} (${sizes[i].rem}) <= ${sizes[i - 1].token}`);
      failed++;
    }
  }
  console.log(
    `Typo @${vp}px :`,
    sizes.map((s) => `${s.token.replace("--lowdit-type-", "")}=${s.rem.toFixed(3)}rem`).join(" "),
  );
}

for (const vp of VIEWPORTS) {
  const sizes = [];
  for (const token of SPACE_ORDER) {
    const raw = resolveSpace(token, layout);
    const rem = evalToken(raw, vp, layout);
    if (rem != null) sizes.push({ token, rem });
  }
  for (let i = 2; i < sizes.length; i++) {
    if (sizes[i].rem <= sizes[i - 1].rem) {
      console.error(`FAIL space ${vp}px : ${sizes[i].token} <= ${sizes[i - 1].token}`);
      failed++;
    }
  }
  console.log(
    `Espace @${vp}px : unit=${sizes[0]?.rem?.toFixed(3)} … space-9=${sizes.at(-1)?.rem?.toFixed(3)}rem`,
  );
}

const measureRaw = /--lowdit-measure:\s*([^;]+);/.exec(typography)?.[1]?.trim();
if (measureRaw?.startsWith("clamp(")) {
  for (const vp of VIEWPORTS) {
    const rem = evalClamp(measureRaw, vp);
    if (rem < 30 || rem > 72) {
      console.error(`FAIL measure @${vp}px : ${rem}rem hors 30–72ch équivalent`);
      failed++;
    }
  }
}

if (failed) {
  console.error(`\n${failed} contrôle(s) en échec.`);
  process.exit(1);
}
console.log("\nÉchelles fluides OK.");
process.exit(0);
