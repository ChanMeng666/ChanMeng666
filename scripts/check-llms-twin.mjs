#!/usr/bin/env node
// Check dist/llms-twin.txt against the twin's display rules; exit 1 on any hit.
//
// A second, independent pass over what scripts/build-llms-twin.mjs wrote, so a
// change to the builder or to the data cannot quietly let something through:
//
//   - every name and id of an entry with show.site or show.llms false, the
//     hosted podcasts and the *-mv collections (derived from the data by
//     scripts/lib/twin-guards.mjs, the same list the builder filters on)
//   - a Gmail or any address but hello@chanmeng.org; "Contact:
//     hello@chanmeng.org" exactly once, in "## Who I am"
//   - commit counts, solo and authorship shares, "professional tone",
//     "industry placement", "validated by", coursework and placement wording,
//     She Sharp's unsourced figures, money amounts, podcast links (Spotify,
//     Apple Podcasts, Xiaoyuzhou), street addresses, PO boxes and postcodes
//   - GAVIGO: every paragraph, bullet or row with one of its figures also says
//     "controlled" and "not a production SLA"; inside a GAVIGO section every
//     percentage or second/millisecond figure is 78%, 4.45 s, 1.00 s or 140 ms
//   - structure: the file starts with "## Who I am" and has every section the
//     twin Worker expects
//
//   node scripts/check-llms-twin.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadProfile } from "./lib/load-profile.mjs";
import { hiddenEntries, STATIC_PATTERNS, GAVIGO_FIGURE, GAVIGO_NOTE, GAVIGO_ALLOWED, NUMBER_WITH_UNIT } from "./lib/twin-guards.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILE = path.join(repoRoot, "dist", "llms-twin.txt");
if (!fs.existsSync(FILE)) {
  console.error("dist/llms-twin.txt is missing: run `npm run build:twin`");
  process.exit(1);
}
const text = fs.readFileSync(FILE, "utf8").replace(/\r\n/g, "\n");
const lines = text.split("\n");
const hidden = hiddenEntries(loadProfile());
const errors = [];
const err = (n, msg) => errors.push(`dist/llms-twin.txt:${n}: ${msg}`);

// Structure.
const SECTIONS = ["Who I am", "Current roles", "Flagship projects", "Open source", "Awards and recognition", "Publications and media", "Talks and events", "Education", "Skills", "What people say", "Films", "Engineering stories"];
if (!text.startsWith("## Who I am\n")) err(1, 'the file must start with "## Who I am"');
const h2 = lines.map((l) => /^## (.*)$/.exec(l)?.[1]).filter(Boolean);
for (const s of SECTIONS) if (!h2.includes(s)) err(0, `missing section "## ${s}"`);
const contact = lines.map((l, i) => [l, i + 1]).filter(([l]) => l === "Contact: hello@chanmeng.org");
if (contact.length !== 1) err(0, `"Contact: hello@chanmeng.org" appears ${contact.length} times, expected once`);
else if (contact[0][1] > lines.indexOf("## Current roles")) err(contact[0][1], 'the contact line belongs in "## Who I am"');

// Forbidden names and patterns, line by line.
const heading = []; // current heading path, for the GAVIGO scope
lines.forEach((line, i) => {
  const n = i + 1;
  const hm = /^(#{2,4}) (.*)$/.exec(line);
  if (hm) heading.splice(hm[1].length - 2, Infinity, hm[2]);
  for (const h of hidden) for (const t of h.terms) if (t.re.test(line)) err(n, `names ${h.key} ("${line.match(t.re)[0]}")`);
  for (const [re, label] of STATIC_PATTERNS) if (re.test(line)) err(n, `${label}: "${line.match(re)[0]}"`);

  if (GAVIGO_FIGURE.test(line) && !GAVIGO_NOTE(line)) err(n, 'a GAVIGO figure without "controlled" and "not a production SLA" beside it');
  if (heading.some((h) => /gavigo/i.test(h)) || /gavigo/i.test(line)) {
    for (const m of line.matchAll(NUMBER_WITH_UNIT)) {
      const v = m[0].trim();
      if (!GAVIGO_ALLOWED.some((re) => re.test(v))) err(n, `"${v}" in a GAVIGO section is not one of the approved figures (78%, 4.45 s → 1.00 s, ~140 ms)`);
    }
  }
});

if (errors.length) {
  console.error(`dist/llms-twin.txt: ${errors.length} problem(s)`);
  for (const e of errors.slice(0, 200)) console.error(`  ${e}`);
  if (errors.length > 200) console.error(`  … and ${errors.length - 200} more`);
  process.exit(1);
}
const terms = hidden.reduce((n, h) => n + h.terms.length, 0);
console.log(`dist/llms-twin.txt: clean (${lines.length} lines; ${hidden.length} hidden entries, ${terms} names; ${STATIC_PATTERNS.length} static patterns; GAVIGO figures bounded)`);
