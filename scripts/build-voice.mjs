#!/usr/bin/env node
// Validate data/voice.yaml and emit dist/voice.json, the voice pack the chanmeng.org digital twin reads.
//
// data/voice.yaml is hand-kept, Chan-approved wording (persona, manner, avoid,
// intros, answers, stances, fun_facts, deflect, guards, examples; schema
// version 1, contract in .claude/rules/twin.md). dist/voice.json is that file
// parsed, nothing added; the twin Worker in the 2d-portfolio repo fetches it
// from GitHub Pages. The build fails (exit 1) on:
//
//   - a schema miss: a missing or unknown key, a count or length out of range,
//     a bad `lang`, a duplicate id. English lengths are words; Chinese lengths
//     are reading units: one per CJK character or punctuation mark, one per
//     Latin word, so "hello@chanmeng.org" counts once.
//   - a `source` that does not resolve (required on stances, optional on
//     answers and fun_facts): chanmeng.org/blog/<slug> must be a
//     content/<slug>.mdx in the portfolio repo (PORTFOLIO_DIR, default
//     ../2d-portfolio); chanmeng.org/{,films,work,cv,newsletter} are known;
//     any other https URL must answer 200 within 5 s. --offline skips the
//     network and says how many it skipped.
//   - forbidden content anywhere: a Gmail address, a commit count or solo
//     share, the projects and podcasts kept off visitor surfaces, visa or
//     immigration words, prices and rates, CJK in an English field, and in the
//     twin's own English lines an exclamation mark, an emoji or a word from
//     the avoid list. `guards`, `avoid` and `deflect[].triggers` exist to name
//     these things, so the name and topic rules skip them; the visa line in
//     `deflect` is the decided wording and may say "work rights".
//
//   node scripts/build-voice.mjs [--check] [--offline]
//
// --check    write nothing; exit 1 if dist/voice.json is stale
// --offline  skip the HTTP checks. `npm run build:twin` passes it, so the build
//            (and CI, which runs it) never depends on a third-party site;
//            `npm run check:twin` runs the full check online.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

import { loadProfile } from "./lib/load-profile.mjs";
import { hiddenEntries, forbiddenHit, hasCjk } from "./lib/twin-guards.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(repoRoot, "data", "voice.yaml");
const OUT = path.join(repoRoot, "dist", "voice.json");
const CHECK = process.argv.includes("--check");
const OFFLINE = process.argv.includes("--offline");
const SITE_ROOT = path.resolve(process.env.PORTFOLIO_DIR || path.join(repoRoot, "..", "2d-portfolio"));

const errors = [];
const notes = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);

let voice;
try {
  voice = yaml.load(fs.readFileSync(SRC, "utf8"));
} catch (e) {
  console.error(`data/voice.yaml does not parse: ${e.message}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Measures
// ---------------------------------------------------------------------------
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
const zhUnits = (s) => {
  const t = String(s);
  const cjk = (t.match(/[　-〿㐀-鿿＀-￯“”‘’—…·]/g) ?? []).length;
  const latin = (t.replace(/[　-〿㐀-鿿＀-￯“”‘’—…·]/g, " ").match(/[A-Za-z0-9][\w@.+/:'-]*/g) ?? []).length;
  return cjk + latin;
};
const isStr = (v) => typeof v === "string" && v.trim().length > 0;
const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function str(where, v, { maxWords, minWords, maxZh, minZh } = {}) {
  if (!isStr(v)) return err(where, "must be a non-empty string");
  if (maxWords && words(v) > maxWords) err(where, `${words(v)} words, limit ${maxWords}`);
  if (minWords && words(v) < minWords) err(where, `${words(v)} words, minimum ${minWords}`);
  if (maxZh && zhUnits(v) > maxZh) err(where, `${zhUnits(v)} characters, limit ${maxZh}`);
  if (minZh && zhUnits(v) < minZh) err(where, `${zhUnits(v)} characters, minimum ${minZh}`);
}
function list(where, v, min, max) {
  if (!Array.isArray(v)) { err(where, "must be a list"); return []; }
  if (v.length < min || v.length > max) err(where, `${v.length} items, expected ${min}–${max}`);
  return v;
}
function keys(where, obj, required, optional = []) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) { err(where, "must be a mapping"); return false; }
  for (const k of required) if (!(k in obj)) err(where, `missing key "${k}"`);
  for (const k of Object.keys(obj)) if (![...required, ...optional].includes(k)) err(where, `unknown key "${k}"`);
  return true;
}
function ids(where, items) {
  const seen = new Set();
  items.forEach((it, i) => {
    if (!it || !kebab.test(it.id ?? "")) err(`${where}[${i}].id`, `"${it?.id}" is not kebab-case`);
    else if (seen.has(it.id)) err(`${where}[${i}].id`, `duplicate id "${it.id}"`);
    else seen.add(it.id);
  });
}

// ---------------------------------------------------------------------------
// Schema (version 1)
// ---------------------------------------------------------------------------
const sources = []; // [where, url, required]
if (keys("voice.yaml", voice, ["version", "updated", "persona", "manner", "avoid", "intros", "answers", "stances", "fun_facts", "deflect", "guards", "examples"])) {
  if (voice.version !== 1) err("version", `expected 1, got ${voice.version}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(voice.updated))) err("updated", "must be a quoted YYYY-MM-DD date");

  if (keys("persona", voice.persona, ["en", "zh"])) {
    str("persona.en", voice.persona.en, { minWords: 120, maxWords: 200 });
    str("persona.zh", voice.persona.zh, { minZh: 150, maxZh: 250 });
  }
  list("manner", voice.manner, 6, 10).forEach((m, i) => str(`manner[${i}]`, m));
  list("avoid", voice.avoid, 1, 60).forEach((m, i) => str(`avoid[${i}]`, m));
  list("guards", voice.guards, 1, 60).forEach((m, i) => str(`guards[${i}]`, m));

  if (keys("intros", voice.intros, ["en", "zh"])) {
    const lim = { en: [25, 60, 140], zh: [40, 100, 220] };
    for (const lang of ["en", "zh"]) {
      if (!keys(`intros.${lang}`, voice.intros[lang], ["one_line", "short", "long"])) continue;
      ["one_line", "short", "long"].forEach((k, i) =>
        str(`intros.${lang}.${k}`, voice.intros[lang][k], lang === "en" ? { maxWords: lim.en[i] } : { maxZh: lim.zh[i] }));
    }
  }

  const answers = list("answers", voice.answers, 8, 14);
  ids("answers", answers);
  answers.forEach((a, i) => {
    const w = `answers[${i}] (${a?.id})`;
    if (!keys(w, a, ["id", "asks", "en", "zh"], ["source"])) return;
    list(`${w}.asks`, a.asks, 2, 5).forEach((q, j) => str(`${w}.asks[${j}]`, q));
    str(`${w}.en`, a.en, { maxWords: 70 });
    str(`${w}.zh`, a.zh, { maxZh: 120 });
    if ("source" in a) sources.push([`${w}.source`, a.source]);
  });

  const stances = list("stances", voice.stances, 6, 10);
  ids("stances", stances);
  stances.forEach((s, i) => {
    const w = `stances[${i}] (${s?.id})`;
    if (!keys(w, s, ["id", "asks", "en", "zh", "source"])) return;
    list(`${w}.asks`, s.asks, 1, 5).forEach((q, j) => str(`${w}.asks[${j}]`, q));
    str(`${w}.en`, s.en, { maxWords: 80 });
    str(`${w}.zh`, s.zh, { maxZh: 160 });
    sources.push([`${w}.source`, s.source]);
  });

  list("fun_facts", voice.fun_facts, 5, 8).forEach((f, i) => {
    const w = `fun_facts[${i}]`;
    if (!keys(w, f, ["en", "zh"], ["source"])) return;
    str(`${w}.en`, f.en, { maxWords: 40 });
    str(`${w}.zh`, f.zh, { maxZh: 80 });
    if ("source" in f) sources.push([`${w}.source`, f.source]);
  });

  const deflect = list("deflect", voice.deflect, 1, 20);
  ids("deflect", deflect);
  deflect.forEach((d, i) => {
    const w = `deflect[${i}] (${d?.id})`;
    if (!keys(w, d, ["id", "triggers", "en", "zh"])) return;
    list(`${w}.triggers`, d.triggers, 1, 30).forEach((t, j) => str(`${w}.triggers[${j}]`, t));
    str(`${w}.en`, d.en, { maxWords: 40 });
    str(`${w}.zh`, d.zh, { maxZh: 80 });
  });

  const examples = list("examples", voice.examples, 18, 24);
  examples.forEach((x, i) => {
    const w = `examples[${i}]`;
    if (!keys(w, x, ["lang", "user", "twin"], ["page"])) return;
    if (!["en", "zh"].includes(x.lang)) err(`${w}.lang`, `"${x.lang}" is not en or zh`);
    if ("page" in x && !/^\/[\w\-/]*$/.test(String(x.page))) err(`${w}.page`, `"${x.page}" is not a site path`);
    str(`${w}.user`, x.user);
    str(`${w}.twin`, x.twin, x.lang === "zh" ? { maxZh: 160 } : { maxWords: 90 });
  });
  const zhShare = examples.filter((x) => x?.lang === "zh").length / Math.max(1, examples.length);
  if (zhShare < 0.25 || zhShare > 0.45) err("examples", `${Math.round(zhShare * 100)}% are Chinese, expected about one third (25–45%)`);
}

// ---------------------------------------------------------------------------
// Forbidden content
// ---------------------------------------------------------------------------
const profile = loadProfile();
const hidden = hiddenEntries(profile);

// Every string with its path.
const strings = [];
const walk = (v, p) => {
  if (typeof v === "string") strings.push([p, v]);
  else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${p}[${i}]`));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, p ? `${p}.${k}` : k);
};
walk(voice, "");

const NAMING = /^(guards|avoid)\[|^deflect\[\d+\]\.triggers/; // fields that exist to name forbidden things
const VISA_LINE = /^deflect\[\d+\]\.(en|zh)$/;
const RULES = [
  { re: /@gmail\.com/i, label: "a Gmail address" },
  { re: /\d[\d,]*\+?\s*(?:solo\s+|non-merge\s+)?commits/i, label: "a commit count" },
  { re: /\d+(?:\.\d+)?\s*%\s*(?:of\s+)?(?:the\s+)?commits/i, label: "a commit share" },
  { re: /solo commits/i, label: "solo commits" },
  { re: /GenLAB|LYZEN|Seismophone|sunostats|Chromaflow|gradient-svg-generator|podcast|播客/i, label: "an entry kept off visitor surfaces", skip: NAMING },
  { re: /visa|work rights|immigration|签证|工签|移民/i, label: "visa or immigration wording", skip: (p) => NAMING.test(p) || VISA_LINE.test(p) },
  { re: /NZD|USD|\$\s?\d|per hour|per day|day rate|\/hr\b|元\//i, label: "a price or rate", skip: NAMING },
];
const EN_FIELD = /^(persona\.en|manner\[|guards\[|intros\.en\.|answers\[\d+\]\.en$|stances\[\d+\]\.en$|fun_facts\[\d+\]\.en$|deflect\[\d+\]\.en$)/;
const enExample = (p) => {
  const m = /^examples\[(\d+)\]\.(user|twin)$/.exec(p);
  return m && voice.examples?.[+m[1]]?.lang === "en";
};
// The twin's own English lines: no "!", no emoji, no avoid-list words.
const TWIN_EN = (p) => /^(persona\.en|intros\.en\.|answers\[\d+\]\.en$|stances\[\d+\]\.en$|fun_facts\[\d+\]\.en$|deflect\[\d+\]\.en$)/.test(p) || (/\.twin$/.test(p) && enExample(p));
const BANNED_WORDS = /\b(passionate|leverag\w*|delve\w*|journey|thrilled|game-changer|cutting-edge|synerg\w*)\b|I'm excited|I am excited/i;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}]/u;

for (const [p, s] of strings) {
  for (const r of RULES) {
    if (r.skip && (typeof r.skip === "function" ? r.skip(p) : r.skip.test(p))) continue;
    if (r.re.test(s)) err(p, `${r.label}: "${s.match(r.re)[0]}"`);
  }
  // Data-derived names of hidden entries (the static list above covers the
  // well-known ones; this catches the rest, e.g. the *-mv projects).
  if (!NAMING.test(p)) {
    const hit = forbiddenHit(s, hidden, { skipStatic: ["an email address other than hello@chanmeng.org"] });
    if (hit) err(p, `forbidden: ${hit}`);
  }
  if ((EN_FIELD.test(p) || enExample(p)) && hasCjk(s)) err(p, "CJK characters in an English field");
  if (TWIN_EN(p)) {
    if (s.includes("!")) err(p, "exclamation mark in the twin's English");
    if (EMOJI.test(s)) err(p, "emoji in the twin's English");
    if (BANNED_WORDS.test(s)) err(p, `avoid-list word: "${s.match(BANNED_WORDS)[0]}"`);
  }
  if (/^examples\[\d+\]\.twin$/.test(p) && EMOJI.test(s)) err(p, "emoji in a reply");
}

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------
const KNOWN = new Set(["", "/", "/films", "/work", "/cv", "/newsletter"]);
const blogSlugs = fs.existsSync(path.join(SITE_ROOT, "content"))
  ? new Set(fs.readdirSync(path.join(SITE_ROOT, "content")).filter((f) => /\.mdx?$/.test(f)).map((f) => f.replace(/\.mdx?$/, "")))
  : null;
if (!blogSlugs) notes.push(`portfolio repo not found at ${SITE_ROOT} (set PORTFOLIO_DIR): blog sources are ${OFFLINE ? "not checked" : "checked over HTTP"}`);

const toFetch = [];
for (const [where, src] of sources) {
  if (!isStr(src)) { err(where, "must be a URL"); continue; }
  let url;
  try { url = new URL(src); } catch { err(where, `"${src}" is not a URL`); continue; }
  if (url.protocol !== "https:") { err(where, `"${src}" is not https`); continue; }
  if (url.hostname === "chanmeng.org" || url.hostname === "www.chanmeng.org") {
    const p = url.pathname.replace(/\/$/, "");
    if (KNOWN.has(p)) continue;
    const blog = /^\/blog\/([\w-]+)$/.exec(p);
    if (blog && blogSlugs) {
      if (!blogSlugs.has(blog[1])) err(where, `no content/${blog[1]}.mdx in ${SITE_ROOT}`);
      continue;
    }
  }
  toFetch.push([where, src]);
}

async function status(u) {
  try {
    const r = await fetch(u, { redirect: "follow", signal: AbortSignal.timeout(5000), headers: { "user-agent": "chanmeng666-build-voice" } });
    return r.status;
  } catch (e) {
    return e.name === "TimeoutError" ? "timeout" : e.message;
  }
}
if (OFFLINE) {
  if (toFetch.length) notes.push(`offline: ${toFetch.length} source URL(s) not fetched`);
} else {
  const unique = [...new Set(toFetch.map(([, u]) => u))];
  const codes = new Map(await Promise.all(unique.map(async (u) => [u, await status(u)])));
  for (const [where, u] of toFetch) if (codes.get(u) !== 200) err(where, `${u} answered ${codes.get(u)}, expected 200`);
}

// ---------------------------------------------------------------------------
// Report and write
// ---------------------------------------------------------------------------
for (const n of notes) console.log(`note: ${n}`);
if (errors.length) {
  console.error(`data/voice.yaml: ${errors.length} problem(s)`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

const json = JSON.stringify(voice, null, 2) + "\n";
// What the twin Worker puts in its cached prompt, estimated its way (one token
// per CJK character, other text at 3.5 characters a token). Its whole static
// prefix budget is about 6,000 tokens, of which rules and profile take ~3,200.
const tokens = (() => {
  const all = [];
  const collect = (v) => typeof v === "string" ? all.push(v) : Array.isArray(v) ? v.forEach(collect) : v && typeof v === "object" ? Object.values(v).forEach(collect) : null;
  collect({ persona: voice.persona, manner: voice.manner, avoid: voice.avoid, guards: voice.guards, deflect: voice.deflect,
    answers: voice.answers.map((a) => ({ asks: a.asks, en: a.en, zh: a.zh })), examples: voice.examples });
  const t = all.join("\n");
  const cjk = (t.match(/[　-〿㐀-鿿＀-￯]/g) ?? []).length;
  return Math.round(cjk + (t.length - cjk) / 3.5);
})();
const summary = `${voice.answers.length} answers, ${voice.stances.length} stances, ${voice.fun_facts.length} fun facts, ${voice.deflect.length} deflections, ${voice.guards.length} guards, ${voice.examples.length} examples; ~${tokens} prompt tokens`;
if (CHECK) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8").replace(/\r\n/g, "\n") : "";
  if (current !== json) {
    console.error("dist/voice.json is stale: run `npm run build:twin`");
    process.exit(1);
  }
  console.log(`dist/voice.json is current (${summary})`);
} else {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, json);
  console.log(`dist/voice.json: ${summary}`);
}
