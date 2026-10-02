// triage-repos-page.mjs — repo-centric mode of scripts/build-triage-page.mjs.
//
// One card per live (non-archived, non-fork) repo across every owner, with the
// catalog entry (data/profile/2x-projects-*.yaml) attached when one points at
// the repo. Two independent, initially-UNSET controls per card: fate + visibility.
// The script's opinion is a non-interactive advisory hint only (computeHint).
//
// The client script lives in triage-repos-client.js (node --check-able); this
// file renders the HTML shell + cards and injects the data as JSON.

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const repoUrlOf = (u) => {
  if (!u) return null;
  const m = String(u).match(/github\.com\/([^/]+)\/([^/#?]+)/i);
  return m ? `${m[1]}/${m[2].replace(/\.git$/, "")}`.toLowerCase() : null;
};

const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const DATA_ONLY_RE = /(-crawl$|-backup(-|$)|-archive$|-slack-archive$|bookmarks$|-crawler$)/i;
const SENSITIVE_RE = /\b(growth|strategy|marketing|outreach|playbook|proposal|internal|client-material|seo|geo|sales|pitch)\b|-(growth|strategy|marketing)(-|$)/i;

export function buildReposPage({ repoRoot, profile, repos, commitsFull, localMap, generatedAt }) {
  // ---------------- catalog index ----------------
  const shardOf = new Map();
  const pdir = path.join(repoRoot, "data", "profile");
  for (const f of fs.readdirSync(pdir).filter((x) => /^2[0-3]-.*\.yaml$/.test(x))) {
    const txt = fs.readFileSync(path.join(pdir, f), "utf8");
    for (const m of txt.matchAll(/^\s*-?\s*id:\s*["']?([A-Za-z0-9._-]+)["']?\s*$/gm)) {
      if (!shardOf.has(m[1])) shardOf.set(m[1], f);
    }
  }
  const xb = profile.meta?.x_brand ?? {};
  const bucketLists = {};
  for (const [k, v] of Object.entries(xb)) {
    if (Array.isArray(v) && v.length && /(ProjectIds|OpenSourceIds)$/.test(k) && v.every((x) => typeof x === "string")) {
      bucketLists[k.replace(/(OpenSource|Project)?Ids$/, "").replace(/^openSource/, "")] = v;
    }
  }
  const bucketsOf = (id) => Object.entries(bucketLists).filter(([, ids]) => ids.includes(id)).map(([k]) => k);

  const repoByKey = new Map(repos.map((r) => [r.nameWithOwner.toLowerCase(), r]));
  const catalogByRepo = new Map(); // lower owner/name -> [entry]
  const unmatched = [];
  const addCat = (key, e) => {
    if (!catalogByRepo.has(key)) catalogByRepo.set(key, []);
    const arr = catalogByRepo.get(key);
    if (!arr.includes(e)) arr.push(e);
  };
  for (const p of profile.projects ?? []) {
    const e = {
      id: p.id, shard: shardOf.get(p.id) ?? "?", tier: p.tier ?? "—", recency: p.recency ?? "—",
      status: p.status ?? "—", provenance: p.provenance ?? "—", buckets: bucketsOf(p.id),
      repoUrl: p.repoUrl ?? null,
    };
    const keys = new Set();
    const k0 = repoUrlOf(p.repoUrl);
    if (k0) keys.add(k0);
    for (const l of p.extraLinks ?? []) {
      const k = repoUrlOf(l.url ?? l.href);
      if (k) keys.add(k);
    }
    if (!k0) { const k = `chanmeng666/${p.id}`.toLowerCase(); if (repoByKey.has(k)) keys.add(k); }
    let hit = false;
    for (const k of keys) { if (repoByKey.has(k)) { addCat(k, e); hit = true; } }
    if (!hit && k0) unmatched.push(`${p.id} -> ${k0}`);
  }

  // ---------------- cards ----------------
  const OWNERS = ["ChanMeng666", "archcanvas", "gavigo-inc", "NZ-SheSharp", "Chow-Luck-Club", "Sanicleai", "Whiri-AI"];
  const cmap = new Map(Object.entries(commitsFull).map(([k, v]) => [k.toLowerCase(), v]));
  const lmap = new Map(Object.entries(localMap).map(([k, v]) => [k.toLowerCase(), v]));

  const kb = (n) => (n >= 1024 ? `${(n / 1024).toFixed(n >= 10240 ? 0 : 1)} MB` : `${n} KB`);

  function mk(r, inMain) {
    const key = r.nameWithOwner;
    const lk = key.toLowerCase();
    const cats = catalogByRepo.get(lk) ?? [];
    const cm = cmap.get(lk) ?? null;
    const c = {
      key, owner: r.owner.login, name: r.name, url: r.url, pub: !r.isPrivate, fork: r.isFork,
      archived: r.isArchived, stars: r.stargazerCount ?? 0, forks: r.forkCount ?? 0,
      lang: r.primaryLanguage?.name ?? null, created: (r.createdAt || "").slice(0, 10),
      last: ((cm?.lastCommit ?? r.pushedAt) || "").slice(0, 10), lastIsPush: !cm?.lastCommit,
      c30: cm?.c30 ?? null, c90: cm?.c90 ?? null, disk: r.diskUsage ?? 0, empty: !!r.isEmpty,
      desc: (r.description || "").trim(), topics: (r.repositoryTopics ?? []).map((t) => t.name),
      home: r.homepageUrl || null, cats, local: lmap.get(lk) ?? null, inMain,
    };
    c.buckets = [...new Set(cats.flatMap((e) => e.buckets))];
    const tiers = cats.map((e) => e.tier);
    c.tier = ["flagship", "primary", "secondary", "archive"].find((t) => tiers.includes(t)) ?? null;
    c.showcased = tiers.includes("flagship") || tiers.includes("primary") || c.buckets.length > 0;
    c.warns = [];
    const W = (sev, t) => c.warns.push({ sev, t });
    if (!r.isArchived && cats.length && cats.every((e) => e.tier === "archive")) W("warn", "catalog 标 archive，但 GitHub 未归档");
    if (r.isArchived && cats.some((e) => e.tier !== "archive")) W("danger", `GitHub 已归档，但 catalog tier=${cats.map((e) => e.tier).join("/")}（不一致）`);
    if (r.isPrivate && cats.some((e) => e.repoUrl && repoUrlOf(e.repoUrl) === lk)) W("danger", "私密仓库，但 catalog 有公开 repoUrl");
    if (!r.isPrivate && !c.desc) W("warn", "公开仓库没有 description");
    if (c.empty) W("warn", "空仓库");
    if (!cats.length && !r.isPrivate && !r.isFork && (c.c90 ?? 0) >= 10) W("warn", "公开且近期活跃，但不在 catalog");
    return c;
  }

  const live = repos.filter((r) => OWNERS.includes(r.owner.login));
  const mainSet = live.filter((r) => !r.isArchived && !r.isFork).map((r) => mk(r, true));
  const forkCards = live.filter((r) => !r.isArchived && r.isFork).map((r) => mk(r, false));
  // catalog entries whose repo is outside the live non-fork set (archived on GitHub, tier != archive)
  const mismatch = live
    .filter((r) => r.isArchived && (catalogByRepo.get(r.nameWithOwner.toLowerCase()) ?? []).some((e) => e.tier !== "archive"))
    .map((r) => mk(r, false));
  const archivedList = live.filter((r) => r.isArchived);

  // ---------------- advisory hint ----------------
  function computeHint(c) {
    const R = [];
    let fate;
    const inB = c.buckets.length > 0;
    const c30 = c.c30 ?? 0, c90 = c.c90 ?? 0;
    if (c.empty) { fate = "delete"; R.push("空仓库"); }
    else if (DATA_ONLY_RE.test(c.name) && !c.pub) { fate = "data-only"; R.push("私密 crawl/backup/archive 类仓库"); }
    else if (c.tier === "flagship" || (inB && c30 >= 15)) {
      fate = "focus"; R.push(c.tier === "flagship" ? "catalog flagship" : `在 README 分区且 ${c30} commits/30d`);
    } else if (c.tier === "primary" || inB) { fate = "listed"; R.push(c.tier === "primary" ? "catalog primary" : `在 README 分区 (${c.buckets.join("/")})`); }
    else if (c.disk < 500 && c.stars === 0 && c90 <= 3) { fate = "minor"; R.push(`体积 ${kb(c.disk)}、0★、90d 仅 ${c90} commits`); }
    else if (c90 === 0 && (c.tier == null || c.tier === "secondary" || c.tier === "archive")) {
      fate = "archive"; R.push(`90d 无提交${c.tier ? `，catalog ${c.tier}` : "，不在 catalog"}`);
    } else if (c.tier === "archive") { fate = "archive"; R.push("catalog 标 archive"); }
    else if (c90 >= 1 || c.tier === "secondary") { fate = "shelved"; R.push(`${c90} commits/90d，未被展示`); }
    else { fate = "shelved"; R.push("活跃度不明，未被展示"); }
    let vis = "keep";
    const sens = SENSITIVE_RE.test(c.name) || SENSITIVE_RE.test(c.desc) || c.topics.some((t) => SENSITIVE_RE.test(t));
    if (c.pub && sens && !c.showcased) { vis = "private"; R.push("名称/描述像增长/策略/客户材料，建议转私密"); }
    if (c.pub && fate === "data-only") vis = "private";
    return { fate, vis, why: R.join("；") };
  }
  const allCards = [...mainSet, ...forkCards, ...mismatch];
  for (const c of allCards) c.hint = computeHint(c);

  // ---------------- sections ----------------
  const byOrder = (a, b) => (b.c90 ?? -1) - (a.c90 ?? -1) || b.stars - a.stars || a.name.localeCompare(b.name);
  const sections = [];
  const showcased = mainSet.filter((c) => c.showcased);
  const rest = mainSet.filter((c) => !c.showcased);
  sections.push({ id: "showcased", title: "已展示 Already showcased", sub: "catalog flagship/primary，或在任一 README 分区", cards: showcased });
  sections.push({ id: "cm-pub", title: "ChanMeng666 · 公开", cards: rest.filter((c) => c.owner === "ChanMeng666" && c.pub) });
  sections.push({ id: "cm-priv", title: "ChanMeng666 · 私密", cards: rest.filter((c) => c.owner === "ChanMeng666" && !c.pub) });
  sections.push({ id: "archcanvas", title: "archcanvas 组织", cards: rest.filter((c) => c.owner === "archcanvas") });
  for (const o of OWNERS.slice(2)) sections.push({ id: `org-${o}`, title: `${o} 客户组织`, cards: rest.filter((c) => c.owner === o) });
  sections.push({ id: "mismatch", title: "Catalog 与 GitHub 不一致", sub: "GitHub 已归档，但 catalog tier ≠ archive", cards: mismatch });
  sections.push({ id: "forks", title: "Forks", sub: "上游的 fork，默认折叠", cards: forkCards, collapsed: true });
  for (const s of sections) s.cards.sort(byOrder);
  const liveSections = sections.filter((s) => s.cards.length);

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

  const FATES = [
    ["focus", "🔥 当前重点·精品主推"], ["listed", "✅ 保留展示"], ["shelved", "💤 搁置（不归档、不上README）"],
    ["archive", "📦 归档（GitHub archive + 目录 archive）"], ["data-only", "🗄 仅作数据存档（私密+归档，不进公开目录）"],
    ["minor", "🧹 无关紧要小项目（归档，永不展示）"], ["delete", "🗑 删除（需二次确认）"],
  ];
  const VISS = [["keep", "保持"], ["private", "设为私密"], ["public", "设为公开"]];
  const FATE_LABEL = Object.fromEntries(FATES);
  const VIS_LABEL = Object.fromEntries(VISS);

  const renderCard = (c, sectId) => {
    const catLines = c.cats.length
      ? c.cats.map((e) => `<div class="cat"><code>${esc(e.id)}</code> · ${esc(e.shard)} · ${esc(e.tier)} · ${esc(e.recency)} · ${esc(e.status)} · ${esc(e.provenance)}${e.buckets.length ? ` · ${e.buckets.map((b) => `<span class="flag mem">${esc(b)}</span>`).join("")}` : ""}</div>`).join("")
      : `<div class="cat dim">not in catalog</div>`;
    const hay = [c.key, c.desc, c.topics.join(" "), c.cats.map((e) => e.id).join(" "), c.local ?? ""].join(" ").toLowerCase();
    return `
<article class="card${c.pub ? "" : " is-priv"}" data-key="${esc(c.key)}" data-owner="${esc(c.owner)}" data-sect="${esc(sectId)}" data-warn="${c.warns.length}" data-hay="${esc(hay)}">
  <header class="card-head">
    <div class="ttl"><h2><a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.owner)}/${esc(c.name)}</a></h2>
      <span class="flag ${c.pub ? "pubf" : "privf"}">${c.pub ? "PUBLIC" : "PRIVATE"}</span>${c.fork ? '<span class="flag">FORK</span>' : ""}${c.archived ? '<span class="flag danger">ARCHIVED</span>' : ""}${c.empty ? '<span class="flag warn">EMPTY</span>' : ""}</div>
    <div class="stars">${c.stars}<span class="star-glyph">★</span> <span class="dim">⑂${c.forks}</span></div>
  </header>
  ${c.desc ? `<p class="tagline">${esc(c.desc.length > 240 ? c.desc.slice(0, 240) + "…" : c.desc)}</p>` : `<p class="tagline dim">（无 description）</p>`}
  <dl class="evidence">
    <div><dt>language</dt><dd>${esc(c.lang ?? "—")}</dd></div>
    <div><dt>created</dt><dd>${esc(c.created || "—")}</dd></div>
    <div><dt>last ${c.lastIsPush ? "push" : "commit"}</dt><dd>${esc(c.last || "—")}</dd></div>
    <div><dt>c30 / c90</dt><dd class="${(c.c30 ?? 0) > 0 ? "hot" : ""}">${c.c30 ?? "—"} / ${c.c90 ?? "—"}</dd></div>
    <div><dt>disk</dt><dd>${kb(c.disk)}</dd></div>
    <div><dt>local</dt><dd>${esc(c.local ?? "—")}</dd></div>
  </dl>
  ${c.topics.length ? `<div class="meta-row topics">${c.topics.slice(0, 8).map((t) => `<span class="flag">${esc(t)}</span>`).join("")}${c.topics.length > 8 ? `<span class="dim">+${c.topics.length - 8}</span>` : ""}</div>` : ""}
  ${c.home ? `<div class="meta-row links"><a href="${esc(c.home)}" target="_blank" rel="noopener">${esc(c.home.replace(/^https?:\/\//, "").slice(0, 60))}</a></div>` : ""}
  <div class="catalog">${catLines}</div>
  ${c.warns.length ? `<div class="meta-row">${c.warns.map((w) => `<span class="flag ${w.sev}">${esc(w.t)}</span>`).join("")}</div>` : ""}
  <div class="advice" role="note" aria-label="建议，非选择">
    <span class="advice-tag">★ 建议（非选择）</span>
    <span class="advice-body">${esc(FATE_LABEL[c.hint.fate])} · 可见性 ${esc(VIS_LABEL[c.hint.vis])} <span class="dim">— ${esc(c.hint.why)}</span></span>
  </div>
  <div class="controls">
    <div class="grp-lbl">去向 Fate</div>
    <div class="fates" role="radiogroup" aria-label="fate ${esc(c.key)}">${FATES.map(([v, l]) => `<label class="lv lv-${v}"><input type="radio" name="f__${esc(c.key)}" value="${v}" data-role="fate"><span>${l}</span></label>`).join("")}</div>
    <div class="grp-lbl">可见性 Visibility</div>
    <div class="viss" role="radiogroup" aria-label="visibility ${esc(c.key)}">${VISS.map(([v, l]) => `<label class="lv"><input type="radio" name="v__${esc(c.key)}" value="${v}" data-role="vis"><span>${l}</span></label>`).join("")}</div>
    <div class="warns" data-role="warns"></div>
    <div class="row"><input type="text" class="note-in" data-role="note" placeholder="备注（可选）" aria-label="note ${esc(c.key)}" maxlength="400">
    <button type="button" class="clear" data-role="clear">重置</button></div>
  </div>
</article>`;
  };

  const sectHtml = liveSections.map((s) => `
<details class="sect" data-sect="${esc(s.id)}"${s.collapsed ? "" : " open"}>
  <summary><span class="st">${esc(s.title)}</span> <span class="dim" data-role="sect-n">${s.cards.length} 个</span>${s.sub ? ` <span class="dim sub">· ${esc(s.sub)}</span>` : ""}</summary>
  <div class="grid">${s.cards.map((c) => renderCard(c, s.id)).join("\n")}</div>
</details>`).join("\n");

  const archByOwner = OWNERS.map((o) => [o, archivedList.filter((r) => r.owner.login === o).map((r) => r.name).sort()]).filter(([, a]) => a.length);
  const archHtml = `
<details class="sect arch-ref">
  <summary><span class="st">已归档仓库（只读参考）</span> <span class="dim">${archivedList.length} 个，不出卡片</span></summary>
  ${archByOwner.map(([o, a]) => `<p class="arch-own"><b>${esc(o)}</b> <span class="dim">(${a.length})</span><br>${a.map((n) => `<code>${esc(n)}</code>`).join(" ")}</p>`).join("")}
</details>`;

  const META = Object.fromEntries(allCards.map((c) => [c.key, {
    stars: c.stars, forks: c.forks, pub: c.pub, cat: c.cats.length, empty: c.empty,
    hf: c.hint.fate, hv: c.hint.vis, hw: c.hint.why, warn: c.warns.length,
  }]));
  const DATA = { fates: FATES, viss: VISS, meta: META, order: allCards.map((c) => c.key) };

  const client = fs.readFileSync(path.join(repoRoot, "scripts", "lib", "triage-repos-client.js"), "utf8");
  const sectOpts = liveSections.map((s) => `<option value="${esc(s.id)}">${esc(s.title)}</option>`).join("");
  const ownerOpts = OWNERS.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join("");
  const fateOpts = FATES.map(([v, l]) => `<option value="${v}">${esc(l.split("（")[0])}</option>`).join("");

  const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Repo Triage R2</title>
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
.lede{color:var(--dim);margin:0 0 14px;font-size:.88rem;max-width:90ch}
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
.sect>summary .sub{font-size:.78rem}
.sect.empty{display:none}
.grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(min(100%,380px),1fr))}
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
.evidence{display:grid;grid-template-columns:repeat(auto-fill,minmax(105px,1fr));gap:6px;margin:0}
.evidence div{min-width:0}
.evidence dt{font-size:.6rem;text-transform:uppercase;letter-spacing:.06em;color:var(--dim)}
.evidence dd{margin:0;font-size:.78rem;overflow-wrap:anywhere}
.evidence dd.hot{font-weight:700;color:var(--accent)}
.meta-row{font-size:.74rem;display:flex;flex-wrap:wrap;gap:5px;align-items:center}
.catalog{font-size:.74rem;overflow-wrap:anywhere}
.cat{margin:0 0 2px}
.flag{font-size:.66rem;padding:1px 7px;border-radius:999px;border:1px solid var(--line);margin-right:3px;white-space:nowrap}
.flag.mem{background:var(--state-soft);border-color:var(--state);color:var(--state)}
.flag.warn{background:var(--warn);border-color:var(--warn);color:var(--warn-ink);white-space:normal}
.flag.danger{background:var(--danger);border-color:var(--danger);color:var(--danger-ink);font-weight:700;white-space:normal}
.flag.privf{background:var(--fg);color:var(--bg);border-color:var(--fg);font-weight:700}
.flag.pubf{border-color:var(--state);color:var(--state);font-weight:700}
.advice{border:1px dashed var(--line);border-radius:10px;padding:6px 8px;font-size:.72rem;color:var(--dim);pointer-events:none;user-select:none}
.advice-tag{font-size:.6rem;letter-spacing:.06em;margin-right:6px;font-weight:700}
.advice-body{color:var(--fg)}
.advice-body .dim{color:var(--dim)}
.controls{margin-top:auto;display:flex;flex-direction:column;gap:6px}
.grp-lbl{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:var(--dim)}
.fates{display:grid;grid-template-columns:1fr;gap:4px}
.viss{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}
.lv{display:flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:9px;padding:5px 8px;font-size:.76rem;cursor:pointer;min-width:0}
.lv span{overflow-wrap:anywhere}
.lv:hover{border-color:var(--state)}
.lv:has(input:checked){background:var(--state-soft);border-color:var(--state);box-shadow:inset 0 0 0 1px var(--state);font-weight:700}
.lv input{accent-color:var(--state)}
.warns .w{font-size:.72rem;padding:3px 8px;border-radius:8px;margin-top:3px;background:var(--warn);color:var(--warn-ink)}
.warns .w.red{background:var(--danger);color:var(--danger-ink);font-weight:700}
.row{display:flex;gap:6px}
.note-in{flex:1;min-width:0;font:inherit;font-size:.78rem;padding:4px 8px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--fg)}
button.clear{font:inherit;font-size:.72rem;background:none;border:1px solid var(--line);color:var(--dim);border-radius:8px;padding:3px 8px;cursor:pointer}
.arch-ref p{font-size:.78rem;margin:6px 0;overflow-wrap:anywhere}
.arch-ref code{display:inline-block;margin:1px 4px 1px 0;color:var(--dim)}
#exportPanel{display:none;border:1px solid var(--line);border-radius:12px;background:var(--card);padding:12px;margin-bottom:16px}
#exportPanel.show{display:block}
#exportPanel textarea{width:100%;min-height:240px;font:400 12px/1.45 ${MONO};border:1px solid var(--line);border-radius:10px;padding:10px;background:var(--bg);color:var(--fg)}
#exportPanel .note{font-size:.78rem;color:var(--dim);margin:0 0 6px}
#exportPanel button{font:inherit;font-size:.82rem;padding:5px 12px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--fg);cursor:pointer;margin:6px 6px 0 0}
#exportPanel button.primary{background:var(--accent);border-color:var(--accent);color:var(--on-accent);font-weight:700}
</style></head>
<body>
<div class="wrap">
  <h1>Repo triage <span class="dot">/</span> R2</h1>
  <p class="lede">${mainSet.length} 个存活非 fork 仓库（含公开与私密）+ ${mismatch.length} 个 catalog 不一致 + ${forkCards.length} 个 fork；${archivedList.length} 个已归档仓库仅作参考。生成于 ${esc(generatedAt)}。
  每张卡片的「去向」和「可见性」都从 <b>未选择</b> 开始；虚线框里的 ★ 只是建议，不会替你选。选择自动保存在本浏览器，随时可导出。</p>

  <div class="bar">
    <div class="bar-row">
      <input type="search" id="q" placeholder="搜索 名称 / 描述 / catalog id…" aria-label="搜索">
      <select id="fOwner" aria-label="owner"><option value="">owner: 全部</option>${ownerOpts}</select>
      <select id="fSect" aria-label="section"><option value="">section: 全部</option>${sectOpts}</select>
      <select id="fFate" aria-label="fate"><option value="">fate: 全部</option>${fateOpts}<option value="__none">（未决定）</option></select>
      <label class="chk"><input type="checkbox" id="fUndec"> 仅未决定</label>
      <label class="chk"><input type="checkbox" id="fWarn"> 仅有警告</label>
    </div>
    <div class="bar-row">
      <button type="button" id="adopt">采纳全部建议(仅填空白)</button>
      <button type="button" id="clearAll">清空</button>
      <button type="button" id="export" class="primary">导出</button>
      <span class="tally" id="tally"></span>
    </div>
    <div class="confirm" id="confirmBar"><span id="confirmMsg"></span><button type="button" class="go" id="confirmYes">确认</button><button type="button" id="confirmNo">取消</button></div>
  </div>

  <section id="exportPanel" aria-label="导出">
    <p class="note" id="exportNote"></p>
    <textarea id="exportBox" spellcheck="false" aria-label="导出内容"></textarea>
    <div><button type="button" class="primary" id="copyBtn">复制到剪贴板</button><button type="button" id="closeExport">关闭</button></div>
  </section>

  <main id="main">
${sectHtml}
${archHtml}
  </main>
</div>
<script>window.TRIAGE=${JSON.stringify(DATA).replace(/</g, "\\u003c")};</script>
<script>
${client}
</script>
</body></html>
`;
  return {
    html,
    stats: {
      sections: liveSections.map((s) => [s.title, s.cards.length]),
      hints: allCards.reduce((a, c) => ((a[c.hint.fate] = (a[c.hint.fate] || 0) + 1), a), {}),
      visPrivate: allCards.filter((c) => c.hint.vis === "private").length,
      unmatched, archived: archivedList.length, total: allCards.length,
    },
  };
}
