#!/usr/bin/env node
// Generate docs/INDEX.md and scripts/README.md: the map of what this repo knows and the index of
// its scripts.
//
//   data/profile/*.yaml          shards: top-level keys, entry counts, header title
//   docs/**/*.md, cv/*, …        guidance docs: lines, first heading, a "read when" hint
//   .claude/skills, .claude/rules  procedures and path-scoped rules (front matter)
//   x/ linkedin/ suno/ youtube/ distribution/   platform registers: first comment line
//   package.json + scripts/*.mjs  every npm script, grouped; every script, with its header line
//
// WHY THE FILE LIST COMES FROM GIT:
//
// The index must come out the same on every machine, CI included. So the files it lists are
// the ones git tracks plus untracked files that are not ignored (`git ls-files -co
// --exclude-standard`). Gitignored, local-only paths (`*.private.*`, `_private/`, `_intake/`)
// are declared by name in LOCAL_ONLY below and never read: their contents must not reach a
// tracked file.
//
// WHAT IS HAND-WRITTEN HERE:
//
// READ_WHEN (one hint per guidance doc), NPM_GROUP (the few npm scripts whose name does not
// say their group), RAW_SOURCES, LOCAL_ONLY and SCRIPT_DIRS. A doc or script nobody has
// described yet still appears, with "—" in place of the hint, so the index never hides a file.
//
// An orphan is a scripts/*.mjs file that no npm script, no other script, no CI workflow and no
// doc names.
//
//   node scripts/build-kb-index.mjs [--check]
//
// --check   write nothing; exit 1 if docs/INDEX.md or scripts/README.md would change

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SELF = "scripts/build-kb-index.mjs";
const INDEX_OUT = "docs/INDEX.md";
const SCRIPTS_OUT = "scripts/README.md";

const check = process.argv.slice(2).includes("--check");

// ---------------------------------------------------------------------------
// Hand maps
// ---------------------------------------------------------------------------

// When an agent should open each guidance doc. Keyed by repo path.
const READ_WHEN = {
  "CLAUDE.md": "always: the schema, hard rules and workflow",
  "docs/STATE.md": "always: Chan's decisions and display rules, before any edit",
  "docs/LOG.md": "to see what changed recently; append an entry after a change",
  "docs/INDEX.md": "always: to find which file to read next",
  "docs/animated-svg-cards.md": "making or changing a README project card",
  "docs/brand/DESIGN.md": "drawing anything in the Caldera brand system (colour, type, voice)",
  "docs/ecosystem/README.md":
    "a repo is created, archived, renamed, transferred or deleted; editing lineage.yaml",
  "docs/ecosystem/archlang-archcanvas.md": "working across the ArchLang / ArchCanvas repos",
  "docs/github-theme-aware-assets.md": "an image may break on GitHub's light or dark canvas",
  "docs/operations/README.md":
    "archiving, deleting or making a repo private; retiring a hosted site; npm publishing",
  "docs/stories/README.md": "writing or editing a project story",
  "docs/stories/narrative.md":
    "preparing an interview or cover letter: the threads across all projects",
  "cv/README.md": "building a CV or changing any CV copy",
  "cv/TYPST_PITFALLS.md": "editing any .typ file under cv/",
  "cv/cover-letter/README.md": "writing a cover letter",
  "cv/cover-letter/TEMPLATE.md": "drafting a cover letter (the five-move skeleton)",
  "cv/cover-letter/EVIDENCE.md": "choosing source-attributed claims for a cover letter",
  "cv/exports/README.md": "uploading a CV to a job portal, or touching cv/exports/",
  "distribution/README.md":
    "what is due to post; drafting or publishing a film post; editing plan.yaml",
  "youtube/README.md": "changing a YouTube title, description, playlist or the banner",
  "x/README.md": "anything about the X account, its register or its brand package",
  "x/x-strategy.md": "planning X content or running the monthly X review",
  "linkedin/README.md": "anything about LinkedIn posts, profile copy or visuals",
  "suno/README.md": "anything about Chan's Suno songs, playlists or the register",
  "media-kit/README.md": "rebuilding the speaker and media kit PDF",
  "evidence/README.md": "adding or rendering raw evidence",
  "scripts/README.md": "finding which script does what, and how to run it",
};
// Every project story shares one hint.
const STORY_READ_WHEN = "preparing an interview or cover letter about this project";

// npm scripts whose group their name does not give away.
const NPM_GROUP = {
  calendar: "build",
  validate: "check",
  audit: "check",
  "refresh-metrics": "sync-capture",
  reviewed: "edit-helper",
};
const NPM_GROUP_ORDER = ["build", "check", "sync-capture", "edit-helper", "other"];
const NPM_GROUP_TITLE = {
  build: "Build",
  check: "Check",
  "sync-capture": "Sync and capture",
  "edit-helper": "Edit helpers",
  other: "Other",
};

// Raw sources: declared, never listed. `kind` is computed from git.
const RAW_SOURCES = [
  ["docs/stories/_private/", "Story layer: architecture diagrams, private evidence, raw exports"],
  ["data/_intake/", "Multi-entry edits staged for Chan's per-entry review"],
  ["evidence/", "Collage sources rendered into public/evidence/collages/"],
  ["linkedin/screenshots/", "Production screenshots for LinkedIn project sections"],
  ["x/screenshots/", "Screenshots of the X profile"],
  ["*/capture/latest.json", "Last capture of each live platform; registers are built from it"],
  ["archive/", "Archived material"],
];

// Gitignored overlays and working files. Named so an agent knows they may exist; never read.
const LOCAL_ONLY = [
  ["docs/STATE.private.md", "Candid half of docs/STATE.md"],
  ["docs/ecosystem/lineage.private.yaml", "Lineage rows for sensitive repos"],
  ["docs/operations/*.private.md", "Hosting and operations specifics"],
  ["youtube/*.private.yaml", "Unlisted and private video inventory"],
  ["linkedin/*.private.yaml, linkedin/capture/*.private.json", "LinkedIn impressions"],
  ["distribution/drafts/", "Draft post text not yet approved"],
  ["distribution/_staging/", "Staged video files"],
  ["distribution/master-calendar.md", "The merged calendar (`npm run calendar`)"],
];

// Subdirectories of scripts/, one line each.
const SCRIPT_DIRS = {
  "scripts/lib": "Shared modules: the profile and brand loaders, copy surfaces, ATS and Typst parsers, triage pages",
  "scripts/lib/svg-card": "The animated-card kit: shell, glyph outlining, film frames, layout plan",
  "scripts/cards": "One module per README project card, run by `npm run build:cards`",
  "scripts/readme-art": "Banners, pills, the film wall and story art, run by `npm run build:art`",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), "utf8").replace(/\r\n/g, "\n");
const lineCount = (text) => {
  const t = text.endsWith("\n") ? text.slice(0, -1) : text;
  return t === "" ? 0 : t.split("\n").length;
};
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const cell = (s) => String(s).replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
const code = (s) => "`" + s + "`";

// Files git tracks, plus untracked files that are not ignored.
const FILES = execFileSync("git", ["ls-files", "-co", "--exclude-standard", "-z"], {
  cwd: repoRoot,
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
})
  .split("\0")
  .filter(Boolean)
  .filter((f) => fs.existsSync(path.join(repoRoot, f)))
  .sort(cmp);
const FILESET = new Set(FILES);
const has = (rel) => FILESET.has(rel);
const under = (dir) => FILES.filter((f) => f.startsWith(dir));

const isIgnored = (rel) => {
  try {
    execFileSync("git", ["check-ignore", "-q", rel], { cwd: repoRoot, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

// Plain text from a markdown line: no heading marks, emphasis, code ticks or link targets.
const stripMd = (s) =>
  s
    .replace(/^#+\s*/, "")
    .replace(/^>\s*/, "")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .trim();

// First sentence of a run of text, capped.
const ABBREV = /\b(e\.g|i\.e|etc|vs|cf)\./g;
const firstSentence = (s, cap = 200) => {
  const masked = s.replace(ABBREV, (x) => x.replace(/\./g, "\u0000"));
  const m = masked.match(/^(.+?[.!?])(\s|$)/);
  let out = (m ? m[1] : masked).replace(/\u0000/g, ".").trim();
  // A paragraph that stops mid-sentence (it runs into a diagram) is marked as cut.
  if (!m && /[\w)]$/.test(out)) out += " …";
  out = out.replace(/[,:;]\s*$/, "").trim();
  if (out.length > cap) out = out.slice(0, cap - 1).replace(/\s+\S*$/, "") + "…";
  return out;
};

// Strip "name.ext — " from the start of a header line.
const stripSelfName = (s) => {
  const t = s.replace(/^[\w./-]+\.(?:ya?ml|m?js)\s+[—–-]+\s+/, "");
  return t.charAt(0).toUpperCase() + t.slice(1);
};

// Front matter of a markdown file, or null.
const frontMatter = (text) => {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { data: null, body: text };
  let data = null;
  try {
    data = yaml.load(m[1]);
  } catch {
    data = null;
  }
  return { data, body: text.slice(m[0].length) };
};

// First heading, or first non-empty line, of a markdown body.
const mdPurpose = (body) => {
  const lines = body.split("\n");
  const h1 = lines.find((l) => /^#\s+\S/.test(l));
  if (h1) return stripMd(h1);
  const first = lines.find((l) => l.trim() && !/^<!--/.test(l.trim()));
  return first ? firstSentence(stripMd(first)) : "—";
};

// The first paragraph of a YAML file's leading comment block, skipping rule lines.
const yamlPurpose = (text) => {
  const para = [];
  for (const line of text.split("\n")) {
    if (!line.startsWith("#")) break;
    const t = line.replace(/^#\s?/, "");
    if (/^[=\-#\s]{5,}$/.test(t) || !t.trim()) {
      if (para.length) break;
      continue;
    }
    para.push(t.trim());
  }
  return para.length ? firstSentence(stripSelfName(para.join(" "))) : "—";
};

// The first paragraph of a script's leading // comment, first sentence only.
const scriptPurpose = (text) => {
  const lines = text.split("\n");
  let i = lines[0]?.startsWith("#!") ? 1 : 0;
  const para = [];
  for (; i < lines.length; i++) {
    const m = lines[i].match(/^\s*\/\/ ?(.*)$/);
    if (!m) break;
    const t = m[1];
    if (!t.trim()) {
      if (para.length) break;
      continue;
    }
    if (para.length && /^\s{2,}/.test(t)) break; // an indented diagram ends the paragraph
    para.push(t.trim());
  }
  return para.length ? firstSentence(stripSelfName(para.join(" ")), 220) : "—";
};

// ---------------------------------------------------------------------------
// Data: shards and other knowledge files
// ---------------------------------------------------------------------------

const shardFiles = under("data/profile/").filter((f) => /^data\/profile\/[^/]+\.ya?ml$/.test(f));
const shards = shardFiles.map((rel) => {
  const text = read(rel);
  let doc = {};
  try {
    doc = yaml.load(text) ?? {};
  } catch (e) {
    throw new Error(`${rel}: YAML does not parse: ${e.message}`);
  }
  const keys = Object.keys(doc).map((k) => {
    const v = doc[k];
    const n = Array.isArray(v) ? `${v.length}` : v && typeof v === "object" ? `${Object.keys(v).length} keys` : "1";
    return `${k} (${n})`;
  });
  return {
    rel,
    lines: lineCount(text),
    keys,
    purpose: yamlPurpose(text),
    localOnly: /\.private\./.test(rel),
  };
});

const otherData = [
  "data/brand.yaml",
  "docs/ecosystem/lineage.yaml",
  "docs/ecosystem/archlang-archcanvas.yaml",
  ...under("schema/").filter((f) => f.endsWith(".json")),
]
  .filter(has)
  .map((rel) => {
    const text = read(rel);
    let purpose = "—";
    if (rel.endsWith(".json")) {
      try {
        const j = JSON.parse(text);
        purpose = firstSentence(j.title || j.description || "—");
      } catch {
        purpose = "—";
      }
    } else purpose = yamlPurpose(text);
    return { rel, lines: lineCount(text), purpose };
  });

// ---------------------------------------------------------------------------
// Guidance docs, skills, rules
// ---------------------------------------------------------------------------

const READ_FIRST = ["CLAUDE.md", "docs/STATE.md", "docs/LOG.md", INDEX_OUT];

const docPaths = new Set([
  ...FILES.filter((f) => f.startsWith("docs/") && f.endsWith(".md") && !f.includes("/_private/")),
  ...FILES.filter((f) => /^cv\/cover-letter\/[^/]+\.md$/.test(f)),
  ...[
    "cv/README.md",
    "cv/TYPST_PITFALLS.md",
    "cv/exports/README.md",
    "distribution/README.md",
    "youtube/README.md",
    "x/README.md",
    "x/x-strategy.md",
    "linkedin/README.md",
    "suno/README.md",
    "media-kit/README.md",
    "evidence/README.md",
  ].filter(has),
  SCRIPTS_OUT,
]);
for (const f of READ_FIRST) docPaths.delete(f);

// The script index is written by this run; its line count comes from the text, not the disk.
let scriptsReadmeText = "";

const describeDoc = (rel) => {
  const text = rel === SCRIPTS_OUT ? scriptsReadmeText : read(rel);
  const { data, body } = frontMatter(text);
  let purpose;
  if (data && data.title) {
    purpose = data.role ? `${data.title}: ${data.role}` : String(data.title);
    if (!rel.endsWith("/narrative.md") && rel.startsWith("docs/stories/")) purpose = `Story. ${purpose}`;
  } else purpose = mdPurpose(body);
  let readWhen = READ_WHEN[rel];
  if (!readWhen && /^docs\/stories\/[^/]+\.md$/.test(rel) && data && data.id) readWhen = STORY_READ_WHEN;
  return { rel, lines: lineCount(text), purpose, readWhen: readWhen ?? "—" };
};

const skillDirs = [
  ...new Set(
    FILES.filter((f) => /^\.claude\/skills\/[^/]+\/SKILL\.md$/.test(f)).map((f) => path.posix.dirname(f)),
  ),
].sort(cmp);
const skills = skillDirs.map((dir) => {
  const rel = `${dir}/SKILL.md`;
  const text = read(rel);
  const { data } = frontMatter(text);
  const extra = FILES.filter((f) => f.startsWith(dir + "/") && f !== rel && f.endsWith(".md")).map(
    (f) => `${f.slice(dir.length + 1)} (${lineCount(read(f))})`,
  );
  return {
    rel,
    name: data?.name ?? path.posix.basename(dir),
    lines: lineCount(text),
    when: cell(data?.description ?? "—"),
    extra,
  };
});

const rules = FILES.filter((f) => /^\.claude\/rules\/.+\.md$/.test(f)).map((rel) => {
  const text = read(rel);
  const { data, body } = frontMatter(text);
  const scope = data?.paths ? [].concat(data.paths).map(String) : [];
  return {
    rel,
    lines: lineCount(text),
    scope: scope.length ? scope.map(code).join(", ") : "always loaded",
    purpose: data?.description ? firstSentence(String(data.description)) : mdPurpose(body),
  };
});

// ---------------------------------------------------------------------------
// Platform registers
// ---------------------------------------------------------------------------

const REGISTER_DIRS = ["x/", "linkedin/", "suno/", "youtube/", "distribution/"];
const registers = FILES.filter(
  (f) => REGISTER_DIRS.some((d) => f.startsWith(d)) && /\.ya?ml$/.test(f) && !f.includes("/capture/"),
).map((rel) => {
  const text = read(rel);
  const head = text.split("\n").slice(0, 12).join("\n");
  return {
    rel,
    kind: /GENERATED/.test(head) ? "generated" : "hand-edited",
    purpose: yamlPurpose(text),
  };
});

// ---------------------------------------------------------------------------
// Scripts
// ---------------------------------------------------------------------------

const pkg = JSON.parse(read("package.json"));
const npmScripts = Object.entries(pkg.scripts ?? {});
const npmGroup = (name) => {
  if (NPM_GROUP[name]) return NPM_GROUP[name];
  if (name === "build" || name.startsWith("build:")) return "build";
  if (name === "check" || name.startsWith("check:")) return "check";
  if (name.startsWith("capture:") || name.startsWith("stage:") || name.startsWith("sync:")) return "sync-capture";
  return "other";
};

const scriptFiles = FILES.filter((f) => /^scripts\/[^/]+\.m?js$/.test(f));

// Text corpus for reference search: every listed text file except this script and its outputs.
const TEXT_EXT = /\.(md|mjs|cjs|js|ts|tsx|json|ya?ml|ps1|typ|txt|html|py|sh|toml)$/i;
const corpus = FILES.filter(
  (f) =>
    TEXT_EXT.test(f) &&
    f !== SELF &&
    f !== INDEX_OUT &&
    f !== SCRIPTS_OUT &&
    fs.statSync(path.join(repoRoot, f)).size < 4 * 1024 * 1024,
).map((f) => [f, read(f)]);

const isInvoker = (f) => /\.(m?js|cjs|ps1|sh|py)$/.test(f) || f.startsWith(".github/workflows/");

const scriptsInfo = scriptFiles.map((rel) => {
  const base = path.posix.basename(rel);
  const npm = npmScripts.filter(([, cmd]) => cmd.includes(`scripts/${base}`)).map(([n]) => n);
  const refs = corpus.filter(([f, t]) => f !== rel && f !== "package.json" && t.includes(base)).map(([f]) => f);
  const callers = refs.filter(isInvoker);
  const docs = refs.filter((f) => !isInvoker(f));
  let status;
  if (npm.length) status = "npm";
  else if (callers.length) status = "called";
  else if (docs.length) status = "doc-only";
  else status = "ORPHAN";
  return {
    rel,
    base,
    purpose: scriptPurpose(read(rel)),
    npm,
    callers,
    docs,
    status,
    invoke: npm.length ? npm.map((n) => code(`npm run ${n}`)).join(", ") : code(`node ${rel}`),
  };
});

const statusNote = (s) => {
  if (s.status === "npm") return "npm";
  if (s.status === "called") return `named in code: ${s.callers.slice(0, 3).map(code).join(", ")}`;
  if (s.status === "doc-only") return `run by hand; named in ${s.docs.slice(0, 2).map(code).join(", ")}`;
  return "**orphan**: named nowhere";
};

// ---------------------------------------------------------------------------
// Render scripts/README.md
// ---------------------------------------------------------------------------

const renderScriptsReadme = () => {
  const out = [];
  out.push("# scripts/");
  out.push("");
  out.push("Generated by `scripts/build-kb-index.mjs` from each script's header comment and");
  out.push("`package.json`; do not edit. Rebuild with `npm run build:index`. A script's own header");
  out.push("comment is its manual: read it before running the script.");
  out.push("");
  out.push("Status: **npm** has an npm script; **named in code** appears in another script or a CI");
  out.push("workflow (it may be run or only mentioned there); **run by hand** is named only in docs;");
  out.push("**orphan** is named nowhere in the repo.");
  out.push("");
  out.push("## Scripts");
  out.push("");
  out.push("| Script | What it does | Run with | Status |");
  out.push("|---|---|---|---|");
  for (const s of scriptsInfo) {
    out.push(`| ${code(s.base)} | ${cell(s.purpose)} | ${s.invoke} | ${statusNote(s)} |`);
  }
  out.push("");
  out.push("## Subdirectories");
  out.push("");
  const dirs = [
    ...new Set(
      FILES.filter((f) => f.startsWith("scripts/") && f.split("/").length > 2)
        .map((f) => f.split("/").slice(0, 2).join("/"))
        .concat(Object.keys(SCRIPT_DIRS).filter((d) => FILES.some((f) => f.startsWith(d + "/")))),
    ),
  ].sort(cmp);
  for (const d of dirs) {
    const n = FILES.filter((f) => f.startsWith(d + "/") && /\.m?js$/.test(f)).length;
    out.push(`- ${code(d + "/")} (${n} modules): ${SCRIPT_DIRS[d] ?? "—"}`);
  }
  out.push("");
  return out.join("\n");
};

// ---------------------------------------------------------------------------
// Render docs/INDEX.md
// ---------------------------------------------------------------------------

const renderIndex = () => {
  const out = [];
  out.push("# Knowledge index");
  out.push("");
  out.push("The map of this repo: what each source holds and when to read it. Generated by");
  out.push("`scripts/build-kb-index.mjs` from shard headers, doc headings and `package.json`; do not");
  out.push("edit. Rebuild with `npm run build:index`; `npm run check:index` fails when it is stale.");
  out.push("Reading rule: CLAUDE.md, docs/STATE.md and this index are read first (L1); everything");
  out.push("else (L2) is opened on demand, when its \"read when\" matches the task.");
  out.push("");

  out.push("## Read first");
  out.push("");
  out.push("| File | Lines | Read when |");
  out.push("|---|---|---|");
  for (const rel of READ_FIRST) {
    const lines = rel === INDEX_OUT ? "this file" : has(rel) ? String(lineCount(read(rel))) : "not yet written";
    out.push(`| ${code(rel)} | ${lines} | ${cell(READ_WHEN[rel])} |`);
  }
  out.push("");

  out.push("## Data");
  out.push("");
  out.push("The shards are merged in filename order by `scripts/lib/load-profile.mjs` and validated");
  out.push("against `schema/profile.schema.json`. Find an entry with");
  out.push("`grep -rn \"id: <slug>\" data/profile/`. Counts are entries per list, or keys per map.");
  out.push("");
  out.push("| Shard | Lines | Top-level keys (entries) | Purpose |");
  out.push("|---|---|---|---|");
  for (const s of shards) {
    const p = s.localOnly ? `${s.purpose} (local-only)` : s.purpose;
    out.push(`| ${code(s.rel)} | ${s.lines} | ${cell(s.keys.join(", "))} | ${cell(p)} |`);
  }
  out.push("");
  out.push("Other knowledge files:");
  out.push("");
  out.push("| File | Lines | Purpose |");
  out.push("|---|---|---|");
  for (const d of otherData) out.push(`| ${code(d.rel)} | ${d.lines} | ${cell(d.purpose)} |`);
  out.push("");

  out.push("## Guidance docs");
  out.push("");
  out.push("| Doc | Lines | Purpose | Read when |");
  out.push("|---|---|---|---|");
  for (const rel of [...docPaths].sort(cmp)) {
    const d = describeDoc(rel);
    out.push(`| ${code(d.rel)} | ${d.lines} | ${cell(d.purpose)} | ${cell(d.readWhen)} |`);
  }
  out.push("");

  out.push("## Skills and rules");
  out.push("");
  out.push("Skills hold procedures and load when their description matches the task.");
  out.push("");
  out.push("| Skill | Lines | Use when | Also in the folder |");
  out.push("|---|---|---|---|");
  for (const s of skills) {
    out.push(`| ${code(s.name)} (${code(s.rel)}) | ${s.lines} | ${s.when} | ${cell(s.extra.join(", ") || "—")} |`);
  }
  out.push("");
  if (rules.length) {
    out.push("Rules in `.claude/rules/` load when a file matching their `paths:` is touched.");
    out.push("");
    out.push("| Rule | Lines | Applies to | Purpose |");
    out.push("|---|---|---|---|");
    for (const r of rules) out.push(`| ${code(r.rel)} | ${r.lines} | ${cell(r.scope)} | ${cell(r.purpose)} |`);
  } else {
    out.push("No `.claude/rules/` files yet.");
  }
  out.push("");

  out.push("## Platform registers");
  out.push("");
  out.push("Read a platform's register before answering anything about it. What is posted there is");
  out.push("Chan's to change. Generated registers are rebuilt by their sync skill or npm script.");
  out.push("");
  out.push("| Register | Kind | Purpose |");
  out.push("|---|---|---|");
  for (const r of registers) out.push(`| ${code(r.rel)} | ${r.kind} | ${cell(r.purpose)} |`);
  out.push("");

  out.push("## Raw sources");
  out.push("");
  out.push("Evidence the knowledge layer is built from. Declared here, not listed; never edit a");
  out.push("capture by hand. Local-only paths are gitignored: nothing in them goes into a tracked file.");
  out.push("");
  out.push("| Path | Status | Holds |");
  out.push("|---|---|---|");
  for (const [p, what] of RAW_SOURCES) {
    let status;
    if (p.includes("*")) {
      const re = new RegExp("^" + p.replace(/[.]/g, "\\.").replace(/\*/g, "[^/]+(?:/[^/]+)*") + "$");
      const n = FILES.filter((f) => re.test(f)).length;
      status = n ? `tracked (${n} files)` : "none tracked";
    } else if (under(p).length) status = "tracked";
    else if (isIgnored(p)) status = "local-only";
    else status = "nothing tracked";
    out.push(`| ${code(p)} | ${status} | ${cell(what)} |`);
  }
  out.push("");
  out.push("Local-only overlays and working files (gitignored; may be absent on this machine):");
  out.push("");
  for (const [p, what] of LOCAL_ONLY) out.push(`- ${p.split(", ").map(code).join(", ")}: ${what}`);
  out.push("");

  out.push("## Scripts");
  out.push("");
  out.push("`npm run build` and `npm run check` rewrite generated files; run them only when nobody else");
  out.push("is editing the tree. The per-script index, with how to run each one, is `scripts/README.md`.");
  out.push("");
  const byGroup = new Map(NPM_GROUP_ORDER.map((g) => [g, []]));
  for (const [name, cmd] of npmScripts) byGroup.get(npmGroup(name)).push([name, cmd]);
  for (const g of NPM_GROUP_ORDER) {
    const rows = byGroup.get(g).sort((a, b) => cmp(a[0], b[0]));
    if (!rows.length) continue;
    out.push(`### ${NPM_GROUP_TITLE[g]}`);
    out.push("");
    out.push("| npm script | Runs |");
    out.push("|---|---|");
    for (const [name, cmd] of rows) out.push(`| ${code(name)} | ${code(cell(cmd))} |`);
    out.push("");
  }
  out.push("### Script files");
  out.push("");
  out.push("| File | What it does | Status |");
  out.push("|---|---|---|");
  for (const s of scriptsInfo) out.push(`| ${code(s.rel)} | ${cell(s.purpose)} | ${statusNote(s)} |`);
  out.push("");
  return out.join("\n");
};

// ---------------------------------------------------------------------------
// Write or check
// ---------------------------------------------------------------------------

scriptsReadmeText = renderScriptsReadme();
const indexText = renderIndex();

const outputs = [
  [SCRIPTS_OUT, scriptsReadmeText],
  [INDEX_OUT, indexText],
];

if (check) {
  const stale = outputs.filter(([rel, text]) => {
    const p = path.join(repoRoot, rel);
    return !fs.existsSync(p) || fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n") !== text;
  });
  if (stale.length) {
    for (const [rel] of stale) console.error(`build-kb-index: ${rel} is stale: run \`npm run build:index\``);
    process.exit(1);
  }
  console.log(`build-kb-index: ${INDEX_OUT} and ${SCRIPTS_OUT} are current`);
  process.exit(0);
}

for (const [rel, text] of outputs) fs.writeFileSync(path.join(repoRoot, rel), text);
const orphans = scriptsInfo.filter((s) => s.status === "ORPHAN").map((s) => s.base);
const unhinted = [...docPaths].filter((rel) => describeDoc(rel).readWhen === "—");
const ungrouped = npmScripts.filter(([n]) => npmGroup(n) === "other").map(([n]) => n);
console.log(`build-kb-index: wrote ${INDEX_OUT} and ${SCRIPTS_OUT}`);
if (orphans.length) console.log(`  orphan scripts: ${orphans.join(", ")}`);
if (unhinted.length) console.log(`  docs without a "read when" hint: ${unhinted.join(", ")}`);
if (ungrouped.length) console.log(`  npm scripts in no group: ${ungrouped.join(", ")}`);
