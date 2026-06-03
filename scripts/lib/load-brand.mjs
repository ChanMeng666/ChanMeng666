// Shared loader for data/brand.yaml. Used by scripts/build-brand.mjs (which
// then emits derived artifacts) and scripts/build.mjs (which consumes the
// emitted tokens.json — NOT this module — to avoid re-running validation on
// every README rebuild).
//
// Exporting the loader as a module lets future tooling import brand.yaml
// without duplicating the load + validate logic.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

export function loadBrand({ validate: shouldValidate = true } = {}) {
  const yamlPath = path.join(repoRoot, "data", "brand.yaml");
  const schemaPath = path.join(repoRoot, "schema", "brand.schema.json");

  const brand = yaml.load(fs.readFileSync(yamlPath, "utf8"));

  if (shouldValidate) {
    const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    const validate = ajv.compile(schema);
    if (!validate(brand)) {
      console.error("✗ data/brand.yaml failed schema validation. Run `npm run validate` for details.");
      for (const err of validate.errors ?? []) {
        console.error(`  ${err.instancePath || "(root)"}  ${err.message}`);
      }
      process.exit(1);
    }
  }

  return brand;
}

// Resolve every semantic color reference to its raw hex value.
// Returns a new object; does not mutate the input.
export function resolveSemanticColors(brand) {
  const raw = brand.color?.raw ?? {};
  const semantic = brand.color?.semantic ?? {};
  const resolved = {};
  for (const [name, ref] of Object.entries(semantic)) {
    if (typeof ref !== "string") {
      resolved[name] = ref;
      continue;
    }
    if (ref.startsWith("#")) {
      resolved[name] = ref;
      continue;
    }
    if (raw[ref] != null) {
      resolved[name] = raw[ref];
    } else {
      throw new Error(`color.semantic.${name} references '${ref}' not in color.raw.*`);
    }
  }
  return resolved;
}

// ---------------------------------------------------------------------------
// WCAG contrast ratio. Pure function — used by the build's accessibility gate
// (scripts/build-brand.mjs) so orange-on-light / violet-as-text regressions are
// caught before any artifact is written. Returns the ratio (1–21) for two
// 6-digit hex colors per WCAG 2.x relative-luminance.
// ---------------------------------------------------------------------------
export function contrastRatio(hexA, hexB) {
  const lum = (hex) => {
    const m = String(hex).replace(/^#/, "");
    const ch = [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16) / 255);
    const lin = ch.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  };
  const a = lum(hexA);
  const b = lum(hexB);
  const [hi, lo] = a >= b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

// camelCase + alpha+digit → kebab-case. paper50 → paper-50; canvasPage → canvas-page.
export function kebab(s) {
  return String(s)
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([a-zA-Z])([0-9])/g, "$1-$2")
    .toLowerCase();
}

export { repoRoot };
