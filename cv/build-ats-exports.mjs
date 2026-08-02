#!/usr/bin/env node
// Generate the manual-upload ATS deliverables from cv/chan-meng-cv-ats.typ.
//
//   node cv/build-ats-exports.mjs cv/chan-meng-cv-ats.typ --check
//   node cv/build-ats-exports.mjs cv/chan-meng-cv-ats.typ \
//       --docx cv/exports/chan-meng-cv-ats.docx --txt cv/exports/chan-meng-cv-ats.txt
//
// --check parses and runs every guard, prints a one-line summary, and writes
// nothing. It needs no typst, which is why `npm run check` and the PR workflow
// can run it on every change while the PDFs stay a manual build.
//
// This script WRITES ITS OWN FILES rather than printing to stdout like
// cv/build-jsonld.mjs and cv/build-llms-txt.mjs. Those are piped through
// PowerShell's `| Out-File` in cv/build.ps1, which would (a) decode a .docx as
// text and corrupt the ZIP, and (b) rejoin lines with CRLF.

import fs from "node:fs";
import path from "node:path";
import { parseAtsResumeFile, flattenAll, EXPECT } from "../scripts/lib/parse-ats-resume.mjs";
import { buildDocx } from "./ats-docx.mjs";
import { buildTxt } from "./ats-txt.mjs";

function arg(name) {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : process.argv[i + 1];
}

const source = process.argv[2] && !process.argv[2].startsWith("--")
  ? process.argv[2]
  : "cv/chan-meng-cv-ats.typ";
const checkOnly = process.argv.includes("--check");
const docxOut = arg("--docx");
const txtOut = arg("--txt");

/**
 * Pack with a FROZEN clock and a FROZEN PRNG.
 *
 * cv/exports/ is TRACKED in git, so a .docx whose bytes change on every build
 * would churn the repository on every run — the exact invariant that
 * cv/chan-meng-cv-ats.typ's document date was pinned to protect. Three
 * independent sources of non-determinism live inside `docx` and none of them is
 * configurable through its API:
 *
 *   1. its packer hands every entry to JSZip with no `date`, so each ZIP entry
 *      is stamped with `new Date()`;
 *   2. CoreProperties auto-populates dcterms:created / dcterms:modified;
 *   3. it bundles `nanoid/non-secure` — which is `Math.random()` — to mint the
 *      r:id of every hyperlink relationship and the w:docId. MEASURED: with
 *      only the clock frozen, two consecutive builds still differed in
 *      word/document.xml and word/_rels/document.xml.rels across all 29 links.
 *
 * Freezing Date pins (1) and (2) to the resume's revision date — a more truthful
 * "created" than the wall clock of whoever last ran the build. Freezing
 * Math.random with a small fixed-seed PRNG pins (3): the ids stay opaque and
 * unique within the document, they just stop being different every time.
 *
 * A Proxy rather than `class extends Date` so instanceof, statics and
 * Symbol.toPrimitive keep working; both globals are restored in `finally`.
 */
async function packDeterministically(model) {
  const pin = new Date(`${model.documentDate}T00:00:00Z`);
  const RealDate = Date;
  const realRandom = Math.random;

  globalThis.Date = new Proxy(RealDate, {
    construct: (Target, args) => (args.length ? new Target(...args) : new Target(pin)),
    get: (Target, prop, recv) => (prop === "now" ? () => pin.getTime() : Reflect.get(Target, prop, recv)),
  });
  // mulberry32 — 4 lines, no dependency, uniform enough that nanoid's ids stay
  // collision-free across the ~40 it mints per build.
  let seed = 0x9e3779b9;
  Math.random = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  try {
    return await buildDocx(model);
  } finally {
    globalThis.Date = RealDate;
    Math.random = realRandom;
  }
}

function write(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
  return fs.statSync(file).size;
}

try {
  const model = parseAtsResumeFile(source);
  const chars = flattenAll(model).length;
  const roles = model.sections.flatMap((s) => s.blocks).filter((b) => b.type === "role");

  const summary =
    `${model.sections.length} sections · ${roles.length} roles ` +
    `(${roles.filter((r) => r.bullets.length).length} detailed, ${roles.filter((r) => r.compact).length} compact) · ` +
    `${model.sections.flatMap((s) => s.blocks).filter((b) => b.type === "project").length} projects · ` +
    `${model.sections.flatMap((s) => s.blocks).filter((b) => b.type === "education").length} education · ` +
    `${chars} chars · rev ${model.documentDate}`;

  if (checkOnly) {
    console.log(`✓ ATS resume parses: ${summary}`);
    process.exit(0);
  }

  if (!docxOut && !txtOut) {
    console.error("Nothing to do: pass --check, or --docx <path> and/or --txt <path>.");
    process.exit(2);
  }

  if (txtOut) {
    const n = write(txtOut, Buffer.from(buildTxt(model), "utf8"));
    console.log(`  ${txtOut}  ${n.toLocaleString()} bytes`);
  }
  if (docxOut) {
    const n = write(docxOut, await packDeterministically(model));
    console.log(`  ${docxOut}  ${n.toLocaleString()} bytes`);
  }
  console.log(`✓ ATS exports written: ${summary}`);
} catch (err) {
  console.error(`✗ ${err.message}`);
  console.error(
    "\nThe .docx and .txt are PARSED from the Typst source, so a structural change " +
    "there must be taught to scripts/lib/parse-ats-resume.mjs (and its EXPECT counts) " +
    "before this can run. Failing loudly is deliberate — a silently truncated resume " +
    "would still look fine in the PDF.",
  );
  process.exit(1);
}

// Referenced so a reader of the failure path can find the counts quickly.
void EXPECT;
