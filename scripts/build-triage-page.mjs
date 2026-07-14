#!/usr/bin/env node
// build-triage-page.mjs — generate the interactive project-triage page.
//
// Chan uses the generated page to decide, per project, how prominently it
// appears on the public GitHub profile README. The page is re-generated from
// live data (data/profile/*.yaml + `gh repo list`), never hand-written, so it
// can be re-run whenever the curation needs revisiting.
//
// Usage:
//   node scripts/build-triage-page.mjs > /path/to/triage.html
//   node scripts/build-triage-page.mjs --out /path/to/triage.html
//   node scripts/build-triage-page.mjs --repos-json cache.json   # offline / cached gh dump
//   node scripts/build-triage-page.mjs --dump-repos cache.json   # save the gh dump for reuse
//
// The page is fully self-contained (inline CSS + JS, no network requests of any
// kind) because it is published as an Artifact under a strict CSP.
//
// HARD RULE: nothing on the page is pre-selected. Every card starts
// `undecided`; the script's own opinion appears ONLY as a non-interactive
// advisory hint. See computeAdvice() for how that hint is derived.

import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { loadProfile } from "./lib/load-profile.mjs";

// ---------------------------------------------------------------------------
// args
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const argOf = (flag) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : null;
};
const OUT = argOf("--out");
const REPOS_JSON = argOf("--repos-json");
const DUMP_REPOS = argOf("--dump-repos");

// ---------------------------------------------------------------------------
// data
// ---------------------------------------------------------------------------
function loadRepos() {
  if (REPOS_JSON) {
    return JSON.parse(fs.readFileSync(REPOS_JSON, "utf8"));
  }
  const raw = execFileSync(
    "gh",
    [
      "repo",
      "list",
      "ChanMeng666",
      "--limit",
      "300",
      "--json",
      "name,isArchived,isPrivate,stargazerCount,pushedAt",
    ],
    { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 }
  );
  if (DUMP_REPOS) fs.writeFileSync(DUMP_REPOS, raw);
  return JSON.parse(raw);
}

const repoNameOf = (repoUrl) => {
  if (!repoUrl) return null;
  const m = String(repoUrl).match(/github\.com\/([^/]+)\/([^/#?]+)/i);
  if (!m) return null;
  return { owner: m[1], name: m[2].replace(/\.git$/, "") };
};

// Stars fallback for repos that `gh repo list ChanMeng666` cannot see (org-owned
// repos such as NZ-SheSharp/she-sharp). The shard's `Stars` metric is itself
// refreshed from GitHub by scripts/refresh-github-metrics.mjs, so it is the same
// number, just cached in the data.
const shardStars = (p) => {
  const m = (p.metrics || []).find((x) => /^(github )?stars$/i.test(String(x.label || "")));
  if (!m) return null;
  const n = parseInt(String(m.value).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
};

const daysSince = (iso) => {
  if (!iso) return null;
  const d = (Date.now() - new Date(iso).getTime()) / 86400000;
  return Number.isFinite(d) ? Math.round(d) : null;
};

// ---------------------------------------------------------------------------
// advisory hint — derived from card evidence, never a selection
// ---------------------------------------------------------------------------
// Every term below is visible on the card, so the hint is auditable, not taste.
function computeAdvice(c) {
  const why = [];
  let score = 0;
  const add = (n, label) => {
    if (n === 0) return;
    score += n;
    why.push(`${n > 0 ? "+" : ""}${n} ${label}`);
  };

  add({ flagship: 3, primary: 2, secondary: 1, archive: 0 }[c.tier] ?? 0, `tier ${c.tier}`);

  const s = c.stars ?? 0;
  add(s >= 50 ? 3 : s >= 20 ? 2 : s >= 5 ? 1 : 0, `${s}★`);

  add({ active: 1, recent: 0, historical: -1, deprecated: -2 }[c.recency] ?? 0, `recency ${c.recency}`);
  add(
    { client: 1, personal: 0, hackathon: 0, coursework: -1, bootcamp: -1 }[c.provenance] ?? 0,
    `provenance ${c.provenance}`
  );
  add(
    c.status === "production" || c.status === "live" ? 1 : c.status === "archived" ? -2 : 0,
    `status ${c.status}`
  );
  if (c.ghArchived) add(-2, "GitHub-archived");
  if (c.pushDays != null) {
    add(c.pushDays <= 90 ? 1 : c.pushDays > 730 ? -1 : 0, `pushed ${c.pushDays}d ago`);
  }

  const level = score >= 7 ? "hero" : score >= 4 ? "listed" : score >= 1 ? "kept" : "archived";
  const agentish =
    c.category === "ai-apps" ||
    c.category === "tools" ||
    (c.keywords || []).some((k) => /\b(mcp|agent|llm|ai)\b/i.test(String(k)));
  const bucket = level === "listed" ? (agentish ? "aiAgent" : "craft") : null;
  return { level, bucket, score, why: why.join(" · ") };
}

// ---------------------------------------------------------------------------
// build the candidate set
// ---------------------------------------------------------------------------
const profile = loadProfile();
const repos = loadRepos();
const byName = new Map(repos.map((r) => [r.name.toLowerCase(), r]));

const xb = profile.meta?.x_brand ?? {};
const BUCKET_LISTS = {
  flagship: xb.flagshipProjectIds ?? [],
  aiAgent: xb.aiAgentProjectIds ?? [],
  craft: xb.openSourceCraftProjectIds ?? [],
  spotlight: xb.spotlightProjectIds ?? [],
};

const all = (profile.projects ?? []).map((p) => {
  const rn = repoNameOf(p.repoUrl);
  const gh = rn ? byName.get(rn.name.toLowerCase()) : null;
  const ghStars = gh ? gh.stargazerCount : null;
  const stars = ghStars ?? shardStars(p);
  const memberships = Object.entries(BUCKET_LISTS)
    .filter(([, ids]) => ids.includes(p.id))
    .map(([k]) => k);
  return {
    id: p.id,
    name: p.name,
    tagline: (p.tagline || "").trim(),
    tier: p.tier ?? "—",
    status: p.status ?? "—",
    recency: p.recency ?? "—",
    provenance: p.provenance ?? "—",
    category: p.category ?? "—",
    keywords: p.keywords ?? [],
    url: p.url ?? null,
    repoUrl: p.repoUrl ?? null,
    repoOwner: rn?.owner ?? null,
    stars: stars ?? null,
    starSource: ghStars != null ? "gh" : stars != null ? "shard" : "none",
    pushedAt: gh?.pushedAt ?? null,
    pushDays: daysSince(gh?.pushedAt),
    ghArchived: gh ? !!gh.isArchived : false,
    ghPrivate: gh ? !!gh.isPrivate : false,
    ghMissing: !!p.repoUrl && !gh,
    memberships,
  };
});

// Candidate rule (from the task brief):
//   tier !== "archive"  ||  stars >= 5  ||  recency === "active"
const candidates = all.filter(
  (c) => c.tier !== "archive" || (c.stars ?? 0) >= 5 || c.recency === "active"
);
for (const c of candidates) c.advice = computeAdvice(c);

const sortKey = (c) => [-(c.stars ?? 0), c.name.toLowerCase()];
candidates.sort((a, b) => {
  const [as, an] = sortKey(a);
  const [bs, bn] = sortKey(b);
  return as - bs || (an < bn ? -1 : an > bn ? 1 : 0);
});

const GENERATED_AT = new Date().toISOString().slice(0, 10);
const facets = (k) => [...new Set(candidates.map((c) => c[k]))].sort();

process.stderr.write(
  `[triage] ${all.length} projects → ${candidates.length} candidates ` +
    `(non-archive ${all.filter((c) => c.tier !== "archive").length}; ` +
    `archive rescued by ≥5★ or active ${candidates.filter((c) => c.tier === "archive").length})\n`
);

// ---------------------------------------------------------------------------
// render
// ---------------------------------------------------------------------------
const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const LEVELS = [
  ["hero", "Hero card"],
  ["listed", "Listed"],
  ["kept", "Kept, not shown"],
  ["archived", "Demote to archive"],
];

const card = (c) => {
  const push = c.pushedAt
    ? `${c.pushedAt.slice(0, 10)} <span class="dim">(${c.pushDays}d)</span>`
    : `<span class="dim">no GitHub repo</span>`;
  const starTxt =
    c.stars == null
      ? '<span class="dim">—</span>'
      : `${c.stars}${c.starSource === "shard" ? '<span class="dim" title="from the shard Stars metric — repo is not owned by ChanMeng666">*</span>' : ""}`;
  const flags = [
    c.ghArchived ? `<span class="flag danger">GH archived</span>` : "",
    c.ghPrivate ? `<span class="flag warn">private</span>` : "",
    c.ghMissing ? `<span class="flag warn">repo not in gh list</span>` : "",
  ].join("");
  const mem = c.memberships.length
    ? c.memberships.map((m) => `<span class="flag mem">${esc(m)}</span>`).join("")
    : `<span class="dim">none</span>`;
  const links = [
    c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener">site</a>` : "",
    c.repoUrl ? `<a href="${esc(c.repoUrl)}" target="_blank" rel="noopener">repo</a>` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return `
<article class="card" data-id="${esc(c.id)}" data-tier="${esc(c.tier)}" data-prov="${esc(c.provenance)}"
  data-cat="${esc(c.category)}" data-stars="${c.stars ?? 0}" data-push="${c.pushDays ?? 99999}"
  data-name="${esc(c.name.toLowerCase())}">
  <header class="card-head">
    <div>
      <h2>${esc(c.name)}</h2>
      <code class="id">${esc(c.id)}</code>
    </div>
    <div class="stars" title="GitHub stars">${starTxt}<span class="star-glyph">★</span></div>
  </header>

  <p class="tagline">${esc(c.tagline.length > 260 ? c.tagline.slice(0, 260) + "…" : c.tagline)}</p>

  <dl class="evidence">
    <div><dt>tier</dt><dd>${esc(c.tier)}</dd></div>
    <div><dt>status</dt><dd>${esc(c.status)}</dd></div>
    <div><dt>recency</dt><dd>${esc(c.recency)}</dd></div>
    <div><dt>provenance</dt><dd>${esc(c.provenance)}</dd></div>
    <div><dt>category</dt><dd>${esc(c.category)}</dd></div>
    <div><dt>last push</dt><dd>${push}</dd></div>
  </dl>
  <div class="meta-row"><span class="lbl">in buckets</span> ${mem} ${flags}</div>
  ${links ? `<div class="meta-row links">${links}</div>` : ""}

  <div class="advice" role="note" aria-label="advisory hint, not a selection">
    <span class="advice-tag">★ advisory only</span>
    <span class="advice-body">Claude would say <b>${esc(c.advice.level)}</b>${
      c.advice.bucket ? ` · <b>${esc(c.advice.bucket)}</b>` : ""
    } <span class="dim">— score ${c.advice.score}: ${esc(c.advice.why)}</span></span>
  </div>

  <div class="controls">
    <div class="levels" role="radiogroup" aria-label="level for ${esc(c.name)}">
      ${LEVELS.map(
        ([v, label]) => `<label class="lv lv-${v}">
        <input type="radio" name="lv__${esc(c.id)}" value="${v}" data-role="level">
        <span>${label}</span></label>`
      ).join("")}
    </div>
    <div class="sub">
      <label class="bkt">bucket
        <select data-role="bucket" disabled aria-label="bucket for ${esc(c.name)}">
          <option value="">— none —</option>
          <option value="aiAgent">aiAgent</option>
          <option value="craft">craft</option>
        </select>
      </label>
      <label class="spot">
        <input type="checkbox" data-role="spotlight"> <span>⭐ Spotlight</span>
      </label>
      <button type="button" class="clear" data-role="clear" title="reset this card to undecided">reset</button>
    </div>
  </div>
</article>`;
};

const html = `<title>Project triage — README curation ${GENERATED_AT}</title>
<style>
:root{
  --bg:#faf7f2; --fg:#1a1714; --dim:#6d6459; --card:#fff; --line:#e2d9cc;
  --accent:#d8541e; --accent-soft:#fdeee6; --ok:#1f7a4c; --warn:#8a6d1f; --danger:#a8321c;
  --shadow:0 1px 2px rgba(0,0,0,.05),0 6px 18px rgba(0,0,0,.04);
}
@media (prefers-color-scheme:dark){
  :root{ --bg:#16130f; --fg:#f2ece4; --dim:#9d9184; --card:#211c17; --line:#3a322a;
    --accent:#ff7a45; --accent-soft:#3a2318; --ok:#5fd39b; --warn:#e0bd63; --danger:#ff8a72;
    --shadow:none; }
}
:root[data-theme="dark"]{ --bg:#16130f; --fg:#f2ece4; --dim:#9d9184; --card:#211c17; --line:#3a322a;
  --accent:#ff7a45; --accent-soft:#3a2318; --ok:#5fd39b; --warn:#e0bd63; --danger:#ff8a72; --shadow:none; }
:root[data-theme="light"]{ --bg:#faf7f2; --fg:#1a1714; --dim:#6d6459; --card:#fff; --line:#e2d9cc;
  --accent:#d8541e; --accent-soft:#fdeee6; --ok:#1f7a4c; --warn:#8a6d1f; --danger:#a8321c;
  --shadow:0 1px 2px rgba(0,0,0,.05),0 6px 18px rgba(0,0,0,.04); }

*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);overflow-x:hidden;
  font:15px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;}
.wrap{max-width:1500px;margin:0 auto;padding:24px 16px 120px}
h1{font-size:1.5rem;margin:0 0 4px}
.sub-title{color:var(--dim);margin:0 0 18px;font-size:.9rem}
.dim{color:var(--dim)}
a{color:var(--accent)}

.bar{position:sticky;top:0;z-index:20;background:var(--bg);border-bottom:1px solid var(--line);
  padding:10px 0;margin-bottom:18px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.bar select,.bar input[type=search],.bar button{font:inherit;font-size:.85rem;padding:6px 8px;
  border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--fg)}
.bar button{cursor:pointer}
.bar button.primary{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:600}
.counter{margin-left:auto;font-size:.85rem;font-variant-numeric:tabular-nums}
.counter b{color:var(--accent)}

.grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(min(100%,360px),1fr))}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;
  box-shadow:var(--shadow);display:flex;flex-direction:column;gap:10px;min-width:0}
.card.decided{border-color:var(--ok)}
.card.hidden{display:none}
.card-head{display:flex;gap:10px;justify-content:space-between;align-items:flex-start;min-width:0}
.card-head h2{font-size:1rem;margin:0;overflow-wrap:anywhere}
.id{font-size:.72rem;color:var(--dim)}
.stars{white-space:nowrap;font-weight:700;font-variant-numeric:tabular-nums}
.star-glyph{color:var(--accent);margin-left:2px}
.tagline{margin:0;font-size:.82rem;color:var(--dim);overflow-wrap:anywhere}

.evidence{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:6px;margin:0}
.evidence div{min-width:0}
.evidence dt{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:var(--dim)}
.evidence dd{margin:0;font-size:.8rem;overflow-wrap:anywhere}
.meta-row{font-size:.75rem;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.meta-row .lbl{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:var(--dim)}
.links a{margin-right:8px}
.flag{font-size:.68rem;padding:1px 7px;border-radius:999px;border:1px solid var(--line)}
.flag.mem{background:var(--accent-soft);border-color:var(--accent);color:var(--accent)}
.flag.warn{color:var(--warn);border-color:var(--warn)}
.flag.danger{color:var(--danger);border-color:var(--danger)}

/* advisory hint — deliberately NOT a control: dashed, muted, pointer-events:none */
.advice{border:1px dashed var(--line);border-radius:10px;padding:6px 8px;font-size:.75rem;
  background:transparent;color:var(--dim);pointer-events:none;user-select:none}
.advice-tag{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:var(--accent);
  margin-right:6px;white-space:nowrap}
.advice-body b{color:var(--fg)}

.controls{margin-top:auto;display:flex;flex-direction:column;gap:8px}
.levels{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.lv{display:flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:9px;
  padding:6px 8px;font-size:.78rem;cursor:pointer;min-width:0}
.lv span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lv:hover{border-color:var(--accent)}
.lv:has(input:checked){background:var(--accent-soft);border-color:var(--accent);font-weight:600}
.sub{display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-size:.78rem}
.sub select{font:inherit;padding:4px 6px;border-radius:8px;border:1px solid var(--line);
  background:var(--bg);color:var(--fg)}
.sub select:disabled{opacity:.45}
.bkt,.spot{display:flex;align-items:center;gap:5px}
button.clear{margin-left:auto;font:inherit;font-size:.72rem;background:none;border:1px solid var(--line);
  color:var(--dim);border-radius:8px;padding:3px 8px;cursor:pointer}

.hero-panel{border:1px solid var(--accent);border-radius:12px;padding:12px;margin-bottom:18px;
  background:var(--accent-soft)}
.hero-panel h3{margin:0 0 6px;font-size:.85rem;text-transform:uppercase;letter-spacing:.06em;color:var(--accent)}
#heroList{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
#heroList li{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:6px 10px;
  font-size:.82rem;cursor:grab;display:flex;gap:8px;align-items:center}
#heroList li.dragging{opacity:.4}
#heroList li .grip{color:var(--dim)}
#heroList li .pos{font-variant-numeric:tabular-nums;color:var(--dim);min-width:1.4em}

#exportBox{width:100%;min-height:220px;margin-top:10px;font:12px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace;
  border:1px solid var(--line);border-radius:10px;padding:10px;background:var(--card);color:var(--fg)}
dialog{border:1px solid var(--line);border-radius:14px;background:var(--card);color:var(--fg);
  max-width:min(820px,94vw);width:100%;padding:16px}
dialog::backdrop{background:rgba(0,0,0,.45)}
.note{font-size:.78rem;color:var(--dim)}
@media (max-width:480px){ .levels{grid-template-columns:1fr} }
</style>

<div class="wrap">
  <h1>Project triage — README curation</h1>
  <p class="sub-title">${candidates.length} candidates · generated ${GENERATED_AT} from <code>data/profile/*.yaml</code> + <code>gh repo list</code>.
  Every card starts <b>undecided</b>. The dashed ★ line is an advisory hint, not a selection — nothing is chosen for you.
  Decisions are saved in this browser as you click; Export any time.</p>

  <div class="bar">
    <input type="search" id="q" placeholder="search name / id…" aria-label="search">
    <select id="sort" aria-label="sort">
      <option value="stars">sort: stars ↓</option>
      <option value="tier">sort: tier</option>
      <option value="prov">sort: provenance</option>
      <option value="cat">sort: category</option>
      <option value="push">sort: last push ↓</option>
      <option value="name">sort: name</option>
    </select>
    <select id="fTier" aria-label="filter tier"><option value="">tier: all</option>${facets("tier")
      .map((v) => `<option value="${esc(v)}">tier: ${esc(v)}</option>`)
      .join("")}</select>
    <select id="fProv" aria-label="filter provenance"><option value="">provenance: all</option>${facets("provenance")
      .map((v) => `<option value="${esc(v)}">${esc(v)}</option>`)
      .join("")}</select>
    <select id="fCat" aria-label="filter category"><option value="">category: all</option>${facets("category")
      .map((v) => `<option value="${esc(v)}">${esc(v)}</option>`)
      .join("")}</select>
    <select id="fState" aria-label="filter decided">
      <option value="">state: all</option>
      <option value="undecided">undecided only</option>
      <option value="decided">decided only</option>
    </select>
    <button type="button" id="export" class="primary">Export JSON</button>
    <button type="button" id="resetAll">Reset all</button>
    <span class="counter"><b id="nUndecided">${candidates.length}</b> undecided / ${candidates.length}</span>
  </div>

  <section class="hero-panel" id="heroPanel" hidden>
    <h3>Hero card order — drag to reorder (this is the README card order)</h3>
    <ol id="heroList"></ol>
  </section>

  <main class="grid" id="grid">
    ${candidates.map(card).join("\n")}
  </main>
</div>

<dialog id="exportDlg">
  <h3 style="margin-top:0">Export</h3>
  <p class="note" id="exportNote"></p>
  <textarea id="exportBox" spellcheck="false" aria-label="exported JSON"></textarea>
  <div style="display:flex;gap:8px;margin-top:10px">
    <button type="button" id="copyBtn" class="primary" style="font:inherit;padding:6px 12px;border-radius:8px;border:1px solid var(--accent);background:var(--accent);color:#fff;cursor:pointer">Copy to clipboard</button>
    <button type="button" id="closeDlg" style="font:inherit;padding:6px 12px;border-radius:8px;border:1px solid var(--line);background:var(--card);color:var(--fg);cursor:pointer">Close</button>
  </div>
</dialog>

<script>
(function(){
  "use strict";
  var KEY = "chan-readme-triage-v1";
  var IDS = ${JSON.stringify(candidates.map((c) => c.id))};
  var state = { d: {}, heroOrder: [] };   // d[id] = {level,bucket,spotlight}

  // Restored values are untrusted: a stale/poisoned localStorage entry (e.g. a level
  // name from a future rename under the same key) must degrade to "undecided", never
  // produce an off-contract export row. Whitelist on the way in.
  var LEVELS = { hero:1, listed:1, kept:1, archived:1 };
  var BUCKETS = { aiAgent:1, craft:1 };
  function sanitize(d){
    if (!d || typeof d !== "object") return null;
    var level = LEVELS[d.level] ? d.level : null;
    var bucket = (level === "listed" && BUCKETS[d.bucket]) ? d.bucket : null;
    var spotlight = d.spotlight === true;
    if (!level && !spotlight) return null;   // nothing meaningful → undecided
    return { level: level, bucket: bucket, spotlight: spotlight };
  }

  try {
    var raw = localStorage.getItem(KEY);
    if (raw) {
      var p = JSON.parse(raw);
      if (p && p.d && typeof p.d === "object") {
        var clean = {};
        IDS.forEach(function(id){
          var s = sanitize(p.d[id]);
          if (s) clean[id] = s;
        });
        var order = (Array.isArray(p.heroOrder) ? p.heroOrder : []).filter(function(id){
          return clean[id] && clean[id].level === "hero";
        });
        state = { d: clean, heroOrder: order };
      }
    }
  } catch (e) { /* corrupt/blocked storage → start clean */ }

  function save(){ try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){} }
  function get(id){ return state.d[id] || null; }

  var grid = document.getElementById("grid");
  var cards = Array.prototype.slice.call(grid.querySelectorAll(".card"));
  var byId = {};
  cards.forEach(function(el){ byId[el.dataset.id] = el; });

  // ---- restore saved decisions onto the DOM (nothing is preset in the HTML) --
  function applyToCard(el){
    var id = el.dataset.id, d = get(id);
    var radios = el.querySelectorAll('input[data-role="level"]');
    var bucket = el.querySelector('[data-role="bucket"]');
    var spot = el.querySelector('[data-role="spotlight"]');
    Array.prototype.forEach.call(radios, function(r){ r.checked = !!(d && d.level === r.value); });
    bucket.value = (d && d.level === "listed" && d.bucket) ? d.bucket : "";
    bucket.disabled = !(d && d.level === "listed");
    spot.checked = !!(d && d.spotlight);
    el.classList.toggle("decided", !!(d && d.level));
  }

  function setLevel(id, level){
    var d = state.d[id] || (state.d[id] = { level:null, bucket:null, spotlight:false });
    d.level = level;
    if (level !== "listed") d.bucket = null;
    if (level === "hero") { if (state.heroOrder.indexOf(id) < 0) state.heroOrder.push(id); }
    else { state.heroOrder = state.heroOrder.filter(function(x){ return x !== id; }); }
    save(); applyToCard(byId[id]); renderHero(); renderCount();
  }

  grid.addEventListener("change", function(e){
    var el = e.target.closest(".card"); if (!el) return;
    var id = el.dataset.id, role = e.target.dataset.role;
    if (role === "level") { setLevel(id, e.target.value); return; }
    var d = state.d[id] || (state.d[id] = { level:null, bucket:null, spotlight:false });
    if (role === "bucket") d.bucket = e.target.value || null;
    if (role === "spotlight") d.spotlight = e.target.checked;
    save(); applyToCard(el); renderCount();
  });

  grid.addEventListener("click", function(e){
    if (!e.target.matches('[data-role="clear"]')) return;
    var el = e.target.closest(".card"), id = el.dataset.id;
    delete state.d[id];
    state.heroOrder = state.heroOrder.filter(function(x){ return x !== id; });
    save(); applyToCard(el); renderHero(); renderCount();
  });

  // ---- counter ------------------------------------------------------------
  var nEl = document.getElementById("nUndecided");
  function decidedCount(){
    return IDS.filter(function(id){ var d = get(id); return d && d.level; }).length;
  }
  function renderCount(){ nEl.textContent = String(IDS.length - decidedCount()); }

  // ---- hero drag-reorder --------------------------------------------------
  var heroPanel = document.getElementById("heroPanel");
  var heroList = document.getElementById("heroList");
  function heroIds(){
    var chosen = IDS.filter(function(id){ var d = get(id); return d && d.level === "hero"; });
    var ordered = state.heroOrder.filter(function(id){ return chosen.indexOf(id) >= 0; });
    chosen.forEach(function(id){ if (ordered.indexOf(id) < 0) ordered.push(id); });
    state.heroOrder = ordered;
    return ordered;
  }
  function renderHero(){
    var ids = heroIds();
    heroPanel.hidden = ids.length === 0;
    heroList.textContent = "";
    ids.forEach(function(id, i){
      var li = document.createElement("li");
      li.draggable = true; li.dataset.id = id;
      var pos = document.createElement("span"); pos.className = "pos"; pos.textContent = (i+1) + ".";
      var grip = document.createElement("span"); grip.className = "grip"; grip.textContent = "⠿";
      var name = document.createElement("span");
      name.textContent = (byId[id].querySelector("h2").textContent) + "  (" + id + ")";
      li.appendChild(pos); li.appendChild(grip); li.appendChild(name);
      heroList.appendChild(li);
    });
    save();
  }
  var dragEl = null;
  heroList.addEventListener("dragstart", function(e){
    dragEl = e.target.closest("li"); if (!dragEl) return;
    dragEl.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", dragEl.dataset.id); } catch(err){}
  });
  heroList.addEventListener("dragend", function(){
    if (dragEl) dragEl.classList.remove("dragging");
    dragEl = null;
    state.heroOrder = Array.prototype.map.call(heroList.children, function(li){ return li.dataset.id; });
    save(); renderHero();
  });
  heroList.addEventListener("dragover", function(e){
    e.preventDefault();
    if (!dragEl) return;
    var over = e.target.closest("li");
    if (!over || over === dragEl) return;
    var r = over.getBoundingClientRect();
    var after = (e.clientY - r.top) / r.height > 0.5;
    heroList.insertBefore(dragEl, after ? over.nextSibling : over);
  });

  // ---- filter / sort ------------------------------------------------------
  var q = document.getElementById("q");
  var sortSel = document.getElementById("sort");
  var fTier = document.getElementById("fTier");
  var fProv = document.getElementById("fProv");
  var fCat = document.getElementById("fCat");
  var fState = document.getElementById("fState");
  var TIER_ORDER = { flagship:0, primary:1, secondary:2, archive:3 };

  function refresh(){
    var term = q.value.trim().toLowerCase();
    cards.forEach(function(el){
      var id = el.dataset.id, d = get(id);
      var ok = true;
      if (term && (el.dataset.name.indexOf(term) < 0 && id.toLowerCase().indexOf(term) < 0)) ok = false;
      if (fTier.value && el.dataset.tier !== fTier.value) ok = false;
      if (fProv.value && el.dataset.prov !== fProv.value) ok = false;
      if (fCat.value && el.dataset.cat !== fCat.value) ok = false;
      if (fState.value === "undecided" && d && d.level) ok = false;
      if (fState.value === "decided" && !(d && d.level)) ok = false;
      el.classList.toggle("hidden", !ok);
    });
    var mode = sortSel.value;
    var sorted = cards.slice().sort(function(a,b){
      if (mode === "stars") return (+b.dataset.stars) - (+a.dataset.stars) || a.dataset.name.localeCompare(b.dataset.name);
      if (mode === "push")  return (+a.dataset.push) - (+b.dataset.push);
      if (mode === "tier")  return (TIER_ORDER[a.dataset.tier] - TIER_ORDER[b.dataset.tier]) || (+b.dataset.stars) - (+a.dataset.stars);
      if (mode === "prov")  return a.dataset.prov.localeCompare(b.dataset.prov) || (+b.dataset.stars) - (+a.dataset.stars);
      if (mode === "cat")   return a.dataset.cat.localeCompare(b.dataset.cat) || (+b.dataset.stars) - (+a.dataset.stars);
      return a.dataset.name.localeCompare(b.dataset.name);
    });
    sorted.forEach(function(el){ grid.appendChild(el); });
  }
  [q,sortSel,fTier,fProv,fCat,fState].forEach(function(el){
    el.addEventListener("input", refresh);
    el.addEventListener("change", refresh);
  });

  // ---- export -------------------------------------------------------------
  function exportArray(){
    var order = heroIds();
    var rest = IDS.filter(function(id){ return order.indexOf(id) < 0; });
    return order.concat(rest).map(function(id){
      var d = get(id) || {};
      var level = d.level || "undecided";
      return {
        id: id,
        level: level,
        spotlight: !!d.spotlight,
        bucket: level === "listed" ? (d.bucket || null) : null
      };
    });
  }
  var dlg = document.getElementById("exportDlg");
  var box = document.getElementById("exportBox");
  var note = document.getElementById("exportNote");
  document.getElementById("export").addEventListener("click", function(){
    var arr = exportArray();
    var undec = arr.filter(function(x){ return x.level === "undecided"; }).length;
    box.value = JSON.stringify(arr, null, 2);
    note.textContent = arr.length + " projects · " + undec + " still undecided" +
      (undec ? " (exported as \\"undecided\\" — safe to export mid-way and finish later)" : "") +
      ". Hero entries come first, in your drag order.";
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open","");
    box.focus(); box.select();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(box.value).catch(function(){});
    }
  });
  document.getElementById("copyBtn").addEventListener("click", function(){
    box.select();
    var done = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(box.value).then(function(){
        document.getElementById("copyBtn").textContent = "Copied ✓";
      }).catch(function(){});
      done = true;
    }
    if (!done) { try { document.execCommand("copy"); } catch(e){} }
  });
  document.getElementById("closeDlg").addEventListener("click", function(){
    if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open");
  });

  document.getElementById("resetAll").addEventListener("click", function(){
    if (!confirm("Clear every decision on this page?")) return;
    state = { d: {}, heroOrder: [] };
    save(); cards.forEach(applyToCard); renderHero(); renderCount(); refresh();
  });

  cards.forEach(applyToCard);
  renderHero(); renderCount(); refresh();
})();
</script>`;

if (OUT) {
  fs.writeFileSync(OUT, html);
  process.stderr.write(`[triage] wrote ${OUT}\n`);
} else {
  process.stdout.write(html);
}
