// triage-visibility-page.mjs — `--mode visibility` of scripts/build-triage-page.mjs.
//
// One card per repo (ChanMeng666 account: active + archived, public + private, forks;
// plus the orgRepoAllowlist repos in docs/ecosystem/lineage.yaml). Two independent,
// initially-UNSET controls per card: Archive state and Visibility. The script's
// opinion is a non-interactive advisory hint only (computeHint).
//
// Input is the dump written by the collector (repos-full.json: REST repo fields +
// lastCommit/c90/c365/openPrs/openIssues/pages/pkg/upstreamPrs). Inbound references
// are scanned here from the working tree, so the page is reproducible.
//
// Client script: triage-visibility-client.js (node --check-able), data injected as JSON.

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const lc = (s) => String(s || "").toLowerCase();

const DAY = 86400000;
const STALE_DAYS = 180;
const PERSONAL_BRAND_OBSOLETE = new Set(["chanmeng666/chan-meng-cli"]); // lineage: "independent past personal-brand piece"
const LOW_ROLES = new Set(["coursework", "bootcamp", "experiment", "prototype", "crawl-archive", "archive-snapshot", "backup"]);
const LIVE_REL = new Set(["promotes", "markets", "documents", "showcases"]);

function walk(dir, exts, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".next" || e.name === ".git" || e.name === "dist") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, exts, out);
    else if (exts.has(path.extname(e.name).toLowerCase())) out.push(p);
  }
  return out;
}

// ---------------------------------------------------------------------------
// inbound references: owner/name (lower) -> Set(surface label)
// ---------------------------------------------------------------------------
function scanSurfaces({ repoRoot, portfolioDir }) {
  const hits = new Map();
  const add = (key, label) => {
    if (!hits.has(key)) hits.set(key, new Set());
    hits.get(key).add(label);
  };
  const RE_GH = /github\.com\/([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)/gi;
  const RE_IO = /\b([A-Za-z0-9-]+)\.github\.io\/([A-Za-z0-9._-]+)/gi;
  const clean = (n) => n.replace(/\.git$/i, "").replace(/[._-]+$/, "");
  const scan = (file, label) => {
    let txt;
    try { txt = fs.readFileSync(file, "utf8"); } catch { return; }
    for (const m of txt.matchAll(RE_GH)) add(`${lc(m[1])}/${lc(clean(m[2]))}`, label);
    for (const m of txt.matchAll(RE_IO)) add(`${lc(m[1])}/${lc(clean(m[2]))}`, label + " (github.io)");
  };
  const T = new Set([".md", ".txt", ".yaml", ".yml", ".typ", ".json", ".hbs", ".mdx", ".ts", ".tsx", ".js", ".jsx", ".mjs"]);
  for (const f of ["README.md", "llms.txt", "llms-full.txt"]) scan(path.join(repoRoot, f), f);
  scan(path.join(repoRoot, "public", "cv-llms.txt"), "cv-llms.txt");
  for (const f of walk(path.join(repoRoot, "data", "profile"), new Set([".yaml"]))) {
    const b = path.basename(f);
    scan(f, b.startsWith("70-") ? "LinkedIn shard (70)" : `profile shard ${b.slice(0, 2)}`);
  }
  for (const f of walk(path.join(repoRoot, "cv"), new Set([".typ"]))) scan(f, "CV (.typ)");
  for (const f of walk(path.join(repoRoot, "linkedin"), new Set([".md", ".json", ".txt"]))) scan(f, "LinkedIn copy");
  if (portfolioDir) for (const f of walk(path.join(portfolioDir, "src"), T)) scan(f, "chanmeng.org");
  return hits;
}

export function buildVisibilityPage({ repoRoot, profile, repos, localMap, portfolioDir, generatedAt }) {
  // ---------------- lineage (+ local private overlay) ----------------
  const readY = (f) => (fs.existsSync(f) ? yaml.load(fs.readFileSync(f, "utf8")) : {});
  const lin = readY(path.join(repoRoot, "docs", "ecosystem", "lineage.yaml"));
  const linP = readY(path.join(repoRoot, "docs", "ecosystem", "lineage.private.yaml"));
  const linRepos = new Map([...(lin.repos ?? []), ...(linP.repos ?? [])].map((r) => [lc(r.repo), r]));
  const relations = [...(lin.relations ?? []), ...(linP.relations ?? [])];

  // ---------------- catalog index ----------------
  const xb = profile.meta?.x_brand ?? {};
  const bucketLists = {};
  for (const [k, v] of Object.entries(xb)) {
    if (Array.isArray(v) && v.length && /(ProjectIds|OpenSourceIds)$/.test(k) && v.every((x) => typeof x === "string")) {
      bucketLists[k.replace(/(OpenSource|Project)?Ids$/, "").replace(/^openSource/, "")] = v;
    }
  }
  const bucketsOf = (id) => Object.entries(bucketLists).filter(([, ids]) => ids.includes(id)).map(([k]) => k);
  const repoUrlKey = (u) => {
    const m = String(u || "").match(/github\.com\/([^/]+)\/([^/#?]+)/i);
    return m ? `${lc(m[1])}/${lc(m[2].replace(/\.git$/, ""))}` : null;
  };
  const known = new Set(repos.map((r) => lc(r.nameWithOwner)));
  const catalogByRepo = new Map();
  for (const p of profile.projects ?? []) {
    const e = { id: p.id, tier: p.tier ?? "—", recency: p.recency ?? "—", status: p.status ?? "—", provenance: p.provenance ?? "—", buckets: bucketsOf(p.id) };
    const keys = new Set();
    const k0 = repoUrlKey(p.repoUrl);
    if (k0) keys.add(k0);
    for (const l of p.extraLinks ?? []) { const k = repoUrlKey(l.url ?? l.href); if (k) keys.add(k); }
    if (!k0 && known.has(`chanmeng666/${lc(p.id)}`)) keys.add(`chanmeng666/${lc(p.id)}`);
    for (const k of keys) {
      if (!known.has(k)) continue;
      if (!catalogByRepo.has(k)) catalogByRepo.set(k, []);
      catalogByRepo.get(k).push(e);
    }
  }

  // ---------------- surfaces + dependents ----------------
  const surf = scanSurfaces({ repoRoot, portfolioDir });
  const byKey = new Map(repos.map((r) => [lc(r.nameWithOwner), r]));
  const dependents = new Map(); // key -> Set(dependent repo key)
  const addDep = (k, d) => { if (!dependents.has(k)) dependents.set(k, new Set()); dependents.get(k).add(d); };
  for (const r of relations) {
    const f = lc(r.from), t = lc(r.to);
    if (!byKey.has(f) || !byKey.has(t)) continue;
    if (r.type === "depends-on") addDep(t, f);
    else if (r.type === "powers") addDep(f, t);
    else if (LIVE_REL.has(r.type)) addDep(t, f);
  }
  const isActive = (k) => { const r = byKey.get(k); return r && !r.isArchived && (r.c90 ?? 0) > 0; };

  const kb = (n) => (n >= 1024 ? `${(n / 1024).toFixed(n >= 10240 ? 0 : 1)} MB` : `${n} KB`);
  const daysAgo = (iso) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / DAY) : null);

  // ---------------- cards ----------------
  function mk(r) {
    const key = r.nameWithOwner, k = lc(key);
    const cats = catalogByRepo.get(k) ?? [];
    const ln = linRepos.get(k) ?? null;
    const isOrg = r.owner !== "ChanMeng666";
    // "Real" commit = the collector's sweep-filtered date (bulk docs/brand/community-file sweeps excluded).
    const last = r.lastReal || r.lastCommit || r.pushedAt || null;
    const c = {
      key, owner: r.owner, name: r.name, url: r.url, pub: !r.isPrivate, arch: !!r.isArchived, fork: !!r.isFork,
      isOrg, parent: r.parent ?? null, stars: r.stargazerCount ?? 0, forks: r.forkCount ?? 0, watchers: r.watchers ?? 0,
      created: (r.createdAt || "").slice(0, 10), last: (last || "").slice(0, 10), lastIsPush: !r.lastCommit, lastAny: (r.lastCommit || "").slice(0, 10), capped: !!r.commitsCapped,
      c90Raw: r.c90Raw ?? null, c365Raw: r.c365Raw ?? null,
      days: daysAgo(last), c90: r.c90 ?? 0, c365: r.c365 ?? 0, disk: r.diskUsage ?? 0, empty: !!r.isEmpty,
      desc: (r.description || "").trim(), home: r.homepageUrl || null, lang: r.primaryLanguage || null,
      openPrs: r.openPrs, openIssues: r.openIssues, pages: r.pages || null, pkg: r.pkg || null,
      upstreamPrs: r.upstreamPrs ?? null, cats, ln, local: localMap[k] ?? ln?.localFolder ?? null,
    };
    c.surfaces = [...(surf.get(k) ?? [])].filter((s) => !(c.name === "ChanMeng666" && c.owner === "ChanMeng666" && s.startsWith("README"))).sort();
    c.hard = c.surfaces.filter((s) => !/^(profile shard|LinkedIn shard)|^llms-full/.test(s));
    const deps = [...(dependents.get(k) ?? [])];
    c.deps = deps.map((d) => ({ key: byKey.get(d).nameWithOwner, active: isActive(d) }));
    c.activeDeps = c.deps.filter((d) => d.active);
    const tiers = cats.map((e) => e.tier);
    c.tier = ["flagship", "primary", "secondary", "archive"].find((t) => tiers.includes(t)) ?? null;
    c.recency = cats[0]?.recency ?? null;
    c.buckets = [...new Set(cats.flatMap((e) => e.buckets))];
    c.prov = cats[0]?.provenance ?? null;
    c.isListing = ln?.role === "listing-submission";
    c.isProfile = c.owner === "ChanMeng666" && c.name === "ChanMeng666";
    c.npm = c.pkg && c.pkg.npm ? { name: c.pkg.name, url: typeof c.pkg.npm === "object" ? c.pkg.npm["repository.url"] : null } : null;
    // GitHub forbids making a fork of a PUBLIC upstream private (archive/delete only).
    c.blockPrivate = c.fork && c.pub && !(c.parent && c.parent.private);
    // Liveness comes from the collector's HTTP probe (a stale homepageUrl on an archived repo is usually a dead deploy).
    const alive = (st, u) => st && !/^https?:\/\/github\.com\//i.test(u || "") && ((st.status >= 200 && st.status < 400) || st.status === 403);
    c.homeAlive = !!(c.home && alive(r.homeStatus, c.home));
    c.homeDead = !!(c.home && !c.homeAlive && !/^https?:\/\/github\.com\//i.test(c.home));
    c.pagesAlive = !!(c.pages?.url && (!r.pagesStatus || alive(r.pagesStatus, c.pages.url)));
    c.homeStatus = r.homeStatus ?? null;
    c.live = [...new Set([...(ln?.liveUrls ?? []), ...(c.pages?.url ? [c.pages.url] : []), ...(c.home ? [c.home] : [])])];
    return c;
  }
  const cards = repos.filter((r) => !r.error).map(mk);

  // ---------------- advisory hint ----------------
  function computeHint(c) {
    const reasonA = [], reasonV = [];
    let ha = null, hv = null;
    const role = c.ln?.role ?? null;
    const age = c.days ?? 99999;
    const stale = age > STALE_DAYS;
    const showcased = c.tier === "flagship" || c.tier === "primary" || c.buckets.length > 0 || c.recency === "active";

    // --- archive state
    if (c.arch) { ha = "keep"; reasonA.push("already archived"); }
    else if (c.isProfile) { ha = "keep"; reasonA.push("this is the profile / career-database repo"); }
    else if (c.isOrg) { ha = "keep"; reasonA.push("client org repo: not hinted"); }
    else if (c.isListing) { ha = "keep"; reasonA.push("listing-submission fork: upstream PR may still be open"); }
    else if (showcased) { ha = "keep"; reasonA.push(`catalog says ${c.tier ?? "listed"}/${c.recency ?? "—"}${c.buckets.length ? ` (${c.buckets.join("/")})` : ""}`); }
    else if (c.activeDeps.length) { ha = "keep"; reasonA.push(`live dependency of ${c.activeDeps.map((d) => d.key).join(", ")}`); }
    else if (c.tier === "archive" && age > 120) { ha = "archive"; reasonA.push(`catalog tier is already archive, GitHub is not; no real commit in ${age} days; nothing active depends on it`); }
    else if (stale) { ha = "archive"; reasonA.push(`no real commit in ${age} days (last ${c.last}${c.lastAny && c.lastAny !== c.last ? `; sweep-only commits since, last any ${c.lastAny}` : ""}); nothing active depends on it`); }
    else { ha = "keep"; reasonA.push(`last real commit ${age} days ago (<${STALE_DAYS}${age > 150 ? ", close to the line" : ""})`); }

    // --- visibility
    if (!c.pub) { hv = "keep"; reasonV.push("already private"); }
    else if (c.blockPrivate) { hv = "keep"; reasonV.push("public fork of a public upstream cannot be made private"); }
    else if (c.isProfile) { hv = "keep"; reasonV.push("profile repo must stay public"); }
    else if (c.isOrg) { hv = "keep"; reasonV.push("client org repo: not hinted"); }
    else if (c.isListing) { hv = "keep"; reasonV.push("listing-submission fork"); }
    else {
      const stop = [];
      if (c.stars >= 2) stop.push(`${c.stars}★`);
      if (c.forks > 0) stop.push(`${c.forks} fork(s)`);
      if (c.hard.length) stop.push(`linked from ${c.hard.join(", ")}`);
      if (c.npm) stop.push("published on npm");
      if (c.pagesAlive) stop.push("live GitHub Pages");
      if (c.homeAlive) stop.push("live site");
      if (showcased) stop.push("catalog flagship/primary/active");
      if (c.activeDeps.length) stop.push("live dependency");
      if (role === "skill" || role === "profile") stop.push(`role ${role}`);
      const obsolete = PERSONAL_BRAND_OBSOLETE.has(lc(c.key));
      const lowq = c.tier === "archive" || LOW_ROLES.has(role) || ["coursework", "bootcamp"].includes(c.prov) ||
        (!c.cats.length && c.disk < 300) || obsolete;
      const abandoned = c.arch || stale;
      if (obsolete) {
        hv = "private"; reasonV.push("personal-brand leftover Chan already called obsolete (lineage)");
        if (stop.length) reasonV.push(`NOTE blocking: ${stop.join(", ")}`);
      } else if (!stop.length && abandoned && lowq) {
        hv = "private";
        reasonV.push(`public, ${c.stars}★, no forks, not on any rendered surface (only catalog/long-tail data${c.surfaces.length ? "" : ", not even that"}); ${c.arch ? "archived" : `no commit in ${age}d`}; ` +
          [c.tier === "archive" ? "catalog tier archive" : null, LOW_ROLES.has(role) ? `role ${role}` : null,
            ["coursework", "bootcamp"].includes(c.prov) && c.prov !== role ? c.prov : null, !c.cats.length && c.disk < 300 ? `tiny (${kb(c.disk)}), not in catalog` : null]
            .filter(Boolean).join(", "));
      } else {
        hv = "keep";
        reasonV.push(stop.length ? `keep public: ${stop.join(", ")}` : abandoned ? "not clearly low-quality" : "recently active");
      }
    }
    return { ha, hv, why: `Archive: ${reasonA.join("; ")}. Visibility: ${reasonV.join("; ")}.` };
  }
  for (const c of cards) c.hint = computeHint(c);

  // ---------------- constraints (static warnings) ----------------
  for (const c of cards) {
    c.warns = [];
    const W = (sev, t) => c.warns.push({ sev, t });
    if (c.isOrg) W("warn", c.owner === "archcanvas" ? "Org repo (Chan's own venture org) - check with the org before changing" : "Client org - check with the org before changing");
    if (c.blockPrivate) W("danger", `Fork of public upstream ${c.parent?.nameWithOwner ?? "?"}: GitHub cannot make it private (archive or delete only)`);
    if (c.isListing) {
      const prs = c.upstreamPrs;
      W("warn", prs == null ? "Listing-submission fork: upstream PR state unknown" :
        prs.length ? `Listing-submission fork - upstream PRs: ${prs.map((p) => `#${p.number} ${p.state}`).join(", ")}` : "Listing-submission fork - no upstream PR found");
    }
    if (c.pub && c.surfaces.length) W("warn", `Linked from ${c.surfaces.length} public source(s)${c.hard.length ? ` incl. rendered surface(s): ${c.hard.join(", ")}` : " (catalog / long-tail only)"}; going private breaks the link (data sync needed)`);
    if (c.pages) W("warn", `GitHub Pages live: ${c.pages.url}${c.pages.cname ? ` (cname ${c.pages.cname})` : ""} (private keeps Pages only while on Pro)`);
    if (c.homeAlive) W("warn", `Live site: ${c.home}`);
    else if (c.homeDead) W("info", `Homepage URL looks dead (${c.homeStatus?.status || c.homeStatus?.err || "no response"}): ${c.home}`);
    if (c.npm) W("warn", `npm package ${c.npm.name}: its repository link would 404`);
    if (c.pub && c.stars + c.forks > 0) W("warn", `${c.stars}★ / ${c.forks} fork(s) at stake if made private`);
    if (c.activeDeps.length) W("warn", `Active dependents: ${c.activeDeps.map((d) => d.key).join(", ")}`);
    if (c.arch) W("info", "Archived: changing visibility needs unarchive, change, re-archive");
    if ((c.openPrs ?? 0) > 0) W("info", `${c.openPrs} open PR(s)`);
  }

  // ---------------- sections ----------------
  const secOf = (c) =>
    c.isOrg ? "org" : c.fork ? "forks" : c.pub ? (c.arch ? "arch-pub" : "act-pub") : c.arch ? "arch-priv" : "act-priv";
  const SECTIONS = [
    ["act-pub", "Active public"], ["arch-pub", "Archived public"], ["act-priv", "Active private"],
    ["arch-priv", "Archived private"], ["forks", "Forks"], ["org", "Client org repos"],
  ];
  for (const c of cards) c.sect = secOf(c);
  const order = (a, b) => (b.days ?? 0) - (a.days ?? 0) || a.name.localeCompare(b.name);
  const sections = SECTIONS.map(([id, title]) => ({ id, title, cards: cards.filter((c) => c.sect === id).sort(order) }));

  // ---------------- render ----------------
  const brand = yaml.load(fs.readFileSync(path.join(repoRoot, "data", "brand.yaml"), "utf8"));
  const RAW = brand.color.raw, SEM = brand.color.semantic;
  const tok = (k) => { if (!SEM[k] || !RAW[SEM[k]]) throw new Error(`brand.yaml: unknown token ${k}`); return RAW[SEM[k]]; };
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const h2 = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return "#" + [0, 1, 2].map((i) => h2(A[i] + (B[i] - A[i]) * t)).join(""); };
  const alpha = (h, a) => `rgba(${rgb(h).join(",")},${a})`;
  const INK = tok("inkPrimary"), PAGE = tok("canvasPage"), SURFACE = tok("canvasSurface"), WHITE = tok("onAccent"),
    ACCENT = tok("accentPrimary"), DECOR = tok("surfaceDecor"), GLARE = tok("surfaceTag");
  const stack = (f) => brand.typography.families[f].stack.map((x) => (/\s/.test(x) ? `"${x}"` : x)).join(", ");
  const DISPLAY = stack("display"), BODY = stack("bodySans"), MONO = stack("mono");
  const face = (family, file, w) => {
    const p = path.join(repoRoot, "cv", "fonts", file);
    if (!fs.existsSync(p)) return "";
    return `@font-face{font-family:"${family}";font-style:normal;font-weight:${w};font-display:swap;src:url(data:font/ttf;base64,${fs.readFileSync(p).toString("base64")}) format("truetype");}`;
  };
  const FACES = [face("Anton", "Anton-Regular.ttf", 400), face("DM Sans", "DMSans-Regular.ttf", 400), face("DM Sans", "DMSans-Bold.ttf", 700)].join("\n");
  const light = `--bg:${PAGE};--card:${SURFACE};--fg:${INK};--dim:${alpha(INK, 0.62)};--line:${alpha(INK, 0.16)};--accent:${ACCENT};--on-accent:${WHITE};--state:${DECOR};--state-soft:${mix(DECOR, SURFACE, 0.9)};--warn:${GLARE};--warn-ink:${INK};--danger:${INK};--danger-ink:${WHITE};--shadow:0 1px 2px ${alpha(INK, 0.06)},0 8px 20px ${alpha(INK, 0.05)};`;
  const dark = `--bg:${INK};--card:${mix(INK, PAGE, 0.1)};--fg:${SURFACE};--dim:${mix(INK, SURFACE, 0.62)};--line:${mix(INK, SURFACE, 0.26)};--accent:${ACCENT};--on-accent:${WHITE};--state:${mix(DECOR, SURFACE, 0.45)};--state-soft:${mix(DECOR, INK, 0.78)};--warn:${GLARE};--warn-ink:${INK};--danger:${GLARE};--danger-ink:${INK};--shadow:none;`;

  const AOPT = { keep: "Keep as is", archive: "Archive", unarchive: "Unarchive" };
  const VOPT = { keep: "Keep", private: "Make private", public: "Make public" };
  const radio = (name, role, v, label, disabled, title) =>
    `<label class="lv${disabled ? " off" : ""}"${title ? ` title="${esc(title)}"` : ""}><input type="radio" name="${name}" value="${v}" data-role="${role}"${disabled ? " disabled" : ""}><span>${label}</span></label>`;

  const hintLabel = (c) => {
    const a = c.hint.ha === "archive" ? "Archive" : c.hint.ha === "unarchive" ? "Unarchive" : "Keep archive state";
    const v = c.hint.hv === "private" ? "Make private" : "Keep visibility";
    return `${a} · ${v}`;
  };

  const renderCard = (c) => {
    const hay = [c.key, c.desc, c.cats.map((e) => e.id).join(" "), c.local ?? "", c.ln?.family ?? "", c.ln?.role ?? ""].join(" ").toLowerCase();
    const aName = `a__${esc(c.key)}`, vName = `v__${esc(c.key)}`;
    const aOpts = [radio(aName, "arch", "keep", AOPT.keep), c.arch ? radio(aName, "arch", "unarchive", AOPT.unarchive) : radio(aName, "arch", "archive", AOPT.archive)].join("");
    const vOpts = [radio(vName, "vis", "keep", VOPT.keep),
      c.pub ? radio(vName, "vis", "private", VOPT.private, c.blockPrivate, c.blockPrivate ? "Forks of public upstreams cannot be made private on GitHub" : "") : radio(vName, "vis", "public", VOPT.public)].join("");
    const cat = c.cats.length
      ? c.cats.map((e) => `<code>${esc(e.id)}</code> ${esc(e.tier)} · ${esc(e.recency)} · ${esc(e.status)}${e.buckets.length ? " " + e.buckets.map((b) => `<span class="flag mem">${esc(b)}</span>`).join("") : ""}`).join("<br>")
      : "not in catalog";
    const lin = c.ln ? `${esc(c.ln.family)} / ${esc(c.ln.role)}${c.ln.ownProject === false ? " (not own)" : ""}` : "—";
    const surfaces = c.surfaces.length ? c.surfaces.map((s) => `<span class="flag">${esc(s)}</span>`).join("") : '<span class="dim">none</span>';
    const pagesTxt = c.pages ? `<a href="${esc(c.pages.url)}" target="_blank" rel="noopener">${esc(c.pages.url.replace(/^https?:\/\//, ""))}</a>` : "—";
    return `
<article class="card${c.pub ? "" : " is-priv"}" data-key="${esc(c.key)}" data-sect="${c.sect}" data-warn="${c.warns.filter((w) => w.sev !== "info").length}" data-hint="${c.hint.ha === "archive" || c.hint.hv === "private" ? 1 : 0}" data-hay="${esc(hay)}">
  <header class="card-head">
    <div class="ttl"><h2><a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.owner)}/${esc(c.name)}</a></h2>
      <span class="flag ${c.pub ? "pubf" : "privf"}">${c.pub ? "PUBLIC" : "PRIVATE"}</span>${c.arch ? '<span class="flag danger">ARCHIVED</span>' : ""}${c.fork ? '<span class="flag">FORK</span>' : ""}${c.isOrg ? '<span class="flag warn">ORG</span>' : ""}${c.empty ? '<span class="flag warn">EMPTY</span>' : ""}</div>
    <div class="stars">${c.stars}<span class="star-glyph">★</span> <span class="dim">⑂${c.forks} watch ${c.watchers}</span></div>
  </header>
  <p class="tagline${c.desc ? "" : " dim"}">${c.desc ? esc(c.desc.length > 220 ? c.desc.slice(0, 220) + "…" : c.desc) : "(no description)"}</p>
  <dl class="evidence">
    <div><dt>last real ${c.lastIsPush ? "push" : "commit"}</dt><dd class="${c.days != null && c.days > STALE_DAYS ? "stale" : ""}">${esc(c.last || "—")}${c.days != null ? ` <span class="dim">(${c.days}d)</span>` : ""}${c.lastAny && c.lastAny !== c.last ? `<br><span class="dim" title="Latest commit of any kind (bulk docs / brand / community-file sweeps included)">any: ${esc(c.lastAny)}</span>` : ""}</dd></div>
    <div><dt>real commits 90d / 365d</dt><dd class="${c.c90 > 0 ? "hot" : ""}">${c.c90} / ${c.c365}${c.capped ? "+" : ""}${c.c365Raw != null && c.c365Raw !== c.c365 ? `<br><span class="dim" title="Including sweep-only commits">raw ${c.c90Raw} / ${c.c365Raw}</span>` : ""}</dd></div>
    <div><dt>open PR / issues</dt><dd>${c.openPrs ?? "—"} / ${c.openIssues ?? "—"}</dd></div>
    <div><dt>created</dt><dd>${esc(c.created || "—")}</dd></div>
    <div><dt>size / lang</dt><dd>${kb(c.disk)} · ${esc(c.lang ?? "—")}</dd></div>
    <div><dt>local folder</dt><dd>${esc(c.local ?? "—")}</dd></div>
    <div class="wide"><dt>GitHub Pages / homepage</dt><dd>${pagesTxt}${c.home ? `${c.pages ? "<br>" : ""}<a href="${esc(c.home)}" target="_blank" rel="noopener">${esc(c.home.replace(/^https?:\/\//, "").slice(0, 70))}</a> <span class="dim">(${c.homeAlive ? "responds" : "no response"}${c.homeStatus?.status ? " " + c.homeStatus.status : ""})</span>` : ""}</dd></div>
    <div class="wide"><dt>tier / lineage family / role</dt><dd>${c.tier ? esc(c.tier) : "—"} · ${lin}</dd></div>
  </dl>
  <div class="catalog">${cat}</div>
  <div class="refs"><span class="grp-lbl">Linked from</span> ${surfaces}</div>
  ${c.deps.length ? `<div class="refs"><span class="grp-lbl">Dependents (lineage)</span> ${c.deps.map((d) => `<span class="flag${d.active ? " mem" : ""}">${esc(d.key)}${d.active ? " (active)" : ""}</span>`).join("")}</div>` : ""}
  ${c.warns.length ? `<div class="meta-row">${c.warns.map((w) => `<span class="flag ${w.sev}">${esc(w.t)}</span>`).join("")}</div>` : ""}
  <div class="advice" role="note" aria-label="advice, not a selection">
    <span class="advice-tag">★ ADVISORY</span>
    <span class="advice-body">${esc(hintLabel(c))} <span class="dim">— ${esc(c.hint.why)}</span></span>
  </div>
  <div class="controls">
    <div class="grp-lbl">Archive state</div>
    <div class="opts" role="radiogroup" aria-label="archive state ${esc(c.key)}">${aOpts}</div>
    <div class="grp-lbl">Visibility</div>
    <div class="opts" role="radiogroup" aria-label="visibility ${esc(c.key)}">${vOpts}</div>
    ${c.blockPrivate ? '<div class="dim fine">Make private is disabled: GitHub does not allow a fork of a public upstream to go private.</div>' : ""}
    <div class="warns" data-role="warns"></div>
    <div class="row"><input type="text" class="note-in" data-role="note" placeholder="Note (optional)" aria-label="note ${esc(c.key)}" maxlength="400">
    <button type="button" class="clear" data-role="clear">Reset</button></div>
  </div>
</article>`;
  };

  const sectHtml = sections.filter((s) => s.cards.length).map((s) => `
<details class="sect" data-sect="${s.id}" open>
  <summary><span class="st">${esc(s.title)}</span> <span class="dim" data-role="sect-n">${s.cards.length}</span></summary>
  <div class="grid">${s.cards.map(renderCard).join("\n")}</div>
</details>`).join("\n");

  const META = Object.fromEntries(cards.map((c) => [c.key, {
    stars: c.stars, forks: c.forks, watchers: c.watchers, pub: c.pub, arch: c.arch, org: c.isOrg, blockPriv: c.blockPrivate,
    links: c.surfaces, pages: c.pages ? c.pages.url : null, live: c.homeAlive ? c.home : null, npm: c.npm ? c.npm.name : null,
    openPrs: c.openPrs ?? 0, openIssues: c.openIssues ?? 0, ha: c.hint.ha, hv: c.hint.hv, sect: c.sect,
  }]));
  const DATA = { meta: META, order: cards.map((c) => c.key) };
  const client = fs.readFileSync(path.join(repoRoot, "scripts", "lib", "triage-visibility-client.js"), "utf8");
  const sectOpts = sections.filter((s) => s.cards.length).map((s) => `<option value="${s.id}">${esc(s.title)} (${s.cards.length})</option>`).join("");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Repo Visibility Triage</title>
<style>
${FACES}
:root{${light}}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){${dark}}}
:root[data-theme="dark"]{${dark}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);overflow-x:hidden;font:500 15px/1.5 ${BODY}}
code,.stars,.evidence dd,.tally{font-family:${MONO}}
.wrap{max-width:1500px;margin:0 auto;padding:16px 16px 120px}
h1{font-family:${DISPLAY};font-weight:400;font-size:2.4rem;line-height:.95;letter-spacing:.02em;margin:8px 0 6px}
h1 .dot{color:var(--accent)}
.lede{color:var(--dim);margin:0 0 14px;font-size:.88rem;max-width:100ch}
.dim{color:var(--dim)}
a{color:var(--accent)}
.bar{position:sticky;top:0;z-index:20;background:var(--bg);border-bottom:1px solid var(--line);padding:8px 0;margin-bottom:14px}
.bar-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:6px}
.bar select,.bar input[type=search],.bar button,.bar label.chk{font:inherit;font-size:.82rem;padding:5px 8px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--fg);max-width:100%}
.bar input[type=search]{min-width:0;flex:1 1 160px}
.bar label.chk{display:flex;gap:5px;align-items:center;cursor:pointer}
.bar button{cursor:pointer}
.bar button.primary{background:var(--accent);border-color:var(--accent);color:var(--on-accent);font-weight:700}
.tally{display:flex;flex-wrap:wrap;gap:6px;font-size:.72rem}
.tally span{border:1px solid var(--line);border-radius:999px;padding:1px 8px;background:var(--card)}
.tally b{color:var(--accent)}
.tally .undec b{color:var(--fg)}
.confirm{display:none;gap:8px;align-items:center;flex-wrap:wrap;border:1px solid var(--accent);border-radius:8px;padding:6px 10px;margin-top:6px;background:var(--card);font-size:.82rem}
.confirm.show{display:flex}
.confirm button{font:inherit;font-size:.8rem;padding:3px 10px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--fg);cursor:pointer}
.confirm button.go{background:var(--accent);border-color:var(--accent);color:var(--on-accent);font-weight:700}
.sect{margin:0 0 18px}
.sect>summary{cursor:pointer;padding:8px 0;font-size:.9rem}
.sect>summary .st{font-family:${DISPLAY};font-size:1.25rem;letter-spacing:.02em}
.sect.empty{display:none}
.grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(min(100%,400px),1fr))}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:8px;min-width:0}
.card.is-priv{border-style:dashed}
.card.decided{border-color:var(--state);box-shadow:inset 3px 0 0 var(--state),var(--shadow)}
.card.hidden{display:none}
.card-head{display:flex;gap:10px;justify-content:space-between;align-items:flex-start;min-width:0}
.ttl{min-width:0}
.ttl h2{font-family:${DISPLAY};font-weight:400;font-size:1.15rem;line-height:1.1;margin:0 6px 2px 0;display:inline;overflow-wrap:anywhere}
.ttl h2 a{color:var(--fg);text-decoration:none}
.ttl h2 a:hover{color:var(--accent)}
.stars{white-space:nowrap;font-weight:700;font-size:.85rem}
.star-glyph{color:var(--accent)}
.tagline{margin:0;font-size:.8rem;color:var(--dim);overflow-wrap:anywhere}
.evidence{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:6px;margin:0}
.evidence div{min-width:0}
.evidence .wide{grid-column:1/-1}
.evidence dt{font-size:.6rem;text-transform:uppercase;letter-spacing:.06em;color:var(--dim)}
.evidence dd{margin:0;font-size:.76rem;overflow-wrap:anywhere}
.evidence dd.hot{font-weight:700;color:var(--accent)}
.evidence dd.stale{color:var(--dim)}
.meta-row,.refs{font-size:.74rem;display:flex;flex-wrap:wrap;gap:5px;align-items:center}
.catalog{font-size:.74rem;overflow-wrap:anywhere}
.flag{font-size:.66rem;padding:1px 7px;border-radius:999px;border:1px solid var(--line);margin-right:3px;white-space:normal;overflow-wrap:anywhere;max-width:100%}
.flag.mem{background:var(--state-soft);border-color:var(--state);color:var(--state)}
.flag.warn{background:var(--warn);border-color:var(--warn);color:var(--warn-ink);white-space:normal}
.flag.info{white-space:normal;color:var(--dim)}
.flag.danger{background:var(--danger);border-color:var(--danger);color:var(--danger-ink);font-weight:700;white-space:normal}
.flag.privf{background:var(--fg);color:var(--bg);border-color:var(--fg);font-weight:700}
.flag.pubf{border-color:var(--state);color:var(--state);font-weight:700}
.advice{border:1px dashed var(--line);border-radius:10px;padding:6px 8px;font-size:.72rem;color:var(--dim);pointer-events:none;user-select:none}
.advice-tag{font-size:.6rem;letter-spacing:.06em;margin-right:6px;font-weight:700}
.advice-body{color:var(--fg)}
.controls{margin-top:auto;display:flex;flex-direction:column;gap:6px}
.grp-lbl{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:var(--dim)}
.fine{font-size:.7rem}
.opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:4px}
.lv{display:flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:9px;padding:5px 8px;font-size:.76rem;cursor:pointer;min-width:0}
.lv.off{opacity:.45;cursor:not-allowed;text-decoration:line-through}
.lv span{overflow-wrap:anywhere}
.lv:hover:not(.off){border-color:var(--state)}
.lv:has(input:checked){background:var(--state-soft);border-color:var(--state);box-shadow:inset 0 0 0 1px var(--state);font-weight:700}
.lv input{accent-color:var(--state)}
.warns .w{font-size:.72rem;padding:3px 8px;border-radius:8px;margin-top:3px;background:var(--warn);color:var(--warn-ink)}
.warns .w.red{background:var(--danger);color:var(--danger-ink);font-weight:700}
.row{display:flex;gap:6px}
.note-in{flex:1;min-width:0;font:inherit;font-size:.78rem;padding:4px 8px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--fg)}
button.clear{font:inherit;font-size:.72rem;background:none;border:1px solid var(--line);color:var(--dim);border-radius:8px;padding:3px 8px;cursor:pointer}
#exportPanel{display:none;border:1px solid var(--line);border-radius:12px;background:var(--card);padding:12px;margin-bottom:16px}
#exportPanel.show{display:block}
#exportPanel textarea{width:100%;min-height:240px;font:400 12px/1.45 ${MONO};border:1px solid var(--line);border-radius:10px;padding:10px;background:var(--bg);color:var(--fg)}
#exportPanel .note{font-size:.78rem;color:var(--dim);margin:0 0 6px}
#exportPanel button{font:inherit;font-size:.82rem;padding:5px 12px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--fg);cursor:pointer;margin:6px 6px 0 0}
#exportPanel button.primary{background:var(--accent);border-color:var(--accent);color:var(--on-accent);font-weight:700}
</style></head>
<body>
<div class="wrap">
  <h1>Repo visibility triage <span class="dot">/</span> archive &amp; private</h1>
  <p class="lede">${cards.length} repos (${cards.filter((c) => !c.isOrg).length} on ChanMeng666, ${cards.filter((c) => c.isOrg).length} allowlisted org repos). Generated ${esc(generatedAt)}; this page changes nothing on GitHub.
  Every card starts <b>undecided</b> on both controls; the dashed ★ box is advisory only and never selects anything. Choices are saved in this browser; export any time.
  Constraints: public forks of public upstreams cannot go private; going private resets stars/watchers and detaches forks; links from README / llms / CV / LinkedIn / chanmeng.org then break and need a data sync; Pages on private repos work only while on GitHub Pro; archived repos need unarchive, change, re-archive.</p>

  <div class="bar">
    <div class="bar-row">
      <input type="search" id="q" placeholder="Search name / description / catalog id / lineage…" aria-label="Search">
      <select id="fSect" aria-label="Section"><option value="">Section: all</option>${sectOpts}</select>
      <label class="chk"><input type="checkbox" id="fWarn"> Has warning</label>
      <label class="chk"><input type="checkbox" id="fUndec"> Only undecided</label>
      <label class="chk"><input type="checkbox" id="fHint"> Only ★-hinted change</label>
    </div>
    <div class="bar-row">
      <button type="button" id="adopt">Fill blanks with ★</button>
      <button type="button" id="clearAll">Clear all</button>
      <button type="button" id="export" class="primary">Export</button>
      <span class="tally" id="tally"></span>
    </div>
    <div class="confirm" id="confirmBar"><span id="confirmMsg"></span><button type="button" class="go" id="confirmYes">Confirm</button><button type="button" id="confirmNo">Cancel</button></div>
  </div>

  <section id="exportPanel" aria-label="Export">
    <p class="note" id="exportNote"></p>
    <textarea id="exportBox" spellcheck="false" aria-label="Export content"></textarea>
    <div><button type="button" class="primary" id="copyBtn">Copy to clipboard</button><button type="button" id="closeExport">Close</button></div>
  </section>

  <main id="main">
${sectHtml}
  </main>
</div>
<script>window.TRIAGE=${JSON.stringify(DATA).replace(/</g, "\\u003c")};</script>
<script>
${client}
</script>
</body></html>
`;
  const count = (f) => cards.filter(f).length;
  return {
    html,
    cards,
    stats: {
      total: cards.length,
      sections: sections.map((s) => [s.title, s.cards.length]),
      hintArchive: count((c) => !c.arch && c.hint.ha === "archive"),
      hintPrivate: count((c) => c.hint.hv === "private"),
      hintKeepBoth: count((c) => c.hint.ha !== "archive" && c.hint.hv !== "private"),
      starsAtStakePrivate: cards.filter((c) => c.hint.hv === "private").reduce((a, c) => a + c.stars, 0),
      blocked: {
        forks: count((c) => c.blockPrivate), pages: count((c) => c.pages), liveSite: count((c) => c.homeAlive), npm: count((c) => c.npm),
        linked: count((c) => c.pub && c.surfaces.length), org: count((c) => c.isOrg),
      },
    },
  };
}
