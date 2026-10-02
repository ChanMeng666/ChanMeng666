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
