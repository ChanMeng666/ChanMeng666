#!/usr/bin/env node
// Repo-lineage gate: docs/ecosystem/lineage.yaml (+ optional local-only
// lineage.private.yaml overlay).
//
//   node scripts/check-ecosystem.mjs           offline structural checks
//   node scripts/check-ecosystem.mjs --live    also compare against GitHub (needs `gh`)
//
// Offline mode never requires the private overlay (CI has none); when it is
// present it is merged in and checked too. This is topology only: it is not
// loaded by load-profile and holds no career copy.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { loadProfile } from "./lib/load-profile.mjs";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const dir = path.join(root, "docs", "ecosystem");
const live = process.argv.includes("--live");
const errors = [];
const err = (m) => errors.push(m);

const pub = yaml.load(fs.readFileSync(path.join(dir, "lineage.yaml"), "utf8"));
const privPath = path.join(dir, "lineage.private.yaml");
const priv = fs.existsSync(privPath) ? yaml.load(fs.readFileSync(privPath, "utf8")) : null;

const pubRepos = pub.repos ?? [];
const privRepos = priv?.repos ?? [];
const allRepos = [...pubRepos, ...privRepos];
const repoKeys = new Set();
const pubKeys = new Set(pubRepos.map((r) => r.repo));
for (const r of allRepos) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(r.repo ?? "")) err(`repo key not owner/name: ${r.repo}`);
  if (repoKeys.has(r.repo)) err(`duplicate repo across public+private: ${r.repo}`);
  repoKeys.add(r.repo);
}

const entities = new Map([...(pub.entities ?? []), ...(priv?.entities ?? [])].map((e) => [e.id, e]));
const families = new Map([...(pub.families ?? []), ...(priv?.families ?? [])].map((f) => [f.id, f]));
const pubEntityIds = new Set((pub.entities ?? []).map((e) => e.id));
const pubFamilyIds = new Set((pub.families ?? []).map((f) => f.id));

// ---- public file must be self-contained and carry nothing sensitive
for (const r of pubRepos) if (r.sensitive) err(`public file contains sensitive repo: ${r.repo}`);
for (const r of pubRepos) {
  if (!pubFamilyIds.has(r.family)) err(`public repo ${r.repo}: family "${r.family}" not defined in the public file`);
  if (!pubEntityIds.has(r.entity)) err(`public repo ${r.repo}: entity "${r.entity}" not defined in the public file`);
}
for (const f of pub.families ?? []) {
  if (!pubEntityIds.has(f.entity)) err(`public family ${f.id}: entity "${f.entity}" not in the public file`);
}
if (priv) {
  const sensKeys = privRepos.map((r) => r.repo.split("/")[1]);
  const pubText = fs.readFileSync(path.join(dir, "lineage.yaml"), "utf8");
  for (const n of sensKeys) if (pubText.includes(n)) err(`public file mentions private-overlay repo name "${n}"`);
}

// ---- resolution
for (const r of allRepos) {
  if (!families.has(r.family)) err(`repo ${r.repo}: unknown family "${r.family}"`);
  if (!entities.has(r.entity)) err(`repo ${r.repo}: unknown entity "${r.entity}"`);
}
for (const f of families.values()) if (!entities.has(f.entity)) err(`family ${f.id}: unknown entity "${f.entity}"`);
for (const f of families.values())
  for (const t of f.timeline ?? [])
    for (const x of t.repos ?? []) if (!repoKeys.has(x)) err(`family ${f.id} timeline: unknown repo ${x}`);
for (const t of priv?.timelineAdditions ?? []) {
  if (!families.has(t.family)) err(`timelineAdditions: unknown family ${t.family}`);
  for (const x of t.repos ?? []) if (!repoKeys.has(x)) err(`timelineAdditions: unknown repo ${x}`);
}
for (const f of pub.families ?? []) if (f.detail && !fs.existsSync(path.join(root, f.detail))) err(`family ${f.id}: detail file missing ${f.detail}`);

// ---- relations
const vocab = new Set(Object.keys(pub.relationTypes ?? {}));
const assetIds = new Set((pub.nonGitAssets ?? []).map((a) => a.id));
function checkEndpoint(rel, which, v, scopeKeys, scopeLabel) {
  if (typeof v !== "string") return err(`relation ${rel.from} ${rel.type}: ${which} missing`);
  const m = v.match(/^(external|url|entity|asset):(.+)$/);
  if (!m) {
    if (!repoKeys.has(v)) err(`relation ${rel.from} ${rel.type} ${v}: ${which} is not a known repo`);
    else if (!scopeKeys.has(v)) err(`relation ${rel.from} ${rel.type} ${v}: ${which} is not in the ${scopeLabel} file`);
    return;
  }
  const [, kind, val] = m;
  if (kind === "entity" && !entities.has(val)) err(`relation ${rel.from}: unknown entity ref ${v}`);
  if (kind === "asset" && !assetIds.has(val)) err(`relation ${rel.from}: unknown asset ref ${v}`);
  if (kind === "url" && !/^https?:\/\//.test(val)) err(`relation ${rel.from}: url ref must be http(s): ${v}`);
}
const privKeys = new Set(privRepos.map((r) => r.repo));
const bothKeys = new Set([...pubKeys, ...privKeys]);
function checkRelations(rels, scopeKeys, label) {
  for (const rel of rels ?? []) {
    if (!vocab.has(rel.type)) err(`relation ${rel.from} -> ${rel.to}: type "${rel.type}" not in relationTypes`);
    if (/^(external|url|entity|asset):/.test(rel.from ?? "") || !repoKeys.has(rel.from))
      err(`relation "from" must be a known repo: ${rel.from}`);
    else if (!scopeKeys.has(rel.from)) err(`relation from ${rel.from} is not in the ${label} file`);
    checkEndpoint(rel, "to", rel.to, scopeKeys, label);
    if (["fork-of", "mirror-of"].includes(rel.type) && !/^external:[\w.-]+\/[\w.-]+$/.test(rel.to) && !repoKeys.has(rel.to))
      err(`relation ${rel.from} ${rel.type}: upstream must be external:owner/name or a repo, got ${rel.to}`);
  }
}
checkRelations(pub.relations, pubKeys, "public");
checkRelations(priv?.relations, bothKeys, "overlay (public+private)");
// public relations must not touch private repos (also guaranteed by scope check above)

// ---- career-DB cross-references
const profile = loadProfile();
const projectIds = new Set((profile.projects ?? []).map((p) => p.id));
const orgIds = new Set((profile.organizations ?? []).map((o) => o.id));
const collabIds = new Set((profile.collaborators ?? []).map((c) => c.id));
const workIds = new Set([...(profile.work ?? []), ...(profile.volunteer ?? [])].map((w) => w.id));
for (const r of allRepos) if (r.catalogId && !projectIds.has(r.catalogId)) err(`repo ${r.repo}: catalogId "${r.catalogId}" not in data/profile projects`);
for (const e of entities.values()) {
  if (e.orgId && !orgIds.has(e.orgId) && !collabIds.has(e.orgId)) err(`entity ${e.id}: orgId "${e.orgId}" not in organizations/collaborators`);
  if (e.workId && !workIds.has(e.workId)) err(`entity ${e.id}: workId "${e.workId}" not in work/volunteer`);
}
// forks and listing submissions of other people's repos are never Chan's own project
for (const r of allRepos)
  if (["fork", "listing-submission"].includes(r.role) && r.entity === "external-upstreams" && r.ownProject !== false)
    err(`repo ${r.repo}: role ${r.role} under external-upstreams must carry ownProject: false`);
for (const r of allRepos) if (r.role === "listing-submission" && r.ownProject !== false) err(`repo ${r.repo}: listing-submission must carry ownProject: false`);
// Chan's per-repo judgement (2026-10-06): optional, but closed vocabularies when present.
const STAGES = ["building", "maintained", "paused", "done", "handed-over"];
const SHOWCASE = ["flagship", "featured", "listed", "hidden"];
for (const r of allRepos) {
  if (r.stage !== undefined && !STAGES.includes(r.stage)) err(`repo ${r.repo}: stage "${r.stage}" not one of ${STAGES.join(" | ")}`);
  if (r.showcase !== undefined && !SHOWCASE.includes(r.showcase)) err(`repo ${r.repo}: showcase "${r.showcase}" not one of ${SHOWCASE.join(" | ")}`);
  if (r.positioning !== undefined && (typeof r.positioning !== "string" || !r.positioning.trim())) err(`repo ${r.repo}: positioning must be a non-empty string`);
  // a repo that maps to a career project may not contradict that project's tier
  if (r.showcase === "flagship" && r.catalogId && (profile.projects ?? []).find((p) => p.id === r.catalogId)?.tier !== "flagship")
    err(`repo ${r.repo}: showcase flagship but data/profile project "${r.catalogId}" is not tier flagship (the shard is the authority: change it there first)`);
}
// product-film register (data/profile/45-showcase.yaml `productFilms`): one film on show per product
const repoByKey = new Map(allRepos.map((r) => [r.repo, r]));
const showcaseIds = new Set((profile.showcase ?? []).map((s) => s.id));
const filmRole = (key, where) => {
  const r = repoByKey.get(key);
  if (!r) return err(`productFilms ${where}: ${key} is not in the lineage catalog`);
  if (!["promo-film", "demo"].includes(r.role)) err(`productFilms ${where}: ${key} has role ${r.role}, expected promo-film or demo`);
};
const shownPerProduct = new Map();
for (const f of profile.productFilms ?? []) {
  const where = `"${f.title}"`;
  if (f.projectId && !projectIds.has(f.projectId)) err(`productFilms ${where}: projectId "${f.projectId}" not in data/profile projects`);
  if (f.showcaseId && !showcaseIds.has(f.showcaseId)) err(`productFilms ${where}: showcaseId "${f.showcaseId}" not in showcase`);
  filmRole(f.filmRepo, where);
  for (const n of f.notDisplayed ?? []) {
    filmRole(n.filmRepo, where);
    if (n.filmRepo === f.filmRepo) err(`productFilms ${where}: ${n.filmRepo} is both displayed and notDisplayed`);
  }
  if (f.kind === "product") {
    if (!f.projectId) err(`productFilms ${where}: kind product needs a projectId`);
    else if (shownPerProduct.has(f.projectId)) err(`productFilms: project "${f.projectId}" shows two product films (${shownPerProduct.get(f.projectId)} and ${where}); the rule is one per product`);
    else shownPerProduct.set(f.projectId, where);
  }
}
// filmography (data/profile/46-films.yaml `films` + `filmCollections`): every film names a film repo in the
// catalog, and the film a product shows (productFilms) is the one row marked primary.
{
  const FILM_ROLES = ["promo-film", "demo", "music-video"];
  const filmRepo = (key, where) => {
    const r = repoByKey.get(key);
    if (!r) return err(`films ${where}: ${key} is not in the lineage catalog`);
    if (!FILM_ROLES.includes(r.role)) err(`films ${where}: ${key} has role ${r.role}, expected ${FILM_ROLES.join(" | ")}`);
  };
  const collectionIds = new Set();
  for (const c of profile.filmCollections ?? []) {
    if (collectionIds.has(c.id)) err(`filmCollections: duplicate id "${c.id}"`);
    collectionIds.add(c.id);
    filmRepo(c.repo, `collection "${c.id}"`);
    if (c.projectId && !projectIds.has(c.projectId)) err(`filmCollections "${c.id}": projectId "${c.projectId}" not in data/profile projects`);
  }
  const filmIds = new Set();
  const primaryRepo = new Map();
  for (const f of profile.films ?? []) {
    const where = `"${f.id}"`;
    if (filmIds.has(f.id)) err(`films: duplicate id ${where}`);
    filmIds.add(f.id);
    filmRepo(f.repo, where);
    if (f.projectId && !projectIds.has(f.projectId)) err(`films ${where}: projectId "${f.projectId}" not in data/profile projects`);
    if (f.showcaseId && !showcaseIds.has(f.showcaseId)) err(`films ${where}: showcaseId "${f.showcaseId}" not in showcase`);
    if (f.collection && !collectionIds.has(f.collection)) err(`films ${where}: collection "${f.collection}" not in filmCollections`);
    if (f.kind === "music-video" && !f.collection) err(`films ${where}: a music video needs a collection`);
    if (f.onFilmsPage && !(f.media?.mp4 || f.media?.hls)) err(`films ${where}: onFilmsPage needs media.mp4 or media.hls`);
    if (!f.onFilmsPage && !f.notShownReason) err(`films ${where}: a film kept off /films needs notShownReason`);
    if (f.primary) {
      if (f.kind !== "product-film" || !f.projectId) err(`films ${where}: primary is for a product-film with a projectId`);
      else if (primaryRepo.has(f.projectId)) err(`films: project "${f.projectId}" has two primary films`);
      else primaryRepo.set(f.projectId, f.repo);
    }
  }
  if (profile.films)
    for (const p of profile.productFilms ?? []) {
      if (p.kind !== "product") continue;
      const repo = primaryRepo.get(p.projectId);
      if (!repo) err(`films: productFilms shows "${p.title}" but no film of "${p.projectId}" is marked primary`);
      else if (repo !== p.filmRepo) err(`films: the primary film of "${p.projectId}" is from ${repo}, productFilms shows ${p.filmRepo}`);
    }
}
// open questions
for (const q of [...(pub.openQuestions ?? []), ...(priv?.openQuestions ?? [])])
  for (const x of q.affects ?? []) if (!repoKeys.has(x)) err(`openQuestion ${q.id}: affects unknown repo ${x}`);

// ---- live drift
function gh(args) {
  return JSON.parse(execFileSync("gh", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));
}
if (live) {
  const owner = pub.scope.personalAccount;
  const list = gh(["repo", "list", owner, "--limit", "500", "--json", "name,isArchived,isPrivate"]);
  const liveMap = new Map(list.map((r) => [`${owner}/${r.name}`, r]));
  for (const key of pub.scope.orgRepoAllowlist) {
    // Still Chan's work, but her access ended with the engagement: nothing to compare.
    if (allRepos.find((r) => r.repo === key)?.accessRevoked) continue;
    try {
      const j = gh(["repo", "view", key, "--json", "isArchived,isPrivate"]);
      liveMap.set(key, j);
    } catch {
      err(`live: allowlisted org repo ${key} cannot be viewed (renamed, deleted or no access)`);
    }
  }
  for (const k of liveMap.keys()) if (!repoKeys.has(k)) err(`live: ${k} exists on GitHub but is not in the catalog`);
  for (const r of allRepos) {
    const l = liveMap.get(r.repo);
    if (!l) {
      if (!pub.scope.orgRepoAllowlist.includes(r.repo) && r.repo.startsWith(owner + "/")) err(`live: ${r.repo} is in the catalog but not on GitHub`);
      continue;
    }
    if (!!l.isArchived !== !!r.archived) err(`live: ${r.repo} archived=${l.isArchived} on GitHub, catalog says ${r.archived}`);
    const vis = l.isPrivate ? "private" : "public";
    if (vis !== r.visibility) err(`live: ${r.repo} is ${vis} on GitHub, catalog says ${r.visibility}`);
  }
  for (const key of pub.scope.orgRepoAllowlist) if (!repoKeys.has(key)) err(`allowlisted org repo ${key} missing from catalog`);
}

const mode = live ? "live" : "offline";
const overlay = priv ? "with private overlay" : "no private overlay";
if (errors.length) {
  console.error(`check-ecosystem (${mode}, ${overlay}): ${errors.length} problem(s)`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(`check-ecosystem OK (${mode}, ${overlay}): ${pubRepos.length} public + ${privRepos.length} private repos, ${families.size} families, ${entities.size} entities`);
