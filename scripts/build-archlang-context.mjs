#!/usr/bin/env node
// Builds docs/ecosystem/archlang-context.md: the ArchLang / ArchCanvas repo graph
// as one file an agent can be handed at the start of ArchLang work.
//
//   node scripts/build-archlang-context.mjs           write the file
//   node scripts/build-archlang-context.mjs --check   fail if it is stale
//
// Sources: docs/ecosystem/lineage.yaml (public file only: the private overlay is
// never read, so nothing from it can reach this tracked file), productFilms in
// data/profile/45-showcase.yaml, and the package.json files of the local
// checkouts under lineage.localRoot (workspaces and @chanmeng666/arch* deps).
// The rules section is hand-kept below; facts come from the sources.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { loadProfile } from "./lib/load-profile.mjs";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const out = path.join(root, "docs", "ecosystem", "archlang-context.md");
const lin = yaml.load(fs.readFileSync(path.join(root, "docs/ecosystem/lineage.yaml"), "utf8"));
const localRoot = lin.localRoot;
const profile = loadProfile();

const FAMILY = "archlang-archcanvas";
const byKey = new Map(lin.repos.map((r) => [r.repo, r]));
const core = lin.repos.filter((r) => r.family === FAMILY);
const coreKeys = new Set(core.map((r) => r.repo));
const isFork = (r) => r?.role === "listing-submission";

// relations touching the family; listing-submission forks are summarised separately
const rels = (lin.relations ?? []).filter((x) => coreKeys.has(x.from) || coreKeys.has(x.to));
const forkRels = rels.filter((x) => x.type === "listing-submission-for");
const graphRels = rels.filter((x) => x.type !== "listing-submission-for");
// repos outside the family that a relation names
const outsiders = [...new Set(graphRels.flatMap((x) => [x.from, x.to]))]
  .filter((k) => byKey.has(k) && !coreKeys.has(k))
  .map((k) => byKey.get(k));

// ---- local checkouts
const exists = (p) => fs.existsSync(p);
const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
function remoteOf(dir) {
  try { return execFileSync("git", ["-C", dir, "remote", "get-url", "origin"], { encoding: "utf8" }).trim(); }
  catch { return null; }
}
function localPath(r) {
  if (!r.localFolder) return null;
  return `${localRoot}/${r.localFolder}`;
}

// npm consumers: every local checkout whose package.json names an @chanmeng666/arch* package
const consumers = [];
for (const d of fs.readdirSync(localRoot, { withFileTypes: true })) {
  if (!d.isDirectory() || d.name === "archlang") continue;
  const pj = readJson(path.join(localRoot, d.name, "package.json"));
  if (!pj) continue;
  const deps = { ...pj.dependencies, ...pj.devDependencies };
  const hits = Object.entries(deps).filter(([n]) => /^@chanmeng666\/arch/.test(n));
  if (!hits.length) continue;
  const row = lin.repos.find((r) => r.localFolder === d.name);
  consumers.push({ folder: d.name, repo: row?.repo ?? "?", visibility: row?.visibility ?? "?", deps: hits });
}

// archlang workspaces
const archDir = `${localRoot}/archlang`;
const archPkg = readJson(`${archDir}/package.json`);
const workspaces = [];
if (archPkg) {
  for (const pattern of archPkg.workspaces ?? []) {
    const dirs = pattern.endsWith("/*")
      ? fs.readdirSync(`${archDir}/${pattern.slice(0, -2)}`).map((n) => `${pattern.slice(0, -2)}/${n}`)
      : [pattern];
    for (const w of dirs) {
      const pj = readJson(`${archDir}/${w}/package.json`);
      if (pj) workspaces.push({ dir: w, name: pj.name, version: pj.version, published: !pj.private });
    }
  }
}

// films on show
const productFilms = (profile.productFilms ?? []).filter((f) => /archlang|archcanvas/.test(f.filmRepo ?? ""));

// ---- rendering helpers
const gh = (r) => (r.visibility === "public" ? `[${r.repo}](https://github.com/${r.repo})` : `\`${r.repo}\` (private: never link)`);
const lp = (r) => {
  const p = localPath(r);
  if (!p) return "not cloned";
  if (!exists(p)) return `\`${p}\` (missing)`;
  const remote = remoteOf(p);
  const ok = remote && remote.toLowerCase().replace(/\.git$/, "").endsWith(r.repo.toLowerCase());
  return ok ? `\`${p}\`` : `\`${p}\` (origin is ${remote ?? "none"})`;
};
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const short = (k) => k.replace(/^ChanMeng666\//, "");
const nodeId = (k) => k.replace(/^(url|external|entity|asset):/, "$1_").replace(/[^A-Za-z0-9_]/g, "_");
const label = (k) => (byKey.has(k) ? short(k) : k.replace(/^url:https?:\/\//, "").replace(/^external:/, "ext: "));

const ROLE_GROUP = {
  product: "Products", docs: "Public product home", showcase: "Showcase",
  research: "Private research and records", paper: "Private research and records",
  growth: "Growth", "promo-film": "Films", demo: "Films",
};
const groups = new Map();
for (const r of core) {
  const g = ROLE_GROUP[r.role] ?? "Other";
  if (!groups.has(g)) groups.set(g, []);
  groups.get(g).push(r);
}

// ---- mermaid: the film repos of each product collapse into one node (exact edges are in §6);
// deployments and renames are left to the tables
const lock = (r) => (r.visibility === "private" ? " 🔒" : "");
const filmRoles = new Set(["promo-film", "demo"]);
const filmTarget = new Map(); // film repo -> the product it promotes
for (const x of graphRels) if (x.type === "promotes" && filmRoles.has(byKey.get(x.from)?.role)) filmTarget.set(x.from, x.to);
const nodeOf = (k) => (filmTarget.has(k) ? `films_${nodeId(filmTarget.get(k))}` : nodeId(k));
const mm = ["flowchart LR"];
for (const [g, rows] of groups) {
  if (g === "Films") continue;
  mm.push(`  subgraph ${nodeId(g)}["${g}"]`);
  for (const r of rows) mm.push(`    ${nodeId(r.repo)}["${short(r.repo)}${lock(r)}"]`);
  mm.push("  end");
}
for (const target of new Set(filmTarget.values())) {
  const names = [...filmTarget].filter(([, t]) => t === target).map(([f]) => `${short(f).replace(/^film-/, "")}${lock(byKey.get(f))}`);
  mm.push(`  films_${nodeId(target)}["${short(target)} films (${names.length}):<br/>${names.join("<br/>")}"]`);
}
for (const r of outsiders) mm.push(`  ${nodeId(r.repo)}["${short(r.repo)}${lock(r)}"]`);
const MM_SKIP = new Set(["deployed-as", "renamed-from"]);
const seen = new Set();
for (const x of graphRels) {
  if (MM_SKIP.has(x.type) || !byKey.has(x.to)) continue;
  const a = nodeOf(x.from), b = nodeOf(x.to);
  if (a === b) continue; // film-to-film succession inside one node
  const e = `  ${a} -->|${x.type}| ${b}`;
  if (!seen.has(e)) { seen.add(e); mm.push(e); }
}
if (forkRels.length) {
  mm.push(`  forks["${new Set(forkRels.map((x) => x.from)).size} listing forks (not her projects)"]`);
  mm.push(`  forks -.->|listing-submission-for| ${nodeId("ChanMeng666/archlang")}`);
}

// ---- document
const today = lin.lastVerified;
const L = [];
L.push(`<!-- GENERATED by scripts/build-archlang-context.mjs from docs/ecosystem/lineage.yaml, data/profile/45-showcase.yaml and the local package.json files. Do not edit: change the sources and run npm run build:archlang-context. -->`);
L.push("");
L.push("# ArchLang project graph (agent context)");
L.push("");
L.push(`Hand this file to an agent at the start of ArchLang work. Catalog verified ${today}; local checkouts read at build time. Topology only: career facts live in \`data/profile/\`, decisions in \`docs/STATE.md\`.`);
L.push("");
L.push("Read in this order: §1 rules, §2 the graph, §3 where each repo is, §4 what is inside archlang, §5 who consumes it, §6 every edge.");
L.push("");
L.push("## 1. Rules for working in these repos");
L.push("");
L.push(...RULES(productFilms));
L.push("");
L.push("## 2. Graph");
L.push("");
L.push("🔒 = private repository. Edge labels are the relation types defined in §6.");
L.push("");
L.push("```mermaid", ...mm, "```");
L.push("");
L.push("## 3. Repositories");
L.push("");
L.push("| Repo | Local path | GitHub | Role | Stage | What it is |");
L.push("|---|---|---|---|---|---|");
for (const r of [...core, ...outsiders]) {
  L.push(`| ${short(r.repo)} | ${lp(r)} | ${gh(r)} | ${r.role}${r.archived ? ", archived" : ""} | ${r.stage ?? "—"} | ${esc(r.oneLine)}${r.liveUrls?.length ? ` Live: ${r.liveUrls.join(", ")}` : ""} |`);
}
L.push("");
L.push(`"not cloned": no local checkout; clone it under \`${localRoot}/\` when needed. Film masters are release assets of each film repo.`);
L.push("");
L.push("## 4. Inside the archlang monorepo");
L.push("");
L.push(`\`${archDir}\`, package \`${archPkg?.name}\` ${archPkg?.version}. Pushing \`main\` deploys the docs site (archlang.uk) and the playground (playground.archlang.uk).`);
L.push("");
L.push("| Workspace | Package | Version | On npm |");
L.push("|---|---|---|---|");
for (const w of workspaces) L.push(`| \`${w.dir}\` | \`${w.name}\` | ${w.version} | ${w.published ? "yes" : "no (private)"} |`);
L.push("");
const skillDirs = exists(`${archDir}/skills`) ? fs.readdirSync(`${archDir}/skills`).filter((n) => exists(`${archDir}/skills/${n}/SKILL.md`)) : [];
L.push(`Also in the repo, not workspaces: \`skills/\` (${skillDirs.map((n) => `\`${n}\``).join(", ")}), \`plugins/\`, \`integrations/\`, \`dataset/\` (source of the Hugging Face dataset; there is no separate clone), \`examples/\` (small fixtures, not the gallery).`);
L.push("");
L.push("## 5. Who consumes the npm packages");
L.push("");
L.push("Change a public API and these break. Ranges as written in each package.json.");
L.push("");
L.push("| Local folder | Repo | Depends on |");
L.push("|---|---|---|");
for (const c of consumers) L.push(`| \`${localRoot}/${c.folder}\` | ${c.repo}${c.visibility === "private" ? " 🔒" : ""} | ${c.deps.map(([n, v]) => `\`${n}@${v}\``).join(", ")} |`);
L.push("");
L.push("## 6. Every edge");
L.push("");
L.push("One line per relation, `from --type--> to`, with its evidence.");
L.push("");
L.push("```text");
for (const x of graphRels) L.push(`${short(x.from)} --${x.type}--> ${label(x.to)}${x.evidence ? `   # ${String(x.evidence).replace(/\s+/g, " ")}` : ""}`);
L.push("```");
L.push("");
const forkRows = [...new Set(forkRels.map((x) => x.from))].map((k) => byKey.get(k)).filter(Boolean);
L.push(`Listing forks (\`ownProject: false\`, never her projects; each kept only for its PR, deleted once the PR closes): ${forkRows.map((r) => `${short(r.repo)} → ${[...new Set(forkRels.filter((x) => x.from === r.repo).map((x) => short(x.to)))].join(", ")}`).join("; ")}.`);
L.push("");
L.push("Relation types used here:");
L.push("");
for (const t of [...new Set(rels.map((x) => x.type))]) L.push(`- \`${t}\`: ${lin.relationTypes[t]}`);
L.push("");

function RULES(films) {
  const show = films.map((f) => `${f.id ?? f.projectId}: \`${short(f.filmRepo)}\``).join("; ");
  return [
    "- **Priorities (Chan, 2026-11-18).** ArchLang builds by roadmap v3 (`archlang/docs/plans/product-roadmap/v3.md`, the one build order; started by RM-D65): numbers said right, checker recall, edits, handover; 1.64.0 shipped 2026-11-18. ArchCanvas is ArchLang's test bench plus a niche product for self-builders (growth ruling 2026-11-18); its plan is `archcanvas-lab/specs/2026-11-18-archcanvas-plan-after-demand-synthesis.md`; its stages 1 and 2 shipped by 2026-11-19 (as of 2026-11-19: archcanvas `main` `677b99b`, core `@chanmeng666/archlang` 1.64.0; 1.65.0 is approved upstream and not yet consumed; the public product home `archcanvas/archcanvas` was updated 2026-11-19). ArchCanvas's current state is the newest dated handoff listed in the index `archcanvas-lab/specs/README.md`, read with any later dated records of the same day; ArchLang's is `archlang/docs/plans/product-roadmap/handoff.md`. ArchCanvas is an AI architectural designer, never an \"AI architect\"; the 3D is the \"3D preview\" and an AI image is a \"rendering\". No copy says a launch is planned.",
    "- **Origin order.** ArchCanvas came first (first commit 2026-04-08, freehand SVG plans); ArchLang npm 0.1.0 followed on 2026-06-24 and replaced that engine on 2026-06-25. Never write that the language came first.",
    "- **Truth ownership.** Language behaviour lives in `archlang`; product behaviour in `archcanvas`; strategy, decisions and launch copy in `archcanvas-growth`. Growth holds no product truth; never edit a product repo from growth.",
    "- **Links.** Public copy links only `github.com/ChanMeng666/archlang`, `github.com/ChanMeng666/archlang-showcase`, `github.com/archcanvas/archcanvas` and the public film repos. A private repo is named, never linked.",
    "- **Private records.** `archlang-paper` stays private (the paper is public only as a Zenodo preprint); never name a venue. `archlang-lab` and `archcanvas-lab` hold closed research and eval data; tests in the product repos never read them.",
    "- **No D:/ paths in a product repo.** This file's local paths are for Chan's machine; never copy them into `AGENTS.md`, `CLAUDE.md` or docs of `archlang`, which are for every contributor.",
    `- **One film on show per product** (\`productFilms\`): ${show}. Film repos coexist; none replaces another. The ArchCanvas films do not name ArchLang on screen.`,
    "- **Do not confuse.** `archcanvas/archcanvas` (folder `archcanvas-public`) is the public product home, not the app; the app is the private `ChanMeng666/archcanvas`. `docs-site/` and `playground/` are workspaces of `archlang`, not repos, and the playground is not ArchCanvas. The gallery sources are in `archlang-showcase`; the docs-site `/showcase` images are synced copies. `\"private\": true` in the showcase `package.json` only means not published to npm: the repo is public MIT. The `.arch` keyword `paper` is a sheet size, unrelated to `archlang-paper`. `chanmeng-readme-showcase` and the career-shard id `app-promo-studio` are unrelated projects (name collisions only).",
    "- **Path coupling between sibling checkouts.** The playground builds against the core's built `../dist` (`playground/vite.config.js`), so build the core first. The docs site copies `docs/` in with `npm run sync` (`docs-site/sync-docs.mjs`). `archcanvas` eval and diagnostics scripts read and write the sibling `../archcanvas-lab`, or `$ARCHCANVAS_LAB` when set. `archlang-paper` tooling reads the sibling `../archlang`; `film-archcanvas-studio` syncs a checksum-locked replica one way from `../archcanvas`.",
    "- **Licences.** `archlang`, `archlang-showcase` and the public film repos: MIT (film media CC BY 4.0, per each repo's `LICENSE-MEDIA.md`). `archcanvas/archcanvas`: the product is all rights reserved; its Markdown docs and `examples/**/*.arch` with their compiled SVGs are CC BY 4.0. `archcanvas` (the app) is proprietary.",
  ];
}

const text = L.join("\n");
if (process.argv.includes("--check")) {
  const strip = (s) => s.replace(/^.*$/m, "");
  const cur = exists(out) ? fs.readFileSync(out, "utf8") : "";
  if (strip(cur) !== strip(text)) { console.error("archlang-context.md is stale: run npm run build:archlang-context"); process.exit(1); }
  console.log("archlang-context.md is current");
} else {
  fs.writeFileSync(out, text, "utf8");
  console.log(`wrote ${path.relative(root, out)}: ${core.length} family repos, ${outsiders.length} related, ${graphRels.length} edges, ${consumers.length} npm consumers`);
}
