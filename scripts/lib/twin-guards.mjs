// What the chanmeng.org digital twin must never say, computed from the data.
//
// Shared by scripts/build-llms-twin.mjs (which drops the offending sentence,
// bullet or row), scripts/check-llms-twin.mjs (which fails on any hit in
// dist/llms-twin.txt) and scripts/build-voice.mjs (which fails on a hit in
// data/voice.yaml). Rules come from docs/STATE.md § Display rules and
// cv/cover-letter/EVIDENCE.md; the twin decision is logged in docs/LOG.md
// (2026-10-17).
//
// 1. Hidden entries. Every entry of a show-carrying list with `show.site:
//    false` or `show.llms: false` (GenLAB, LYZEN, Seismophone, Chromaflow, the
//    four *-mv projects, the hosted podcasts and the unlaunched concept, the
//    GenLAB film and collaborator, the ArchLang narrated demo), plus the
//    hosted podcasts in meta.x_brand.podcastsHosted and the film collections
//    whose project is hidden. Terms per entry: the id when distinctive, the
//    display name, its head before " — " / " (" , the name without CJK, a
//    client named in `entity`, the host of `url`, the repo of `repoUrl` /
//    `repo`. A term that is also the name of a shown entry is dropped (the
//    LinkedIn newsletter shares its name with a hidden podcast); NARROW_TERMS
//    then supplies what names only the hidden one, as in scripts/lint-kb.mjs.
// 2. Static patterns: contact addresses other than hello@, commit counts and
//    solo or authorship shares, the "professional tone" guideline block,
//    placement / coursework wording, "validated by", She Sharp's unsourced
//    community figures.
// 3. GAVIGO figures: only 78%, 4.45 s → 1.00 s and ~140 ms, each with the
//    boundary note ("controlled", "not a production SLA") in the same
//    paragraph, bullet or table row.

export const SHOW_LISTS = ["projects", "organizations", "collaborators", "films", "work", "volunteer", "awards", "publications", "showcase"];

const CJK = /[　-〿㐀-鿿＀-￯]+/g;
export const hasCjk = (s) => /[㐀-鿿]/.test(String(s ?? ""));

// Same shape as termsFor() in scripts/lint-kb.mjs, plus data-derived extras.
function termsFor(e) {
  const out = [];
  const add = (s, kind) => {
    s = String(s ?? "").replace(/\s+/g, " ").trim().replace(/[\s,;:·—–-]+$/, "");
    if (s.length >= 5 && !out.some((t) => t.term.toLowerCase() === s.toLowerCase())) out.push({ term: s, kind });
  };
  if (e.id && (e.id.includes("-") || e.id.length >= 6)) add(e.id, "id");
  for (const n of [e.name, e.title, e.titleZh, ...(e.aliases ?? [])].filter(Boolean)) {
    add(n, "name");
    const head = String(n).split(/\s+[—–·|]\s+|:\s|\s\(/)[0];
    add(head, "name");
    add(String(n).replace(/\s*\([^)]*[㐀-鿿][^)]*\)/g, "").replace(CJK, " "), "name");
    add(head.replace(CJK, " "), "name");
    for (const m of String(n).matchAll(/[㐀-鿿]{3,}/g)) add(m[0], "name");
    // A brand-like first word ("GenLAB" of "GenLAB Career Academy"). If a shown
    // entry has the same name, hiddenEntries() drops it again.
    const first = head.split(/\s+/)[0];
    if (first !== head && (first.match(/[A-Z]/g) ?? []).length >= 2) add(first, "name");
  }
  if (e.entity) add(String(e.entity).split(/\s\(|\s+[—–]\s+/)[0], "name");
  for (const u of [e.url, e.repoUrl].filter(Boolean)) {
    try {
      const url = new URL(u);
      if (!/(^|\.)(github\.com|spotify\.com|vercel\.app|chanmeng\.org)$/.test(url.hostname)) add(url.hostname.replace(/^www\./, "").split(".")[0], "id");
      if (url.hostname === "github.com") add(url.pathname.split("/")[2], "id");
    } catch { /* not a URL */ }
  }
  if (e.repo) add(String(e.repo).split("/").pop(), "id");
  return out;
}

// Hidden entries whose display name another, shown entry shares (see
// NARROW_TERMS in scripts/lint-kb.mjs; same reason).
const NARROW_TERMS = {
  "publications/decoding-the-future-podcast": [
    { term: "decoding-the-future-podcast", kind: "id" },
    { term: "Decoding the Future podcast", kind: "name" },
    { term: "0PDYYnZhKwV7PdWHeK7nbj", kind: "name" },
  ],
};

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export function termRe({ term, kind }) {
  const w = kind === "id" ? "A-Za-z0-9-" : "A-Za-z0-9";
  const pre = /^[A-Za-z0-9]/.test(term) ? `(?<![${w}])` : "";
  const post = /[A-Za-z0-9]$/.test(term) ? `(?![${w}])` : "";
  return new RegExp(pre + escapeRe(term).replace(/\\? /g, "\\s+") + post, "i");
}

/** Hidden entries and the identifiers that name them. */
export function hiddenEntries(profile) {
  const hidden = [];
  const shownTerms = new Set();
  for (const list of SHOW_LISTS) {
    for (const e of profile[list] ?? []) {
      if (!e) continue;
      const key = `${list}/${e.id ?? e.title ?? e.name}`;
      if (e.show && (e.show.site === false || e.show.llms === false)) hidden.push({ list, key, id: e.id, entry: e });
      else for (const t of termsFor(e)) if (t.kind === "name") shownTerms.add(t.term.toLowerCase());
    }
  }
  const hiddenProjectIds = new Set(hidden.filter((h) => h.list === "projects").map((h) => h.id));
  for (const c of profile.filmCollections ?? []) {
    if (hiddenProjectIds.has(c.projectId)) hidden.push({ list: "filmCollections", key: `filmCollections/${c.id}`, id: c.id, entry: c });
  }
  for (const p of profile.meta?.x_brand?.podcastsHosted ?? []) {
    hidden.push({ list: "podcastsHosted", key: `podcastsHosted/${p.name}`, id: null, entry: { name: p.name, url: p.url } });
  }
  return hidden.map((h) => {
    const terms = NARROW_TERMS[h.key] ?? termsFor(h.entry).filter((t) => !shownTerms.has(t.term.toLowerCase()));
    return { ...h, terms: terms.map((t) => ({ ...t, re: termRe(t) })) };
  });
}

/** Ids the twin must not show, per list. */
export function hiddenIds(profile) {
  const out = {};
  for (const h of hiddenEntries(profile)) if (h.id) (out[h.list] ??= new Set()).add(h.id);
  return out;
}

// Static patterns. Each: [regex, label].
export const STATIC_PATTERNS = [
  [/[\w.+-]+@gmail\.com/i, "a Gmail address"],
  [/[\w.+-]+@(?!chanmeng\.org\b)[\w-]+\.[\w.]+/i, "an email address other than hello@chanmeng.org"],
  [/\b\d[\d,]*\+?\s+(?:[a-z-]+\s+){0,2}commits?\b/i, "a commit count"],
  [/\bcommits?\s*(?:\([^)]*\))?\s*[:=]\s*\d/i, "a commit count"],
  [/\d+(?:\.\d+)?\s*%\s*(?:of\s+)?(?:the\s+|all\s+|my\s+)?(?:non-merge\s+)?(?:commits|lines)\b/i, "a commit or line share"],
  [/\bsolo\s+commits\b/i, "solo commits"],
  [/~?\d+(?:\.\d+)?\s*%\s*solo\b/i, "a solo percentage"],
  [/\bsolo\)?\s*[,(]?\s*~?\d+(?:\.\d+)?\s*%/i, "a solo percentage"],
  [/\bof all lines added\b|\bauthorship share\b/i, "an authorship share"],
  [/\b(?:owned|authored|wrote|contributed)\s+(?:~|about\s+)?\d+(?:\.\d+)?\s*%/i, "an authorship share"],
  [/professional tone/i, "the LLM-consumer tone guideline"],
  [/\bindustry[ -]placement\b/i, "placement wording"],
  // Any "placement", so no CORDE placement framing survives a rewording (it
  // also drops two harmless uses: sponsor placements, relational placement).
  [/\bplacements?\b/i, "placement wording"],
  [/\bCOMP\s?693\b|\bcapstone\b|行业实习/i, "course or placement wording"],
  [/\bcoursework\b/i, "coursework wording"],
  [/\bvalidated by\b/i, "\"validated by\" (programme participation is not validation)"],
  [/3,500\+?\s*members|50\+\s*partners|85%\s*mentorship/i, "an unsourced She Sharp figure"],
  // The twin quotes no money: not Chan's rates, not a client's spend or revenue.
  [/(?:\b(?:NZ|US|A|AU|C|CA|HK|S)\$|(?<![\w$])\$|[¥€£]|\bRMB\s?|\b(?:NZD|USD|AUD|CNY)\s?)\d/i, "a money amount"],
  // No podcast links at all: the hosted shows are discontinued (docs/STATE.md,
  // Podcasts) and the twin also leaves out guest episodes (2026-10-17).
  [/open\.spotify\.com|podcasts\.apple\.com|xiaoyuzhou/i, "a podcast link"],
  // No postal addresses: street number + street type, PO Box, city + postcode.
  [/\b\d{1,5}[A-Za-z]?\s+(?:[A-Z][\w'’-]*\s+){1,3}(?:Road|Rd|Street|St|Avenue|Ave|Drive|Dr|Place|Pl|Lane|Ln|Terrace|Tce|Crescent|Cres|Way|Boulevard|Blvd|Highway|Hwy|Quay|Parade)\b\.?/, "a street address"],
  [/\bP\.?\s?O\.?\s?Box\s+\d+/i, "a PO Box"],
  [/\b(?:Auckland|Wellington|Christchurch|Hamilton|Dunedin|Rolleston|Lincoln|Timaru|Rangiora|Tauranga)\s+(?!19|20)\d{4}\b/, "a postcode"],
];

/** The first forbidden hit in a string, or null. */
export function forbiddenHit(text, hidden, { skipStatic = [] } = {}) {
  const s = String(text ?? "");
  for (const h of hidden) for (const t of h.terms) if (t.re.test(s)) return `${h.key} ("${t.term}")`;
  for (const [re, label] of STATIC_PATTERNS) if (!skipStatic.includes(label) && re.test(s)) return label;
  return null;
}

// GAVIGO figures.
export const GAVIGO_FIGURE = /\b78\s?%|\b4\.45\s?s\b|\b1\.00\s?s\b|(?:~|\babout\s)\s?140\s?ms\b|\b140\s?ms\b/i;
export const GAVIGO_NOTE = (s) => /controlled/i.test(s) && /not a production SLA/i.test(s);
export const GAVIGO_BOUNDARY = "Controlled application-level measurement, not a production SLA.";
// Every number-with-unit in a GAVIGO section must be one of the approved three.
export const GAVIGO_ALLOWED = [/^78\s?%$/, /^4\.45\s?s$/, /^1\.00\s?s$/, /^140\s?ms$/];
export const NUMBER_WITH_UNIT = /\b\d+(?:\.\d+)?\s?(?:%|ms\b|s\b)/g;
