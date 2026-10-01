(function () {
  "use strict";
  // Client for the repo-centric triage page (scripts/lib/triage-repos-page.mjs).
  // State d[key] = {fate, vis, note}; every field starts null (nothing pre-selected).
  var KEY = "triage-r2-v1";
  var T = window.TRIAGE;
  var META = T.meta, IDS = T.order;
  var FATES = {}, VISS = {};
  T.fates.forEach(function (f) { FATES[f[0]] = f[1]; });
  T.viss.forEach(function (v) { VISS[v[0]] = v[1]; });
  var state = {};

  function sanitize(d) {
    if (!d || typeof d !== "object") return null;
    var fate = FATES[d.fate] ? d.fate : null;
    var vis = VISS[d.vis] ? d.vis : null;
    var note = typeof d.note === "string" ? d.note.slice(0, 400) : "";
    if (!fate && !vis && !note) return null;
    return { fate: fate, vis: vis, note: note };
  }
  try {
    var raw = localStorage.getItem(KEY);
    if (raw) {
      var p = JSON.parse(raw);
      if (p && typeof p === "object") {
        IDS.forEach(function (k) { var s = sanitize(p[k]); if (s) state[k] = s; });
      }
    }
  } catch (e) { /* blocked or corrupt storage: start clean */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  var main = document.getElementById("main");
  var cards = Array.prototype.slice.call(main.querySelectorAll(".card"));
  var byKey = {};
  cards.forEach(function (el) { byKey[el.dataset.key] = el; });

  function ensure(k) { return state[k] || (state[k] = { fate: null, vis: null, note: "" }); }

  function warnsFor(k) {
    var m = META[k], d = state[k] || {}, out = [];
    if (d.vis === "private" && m.pub) out.push({ red: false, t: "会清空 " + m.stars + "★ 星标与 fork 关系" + (m.forks ? "（" + m.forks + " 个 fork）" : "") });
    if (d.vis === "public" && !m.pub) out.push({ red: false, t: "公开前需做密钥扫描" });
    if (d.fate === "delete" && (m.stars > 0 || m.cat > 0)) {
      out.push({ red: true, t: "删除警告：" + (m.stars > 0 ? m.stars + "★ 星标" : "") + (m.stars > 0 && m.cat > 0 ? "，" : "") + (m.cat > 0 ? "catalog 里有对应条目" : "") + "，不可恢复" });
    } else if (d.fate === "delete") {
      out.push({ red: false, t: "删除需二次确认，执行前会再问一次" });
    }
    if (d.fate === "data-only" && m.pub && d.vis !== "private") out.push({ red: false, t: "数据存档应为私密：建议同时选「设为私密」" });
    return out;
  }

  function apply(el) {
    var k = el.dataset.key, d = state[k] || {};
    Array.prototype.forEach.call(el.querySelectorAll('input[data-role="fate"]'), function (r) { r.checked = d.fate === r.value; });
    Array.prototype.forEach.call(el.querySelectorAll('input[data-role="vis"]'), function (r) { r.checked = d.vis === r.value; });
    var n = el.querySelector('[data-role="note"]');
    if (document.activeElement !== n) n.value = d.note || "";
    el.classList.toggle("decided", !!d.fate);
    var w = el.querySelector('[data-role="warns"]');
    w.textContent = "";
    warnsFor(k).forEach(function (x) {
      var div = document.createElement("div");
      div.className = "w" + (x.red ? " red" : "");
      div.textContent = x.t;
      w.appendChild(div);
    });
  }

  main.addEventListener("change", function (e) {
    var el = e.target.closest(".card"); if (!el) return;
    var k = el.dataset.key, role = e.target.dataset.role;
    if (role === "fate") ensure(k).fate = e.target.value;
    else if (role === "vis") ensure(k).vis = e.target.value;
    else return;
    save(); apply(el); tally(); refresh();
  });
  main.addEventListener("input", function (e) {
    if (e.target.dataset.role !== "note") return;
    var el = e.target.closest(".card");
    ensure(el.dataset.key).note = e.target.value;
    save();
  });
  main.addEventListener("click", function (e) {
    if (e.target.dataset.role !== "clear") return;
    var el = e.target.closest(".card");
    delete state[el.dataset.key];
    save(); apply(el); tally(); refresh();
  });

  // ---- tally ----
  var tallyEl = document.getElementById("tally");
  function tally() {
    var counts = {}, undec = 0, toPriv = 0, toPub = 0;
    IDS.forEach(function (k) {
      var d = state[k] || {};
      if (d.fate) counts[d.fate] = (counts[d.fate] || 0) + 1; else undec++;
      if (d.vis === "private") toPriv++;
      if (d.vis === "public") toPub++;
    });
    tallyEl.textContent = "";
    function chip(label, n, cls) {
      var s = document.createElement("span"); if (cls) s.className = cls;
      s.appendChild(document.createTextNode(label + " "));
      var b = document.createElement("b"); b.textContent = String(n); s.appendChild(b);
      tallyEl.appendChild(s);
    }
    T.fates.forEach(function (f) { chip(f[1].split(" ")[0], counts[f[0]] || 0); });
    chip("→私密", toPriv); chip("→公开", toPub);
    chip("未决定", undec, "undec");
  }

  // ---- filters ----
  var q = document.getElementById("q"), fOwner = document.getElementById("fOwner"),
    fSect = document.getElementById("fSect"), fFate = document.getElementById("fFate"),
    fUndec = document.getElementById("fUndec"), fWarn = document.getElementById("fWarn");
  function refresh() {
    var term = q.value.trim().toLowerCase();
    cards.forEach(function (el) {
      var d = state[el.dataset.key] || {}, ok = true;
      if (term && el.dataset.hay.indexOf(term) < 0) ok = false;
      if (fOwner.value && el.dataset.owner !== fOwner.value) ok = false;
      if (fSect.value && el.dataset.sect !== fSect.value) ok = false;
      if (fFate.value === "__none" && d.fate) ok = false;
      else if (fFate.value && fFate.value !== "__none" && d.fate !== fFate.value) ok = false;
      if (fUndec.checked && d.fate) ok = false;
      if (fWarn.checked && !(+el.dataset.warn > 0 || warnsFor(el.dataset.key).length)) ok = false;
      el.classList.toggle("hidden", !ok);
    });
    Array.prototype.forEach.call(main.querySelectorAll("details.sect[data-sect]"), function (s) {
      var vis = s.querySelectorAll(".card:not(.hidden)").length;
      s.classList.toggle("empty", vis === 0);
      var n = s.querySelector('[data-role="sect-n"]');
      if (n) n.textContent = vis + " / " + s.querySelectorAll(".card").length + " 个";
    });
  }
  [q, fOwner, fSect, fFate, fUndec, fWarn].forEach(function (el) {
    el.addEventListener("input", refresh); el.addEventListener("change", refresh);
  });

  // ---- inline confirm bar (no window.confirm) ----
  var bar = document.getElementById("confirmBar"), msg = document.getElementById("confirmMsg");
  var pending = null;
  function ask(text, fn) { pending = fn; msg.textContent = text; bar.classList.add("show"); }
  document.getElementById("confirmNo").addEventListener("click", function () { pending = null; bar.classList.remove("show"); });
  document.getElementById("confirmYes").addEventListener("click", function () {
    var fn = pending; pending = null; bar.classList.remove("show"); if (fn) fn();
  });
  document.getElementById("adopt").addEventListener("click", function () {
    var n = 0;
    IDS.forEach(function (k) { var d = state[k] || {}; if (!d.fate) n++; });
    ask("将按建议填入 " + n + " 张卡片的空白「去向」，以及空白的「可见性」；已选的不会改动。继续？", function () {
      IDS.forEach(function (k) {
        var m = META[k], d = state[k] || {};
        if (!d.fate) ensure(k).fate = m.hf;
        if (!d.vis) ensure(k).vis = m.hv;
      });
      save(); cards.forEach(apply); tally(); refresh();
    });
  });
  document.getElementById("clearAll").addEventListener("click", function () {
    ask("清空本页所有选择与备注？此操作不可撤销。", function () {
      state = {}; save(); cards.forEach(apply); tally(); refresh();
    });
  });

  // ---- export ----
  var panel = document.getElementById("exportPanel"), box = document.getElementById("exportBox"),
    note = document.getElementById("exportNote"), copyBtn = document.getElementById("copyBtn");
  function pad(s, n) { while (s.length < n) s += " "; return s; }
  function buildExport() {
    var groups = {}, json = {}, undec = 0, nDec = 0;
    IDS.forEach(function (k) {
      var d = state[k];
      if (!d || !d.fate) { undec++; }
      if (d && (d.fate || d.vis || d.note)) {
        json[k] = { fate: d.fate || null, vis: d.vis || null, note: d.note || "" };
      }
      if (d && d.fate) { nDec++; (groups[d.fate] = groups[d.fate] || []).push(k); }
    });
    var lines = [];
    T.fates.forEach(function (f) {
      var arr = groups[f[0]]; if (!arr) return;
      lines.push("## " + f[0] + " (" + arr.length + ")");
      arr.forEach(function (k) {
        var d = state[k];
        lines.push(pad(f[0], 10) + " " + k + "  [vis: " + (d.vis || "unset") + "]" + (d.note ? "  # " + d.note.replace(/\s+/g, " ") : ""));
      });
      lines.push("");
    });
    var visOnly = IDS.filter(function (k) { var d = state[k]; return d && !d.fate && d.vis && d.vis !== "keep"; });
    if (visOnly.length) {
      lines.push("## visibility-only (fate unset)");
      visOnly.forEach(function (k) { lines.push(pad("-", 10) + " " + k + "  [vis: " + state[k].vis + "]"); });
      lines.push("");
    }
    note.textContent = nDec + " 个已决定去向 · " + undec + " 个未决定（未决定的不会出现在分组里）。下方 JSON 用于执行。";
    return lines.join("\n") + "\n## JSON\n" + JSON.stringify(json, null, 2) + "\n";
  }
  document.getElementById("export").addEventListener("click", function () {
    box.value = buildExport();
    copyBtn.textContent = "复制到剪贴板";
    panel.classList.add("show");
    panel.scrollIntoView({ block: "start" });
  });
  document.getElementById("closeExport").addEventListener("click", function () { panel.classList.remove("show"); });
  copyBtn.addEventListener("click", function () {
    box.focus(); box.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(box.value).then(function () { copyBtn.textContent = "已复制 ✓"; }, function () {});
    } else if (ok) { copyBtn.textContent = "已复制 ✓"; }
  });

  cards.forEach(apply); tally(); refresh();
})();
