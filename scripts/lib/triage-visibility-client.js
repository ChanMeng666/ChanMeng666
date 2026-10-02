(function () {
  "use strict";
  // Client for the visibility triage page (scripts/lib/triage-visibility-page.mjs).
  // State d[key] = {arch, vis, note}; every field starts null (nothing pre-selected).
  var KEY = "triage-visibility-v1";
  var T = window.TRIAGE;
  var META = T.meta, IDS = T.order;
  var AOK = { keep: 1, archive: 1, unarchive: 1 }, VOK = { keep: 1, "private": 1, "public": 1 };
  var state = {};

  function sanitize(k, d) {
    var m = META[k];
    if (!m || !d || typeof d !== "object") return null;
    var arch = AOK[d.arch] ? d.arch : null;
    // only offer what the card offers
    if (arch === "archive" && m.arch) arch = null;
    if (arch === "unarchive" && !m.arch) arch = null;
    var vis = VOK[d.vis] ? d.vis : null;
    if (vis === "private" && (!m.pub || m.blockPriv)) vis = null;
    if (vis === "public" && m.pub) vis = null;
    var note = typeof d.note === "string" ? d.note.slice(0, 400) : "";
    if (!arch && !vis && !note) return null;
    return { arch: arch, vis: vis, note: note };
  }
  try {
    var raw = localStorage.getItem(KEY);
    if (raw) {
      var p = JSON.parse(raw);
      if (p && typeof p === "object") IDS.forEach(function (k) { var s = sanitize(k, p[k]); if (s) state[k] = s; });
    }
  } catch (e) { /* blocked or corrupt storage: start clean */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  var main = document.getElementById("main");
  var cards = Array.prototype.slice.call(main.querySelectorAll(".card"));
  function ensure(k) { return state[k] || (state[k] = { arch: null, vis: null, note: "" }); }

  // Dynamic warnings that depend on what is selected.
  function warnsFor(k) {
    var m = META[k], d = state[k] || {}, out = [];
    if (d.vis === "private" && m.pub) {
      out.push({ red: false, t: "Loses " + m.stars + "★ / " + m.watchers + " watchers; " + m.forks + " public fork(s) detach into their own networks. Not reversible." });
      if (m.links.length) out.push({ red: true, t: "Breaks " + m.links.length + " link source(s): " + m.links.join(", ") + ". Needs a data sync (remove repoUrl)." });
      if (m.pages) out.push({ red: false, t: "Pages " + m.pages + " keeps working only while on GitHub Pro." });
      if (m.npm) out.push({ red: false, t: "npm " + m.npm + ": repository link will 404." });
    }
    if (d.vis === "public" && !m.pub) out.push({ red: false, t: "Run a secret / sensitive-content scan before publishing." });
    if (m.org && (d.vis === "private" || d.vis === "public" || d.arch === "archive" || d.arch === "unarchive")) out.push({ red: false, t: "Org repo: check with the org before changing." });
    if (m.arch && d.vis && d.vis !== "keep") out.push({ red: false, t: "Execution: unarchive, change visibility" + (d.arch === "unarchive" ? "" : ", then re-archive") + "." });
    if (d.arch === "archive" && (m.openPrs || m.openIssues)) out.push({ red: false, t: "Archiving makes " + m.openPrs + " open PR(s) / " + m.openIssues + " issue(s) read-only." });
    if (d.arch === "archive" && m.pub && m.links.length) out.push({ red: false, t: "Archive keeps links working (repo stays visible, read-only)." });
    return out;
  }

  function apply(el) {
    var k = el.dataset.key, d = state[k] || {};
    Array.prototype.forEach.call(el.querySelectorAll('input[data-role="arch"]'), function (r) { r.checked = d.arch === r.value; });
    Array.prototype.forEach.call(el.querySelectorAll('input[data-role="vis"]'), function (r) { r.checked = d.vis === r.value; });
    var n = el.querySelector('[data-role="note"]');
    if (document.activeElement !== n) n.value = d.note || "";
    el.classList.toggle("decided", !!(d.arch || d.vis));
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
    if (role === "arch") ensure(k).arch = e.target.value;
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
    var nA = 0, nU = 0, nP = 0, nPub = 0, undec = 0, lost = 0, links = 0, linkRepos = 0, pages = 0;
    IDS.forEach(function (k) {
      var d = state[k] || {}, m = META[k];
      if (!d.arch && !d.vis) undec++;
      if (d.arch === "archive") nA++;
      if (d.arch === "unarchive") nU++;
      if (d.vis === "public") nPub++;
      if (d.vis === "private") {
        nP++; lost += m.stars;
        if (m.links.length) { links += m.links.length; linkRepos++; }
        if (m.pages) pages++;
      }
    });
    tallyEl.textContent = "";
    function chip(label, n, cls) {
      var s = document.createElement("span"); if (cls) s.className = cls;
      s.appendChild(document.createTextNode(label + " "));
      var b = document.createElement("b"); b.textContent = String(n); s.appendChild(b);
      tallyEl.appendChild(s);
    }
    chip("archive", nA); chip("unarchive", nU); chip("make private", nP); chip("make public", nPub);
    chip("★ lost", lost); chip("links to sync", links + " in " + linkRepos + " repos"); chip("Pages at risk", pages);
    chip("undecided", undec, "undec");
  }

  // ---- filters ----
  var q = document.getElementById("q"), fSect = document.getElementById("fSect"),
    fUndec = document.getElementById("fUndec"), fWarn = document.getElementById("fWarn"), fHint = document.getElementById("fHint");
  function refresh() {
    var term = q.value.trim().toLowerCase();
    cards.forEach(function (el) {
      var d = state[el.dataset.key] || {}, ok = true;
      if (term && el.dataset.hay.indexOf(term) < 0) ok = false;
      if (fSect.value && el.dataset.sect !== fSect.value) ok = false;
      if (fUndec.checked && (d.arch || d.vis)) ok = false;
      if (fWarn.checked && !(+el.dataset.warn > 0)) ok = false;
      if (fHint.checked && el.dataset.hint !== "1") ok = false;
      el.classList.toggle("hidden", !ok);
    });
    Array.prototype.forEach.call(main.querySelectorAll("details.sect[data-sect]"), function (s) {
      var vis = s.querySelectorAll(".card:not(.hidden)").length;
      s.classList.toggle("empty", vis === 0);
      var n = s.querySelector('[data-role="sect-n"]');
      if (n) n.textContent = vis + " / " + s.querySelectorAll(".card").length;
    });
  }
  [q, fSect, fUndec, fWarn, fHint].forEach(function (el) {
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
    var a = 0, v = 0;
    IDS.forEach(function (k) { var d = state[k] || {}; if (!d.arch) a++; if (!d.vis) v++; });
    ask("Fill " + a + " blank archive-state and " + v + " blank visibility controls from the ★ advisory? Anything you already chose stays as is.", function () {
      IDS.forEach(function (k) {
        var m = META[k], d = state[k] || {};
        if (!d.arch) ensure(k).arch = m.ha;
        if (!d.vis) ensure(k).vis = m.hv;
      });
      save(); cards.forEach(apply); tally(); refresh();
    });
  });
  document.getElementById("clearAll").addEventListener("click", function () {
    ask("Clear every choice and note on this page? This cannot be undone.", function () {
      state = {}; save(); cards.forEach(apply); tally(); refresh();
    });
  });

  // ---- export ----
  var panel = document.getElementById("exportPanel"), box = document.getElementById("exportBox"),
    note = document.getElementById("exportNote"), copyBtn = document.getElementById("copyBtn");
  function buildExport() {
    var G = { ARCHIVE: [], UNARCHIVE: [], "MAKE PRIVATE": [], "MAKE PUBLIC": [] }, json = {}, undec = 0;
    IDS.forEach(function (k) {
      var d = state[k];
      if (!d || (!d.arch && !d.vis)) undec++;
      if (!d) return;
      if (d.arch || d.vis || d.note) json[k] = { archive: d.arch || null, vis: d.vis || null, note: d.note || "" };
      var tag = d.note ? "  # " + d.note.replace(/\s+/g, " ") : "";
      if (d.arch === "archive") G.ARCHIVE.push(k + tag);
      if (d.arch === "unarchive") G.UNARCHIVE.push(k + tag);
      if (d.vis === "private") G["MAKE PRIVATE"].push(k + tag);
      if (d.vis === "public") G["MAKE PUBLIC"].push(k + tag);
    });
    var lines = [];
    Object.keys(G).forEach(function (g) {
      if (!G[g].length) return;
      lines.push("## " + g + " (" + G[g].length + ")");
      G[g].forEach(function (x) { lines.push(x); });
      lines.push("");
    });
    var decided = IDS.length - undec;
    note.textContent = decided + " repos with a decision, " + undec + " undecided (not listed). Plain list first, JSON below.";
    return lines.join("\n") + "\n## JSON\n" + JSON.stringify(json, null, 2) + "\n";
  }
  document.getElementById("export").addEventListener("click", function () {
    box.value = buildExport();
    copyBtn.textContent = "Copy to clipboard";
    panel.classList.add("show");
    panel.scrollIntoView({ block: "start" });
  });
  document.getElementById("closeExport").addEventListener("click", function () { panel.classList.remove("show"); });
  copyBtn.addEventListener("click", function () {
    box.focus(); box.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(box.value).then(function () { copyBtn.textContent = "Copied"; }, function () {});
    } else if (ok) { copyBtn.textContent = "Copied"; }
  });

  cards.forEach(apply); tally(); refresh();
})();
