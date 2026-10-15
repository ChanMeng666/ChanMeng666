#!/usr/bin/env node
// build-story-review-page.mjs — the decision page for the story review.
//
// Reads docs/stories/_private/_review.json (gitignored; written by the editor
// pass over docs/stories/) and writes a self-contained HTML page where Chan
// decides each item herself. The page holds private material (chat evidence,
// client security findings), so it is written into the gitignored folder and
// opened locally, never published.
//
// Usage:
//   node scripts/build-story-review-page.mjs [--in <json>] [--out <html>]
//
// HARD RULE: nothing is pre-selected. Every item starts undecided; the editor's
// suggestion is shown only as a ★ hint, and "accept all suggestions" is opt-in.
//
// _review.json shape:
//   { "generated": "2026-10-15",
//     "items": [ { "id": "archcanvas-d1", "project": "ArchCanvas",
//                  "category": "q|d|s|sec|e|x", "priority": "urgent|high|null",
//                  "text": "...", "options": ["..."]?, "suggestion": "..."?,
//                  "why": "..."?, "resolved": false?,
//                  "text_zh"?, "options_zh"?, "why_zh"? } ] }
// The page is shown in Chinese: a *_zh field is used when present (options_zh
// is parallel to options), the English otherwise. Choices are stored by the
// English option, so saved state survives a re-translation; the export shows
// the Chinese label with the English value in brackets.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const inFile = arg("--in", path.join(repoRoot, "docs/stories/_private/_review.json"));
const outFile = arg("--out", path.join(repoRoot, "docs/stories/_private/review.html"));

const DEFAULT_OPTIONS = {
  q: ["Answered in the note", "Leave open"],
  d: ["Update the shard to match the code", "The shard is right", "Reword both", "Later"],
  s: ["Keep as told", "Soften", "Remove", "Later"],
  sec: ["I will tell the client", "I will fix it myself", "No action", "Later"],
  e: ["I will ask them", "Not worth asking", "Later"],
  x: ["Do it", "Don't", "Later"],
};
const CATEGORY_LABEL = {
  q: "开放问题", d: "代码与数据库不一致", s: "敏感内容", sec: "安全问题", e: "证据缺口", x: "跨项目",
};
const PRIORITY_LABEL = { urgent: "紧急", high: "高优先" };
const projectLabel = (p) => ({ "Cross-cutting": "跨项目" })[p] ?? p;

const data = JSON.parse(fs.readFileSync(inFile, "utf8"));
const items = data.items
  .filter((it) => !it.resolved)
  .map((it) => {
    const options = it.options?.length ? it.options : DEFAULT_OPTIONS[it.category] ?? DEFAULT_OPTIONS.x;
    const labels = it.options_zh?.length === options.length ? it.options_zh : options;
    return { ...it, options, labels, shown: it.text_zh || it.text, whyShown: it.why_zh || it.why,
      suggestionLabel: it.suggestion ? labels[options.indexOf(it.suggestion)] ?? it.suggestion : null };
  });

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
// Inline markdown the review list uses: `code` and **bold**.
const md = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

const cards = items.map((it) => `
<article class="card" data-id="${esc(it.id)}" data-project="${esc(it.project)}" data-cat="${esc(it.category)}">
  <header>
    <span class="id">${esc(it.id)}</span>
    <span class="tag cat-${esc(it.category)}">${esc(CATEGORY_LABEL[it.category] ?? it.category)}</span>
    ${it.priority ? `<span class="tag pri-${esc(it.priority)}">${esc(PRIORITY_LABEL[it.priority] ?? it.priority)}</span>` : ""}
    <span class="project">${esc(projectLabel(it.project))}</span>
  </header>
  <p class="text">${md(it.shown)}</p>
  <div class="choices" role="radiogroup" aria-label="${esc(it.id)} 的决定">
    ${it.options.map((o, i) => `<button type="button" class="choice" data-value="${esc(o)}" data-label="${esc(it.labels[i])}" aria-pressed="false">${it.suggestion === o ? "★ " : ""}${esc(it.labels[i])}</button>`).join("")}
  </div>
  ${it.suggestion ? `<p class="hint">★ 建议：${esc(it.suggestionLabel)}${it.whyShown ? `。${md(it.whyShown)}` : ""}</p>` : ""}
  <textarea class="note" rows="2" placeholder="备注或回答（可选）"></textarea>
</article>`).join("\n");

const projects = [...new Set(items.map((it) => it.project))];

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>项目故事审阅</title>
<style>
:root { --bg:#faf7f2; --fg:#1d1a16; --muted:#6b645b; --card:#fff; --line:#e4ddd2; --accent:#c2410c; --on:#1d1a16; --onfg:#fff; --code:#f1ece4; }
@media (prefers-color-scheme: dark) { :root { --bg:#16140f; --fg:#eee7dc; --muted:#a39a8d; --card:#211e18; --line:#3a352c; --accent:#fb923c; --on:#eee7dc; --onfg:#16140f; --code:#2c2820; } }
* { box-sizing: border-box; }
body { margin:0; background:var(--bg); color:var(--fg); font:15px/1.6 system-ui, "Microsoft YaHei", "PingFang SC", sans-serif; }
.top { position:sticky; top:0; z-index:1; background:var(--bg); border-bottom:1px solid var(--line); padding:12px 16px; display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.top h1 { font-size:17px; margin:0 12px 0 0; }
.top input, .top select { font:inherit; padding:6px 8px; border:1px solid var(--line); border-radius:6px; background:var(--card); color:var(--fg); }
.top button { font:inherit; padding:6px 10px; border:1px solid var(--line); border-radius:6px; background:var(--card); color:var(--fg); cursor:pointer; }
.tally { color:var(--muted); margin-left:auto; }
main { max-width:900px; margin:0 auto; padding:16px; }
.card { background:var(--card); border:1px solid var(--line); border-radius:10px; padding:14px; margin:0 0 12px; }
.card.decided { border-left:4px solid var(--accent); }
.card header { display:flex; flex-wrap:wrap; gap:6px; align-items:center; font-size:13px; }
.id { font-family:ui-monospace, monospace; font-weight:600; }
.project { color:var(--muted); margin-left:auto; }
.tag { padding:1px 7px; border-radius:99px; border:1px solid var(--line); }
.pri-urgent { background:#b91c1c; color:#fff; border-color:#b91c1c; }
.pri-high { background:#c2410c; color:#fff; border-color:#c2410c; }
.text { margin:8px 0; }
code { background:var(--code); padding:0 4px; border-radius:4px; font-size:.92em; overflow-wrap:anywhere; }
.choices { display:flex; flex-wrap:wrap; gap:6px; }
.choice { font:inherit; font-size:14px; padding:5px 10px; border-radius:6px; border:1px solid var(--line); background:transparent; color:var(--fg); cursor:pointer; }
.choice[aria-pressed="true"] { background:var(--on); color:var(--onfg); border-color:var(--on); }
.hint { color:var(--muted); font-size:13px; margin:8px 0 0; }
.note { width:100%; margin-top:8px; font:inherit; font-size:14px; padding:6px 8px; border:1px solid var(--line); border-radius:6px; background:transparent; color:var(--fg); }
.hidden { display:none; }
#out { width:100%; min-height:160px; font-family:ui-monospace, monospace; font-size:13px; }
</style>
</head>
<body>
<div class="top">
  <h1>项目故事审阅</h1>
  <input id="q" type="search" placeholder="搜索">
  <select id="proj"><option value="">全部项目</option>${projects.map((p) => `<option value="${esc(p)}">${esc(projectLabel(p))}</option>`).join("")}</select>
  <select id="cat"><option value="">全部类别</option>${Object.entries(CATEGORY_LABEL).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select>
  <label><input id="undecided" type="checkbox"> 只看未决定</label>
  <button id="acceptAll" type="button">未决定的全部采用 ★</button>
  <button id="export" type="button">导出</button>
  <span class="tally" id="tally"></span>
</div>
<main>
<p>${esc(data.generated)} 由 <code>docs/stories/_private/_review.json</code> 生成。所有选项都未预选，★ 只是建议。你的选择保存在这个浏览器里；做完后点"导出"，把文本贴回给 Claude。</p>
${cards}
<section id="exportBox" class="hidden"><h2>导出</h2><textarea id="out" readonly></textarea></section>
</main>
<script>
const KEY = "story-review-${esc(data.generated)}";
let state = {};
try { state = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };
const cards = [...document.querySelectorAll(".card")];
function paint(card) {
  const s = state[card.dataset.id] || {};
  card.querySelectorAll(".choice").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.value === s.choice)));
  card.querySelector(".note").value = s.note || "";
  card.classList.toggle("decided", !!s.choice);
}
function tally() {
  const n = cards.filter(c => state[c.dataset.id]?.choice).length;
  document.getElementById("tally").textContent = n + " / " + cards.length + " 已决定";
}
function filter() {
  const q = document.getElementById("q").value.toLowerCase();
  const p = document.getElementById("proj").value, c = document.getElementById("cat").value;
  const u = document.getElementById("undecided").checked;
  cards.forEach(card => {
    const show = (!q || card.textContent.toLowerCase().includes(q)) && (!p || card.dataset.project === p)
      && (!c || card.dataset.cat === c) && (!u || !state[card.dataset.id]?.choice);
    card.classList.toggle("hidden", !show);
  });
}
cards.forEach(card => {
  paint(card);
  card.querySelectorAll(".choice").forEach(b => b.addEventListener("click", () => {
    const s = state[card.dataset.id] ||= {};
    s.choice = s.choice === b.dataset.value ? undefined : b.dataset.value;
    save(); paint(card); tally();
  }));
  card.querySelector(".note").addEventListener("input", e => {
    (state[card.dataset.id] ||= {}).note = e.target.value; save();
  });
});
["q", "proj", "cat", "undecided"].forEach(id => document.getElementById(id).addEventListener("input", filter));
document.getElementById("acceptAll").addEventListener("click", () => {
  cards.forEach(card => {
    const star = [...card.querySelectorAll(".choice")].find(b => b.textContent.startsWith("★"));
    if (star && !state[card.dataset.id]?.choice) { (state[card.dataset.id] ||= {}).choice = star.dataset.value; paint(card); }
  });
  save(); tally();
});
document.getElementById("export").addEventListener("click", () => {
  const labelOf = (card, v) => { const b = [...card.querySelectorAll(".choice")].find(x => x.dataset.value === v); return b ? b.dataset.label + " [" + v + "]" : v; };
  const lines = cards.filter(c => state[c.dataset.id]?.choice || state[c.dataset.id]?.note)
    .map(c => { const s = state[c.dataset.id]; return c.dataset.id + ": " + (s.choice ? labelOf(c, s.choice) : "（未选）") + (s.note ? " — " + s.note.replace(/\\n/g, " ") : ""); });
  const box = document.getElementById("exportBox"); box.classList.remove("hidden");
  const out = document.getElementById("out"); out.value = lines.join("\\n") || "（还没有做任何决定）";
  out.select(); try { navigator.clipboard.writeText(out.value); } catch {}
  box.scrollIntoView();
});
tally();
</script>
</body>
</html>
`;

fs.writeFileSync(outFile, html);
console.log(`wrote ${path.relative(repoRoot, outFile)} (${items.length} items)`);
