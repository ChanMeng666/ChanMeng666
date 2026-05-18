#!/usr/bin/env node
// Build pipeline: data/profile.yaml -> README.md, llms.txt, llms-full.txt,
// dist/profile.json. The single source of truth is data/profile.yaml.
// Outputs are regenerated on every run — do not edit them by hand.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Handlebars from "handlebars";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Load + validate data
// ---------------------------------------------------------------------------

const yamlPath = path.join(repoRoot, "data", "profile.yaml");
const schemaPath = path.join(repoRoot, "schema", "profile.schema.json");

const data = yaml.load(fs.readFileSync(yamlPath, "utf8"));
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);
if (!validate(data)) {
  console.error("✗ data/profile.yaml failed schema validation. Run `npm run validate` to see details.");
  for (const err of validate.errors ?? []) {
    console.error(`  ${err.instancePath || "(root)"}  ${err.message}`);
  }
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Augment runtime state
// ---------------------------------------------------------------------------

const now = new Date();
const isoDate = now.toISOString().slice(0, 10);   // YYYY-MM-DD
const year = String(now.getUTCFullYear());

data.meta = data.meta ?? {};
data.meta.lastModified = isoDate;
data.meta.buildYear = year;
data.meta.buildTimestamp = now.toISOString();

// Derived index by id for easy lookup in templates
const byId = (arr) => Object.fromEntries((arr ?? []).map((x) => [x.id, x]));
data._index = {
  projects: byId(data.projects),
  work: byId(data.work),
  education: byId(data.education),
};

// Sort projects by priority for stable rendering
const projectsSorted = [...(data.projects ?? [])].sort(
  (a, b) => (a.priority ?? 999) - (b.priority ?? 999),
);

// Compute flagship/open-source partitions
const flagshipIds = data.meta?.x_brand?.flagshipProjectIds ?? [];
data._flagshipProjects = flagshipIds
  .map((id) => data._index.projects[id])
  .filter(Boolean);

const flagshipIdSet = new Set(flagshipIds);
const openSource = projectsSorted.filter((p) => !flagshipIdSet.has(p.id));
data._openSourceProjects = openSource;

// Group flagship projects into pairs for the 2-column table layout.
data._flagshipProjectRows = [];
for (let i = 0; i < data._flagshipProjects.length; i += 2) {
  data._flagshipProjectRows.push(data._flagshipProjects.slice(i, i + 2));
}

const primaryIds = data.meta?.x_brand?.openSourcePrimaryIds ?? [];
data._openSourcePrimary = primaryIds
  .map((id) => data._index.projects[id])
  .filter(Boolean);

// Open-source-by-category for the <details> block, in declared order
const categoryOrder = data.meta?.x_brand?.openSourceCategoryOrder ?? [];
const primaryIdSet = new Set(primaryIds);
const categoriesMap = new Map();
for (const cat of categoryOrder) categoriesMap.set(cat, []);
for (const p of openSource) {
  if (primaryIdSet.has(p.id)) continue;
  if (!p.category) continue;
  if (!categoriesMap.has(p.category)) categoriesMap.set(p.category, []);
  categoriesMap.get(p.category).push(p);
}
data._openSourceByCategory = [...categoriesMap.entries()]
  .filter(([, items]) => items.length > 0)
  .map(([category, items]) => ({ category, items }));

// ---------------------------------------------------------------------------
// Tier/recency partitions: every list-type collection grouped by tier so
// llms.txt can emit only the top tiers and llms-full.txt can stamp each entry
// with a tier badge for LLM consumers.
// ---------------------------------------------------------------------------

const TIERS = ["flagship", "primary", "secondary", "archive"];
const groupByTier = (arr) => {
  const groups = Object.fromEntries(TIERS.map((t) => [t, []]));
  for (const item of arr ?? []) {
    const t = TIERS.includes(item?.tier) ? item.tier : "secondary";
    groups[t].push(item);
  }
  return groups;
};

data._tiered = {
  work: groupByTier(data.work),
  volunteer: groupByTier(data.volunteer),
  education: groupByTier(data.education),
  projects: groupByTier(data.projects),
  awards: groupByTier(data.awards),
  certificates: groupByTier(data.certificates),
  publications: groupByTier(data.publications),
  references: groupByTier(data.references),
};

// flagship + primary = the "must reference" subset surfaced in llms.txt
const topTwo = (g) => [...g.flagship, ...g.primary];
data._top = Object.fromEntries(
  Object.entries(data._tiered).map(([k, g]) => [k, topTwo(g)]),
);

// Certificates by category (issuer)
const certsByCat = new Map();
for (const c of data.certificates ?? []) {
  const k = c.category ?? "other";
  if (!certsByCat.has(k)) certsByCat.set(k, []);
  certsByCat.get(k).push(c);
}
data._certsByCategory = ["hackerrank", "microsoft", "other"]
  .filter((k) => certsByCat.has(k))
  .map((k) => ({
    category: k,
    label:
      k === "hackerrank"
        ? "HackerRank Professional Certifications"
        : k === "microsoft"
          ? "Microsoft Career Certifications"
          : "Other Professional Certifications",
    items: certsByCat.get(k),
  }));

// Featured testimonials (3 visible, rest in collapsible)
data._featuredReferences = (data.references ?? []).filter(
  (r) => r.meta?.x_brand?.featured,
);
data._otherReferences = (data.references ?? []).filter(
  (r) => !r.meta?.x_brand?.featured,
);

// JSON-LD identifier
data._jsonldIdentifier = data.meta?.x_brand?.identifier ?? data.basics?.url ?? "";

// Primary social profile lookup for hero/footer badges
const profileByNetwork = new Map();
for (const p of data.basics?.profiles ?? []) {
  if (!profileByNetwork.has(p.network)) profileByNetwork.set(p.network, p);
}
data._primaryBadges = (data.meta?.x_brand?.primarySocialBadges ?? []).map(
  (n) => ({ network: n, url: profileByNetwork.get(n)?.url ?? "" }),
);

// All sameAs URLs for JSON-LD (basics.profiles + meta.x_brand.additionalSameAs)
const sameAsSet = new Set();
for (const p of data.basics?.profiles ?? []) {
  if (p.url && !p.url.startsWith("mailto:")) sameAsSet.add(p.url);
}
for (const u of data.meta?.x_brand?.additionalSameAs ?? []) sameAsSet.add(u);
data._sameAs = [...sameAsSet];

// Current roles (no endDate) — surfaced in llms.txt and JSON-LD worksFor[]
data._currentRoles = (data.work ?? []).filter(
  (w) => w.endDate == null || w.endDate === "" || w.endDate === "present",
);
data._pastRoles = (data.work ?? []).filter(
  (w) => w.endDate != null && w.endDate !== "" && w.endDate !== "present",
);

// Flat (single-line) form of basics.summary for use inside JSON-LD and similar
// inline-string contexts where multi-line YAML blocks would break formatting.
const flatten = (s) =>
  String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();
data._basicsSummaryFlat = flatten(data.basics?.summary);

// Pre-built JSON-LD objects — stringify here so we never template-build JSON
// (which is fragile with quotes and newlines in the content).
data._jsonldProfilePage = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  dateModified: `${isoDate}T00:00:00+00:00`,
  mainEntity: {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": data._jsonldIdentifier,
    identifier: data._jsonldIdentifier,
    name: data.basics?.name,
    alternateName: data.basics?.alternateName,
    jobTitle: data.basics?.label,
    description: data._basicsSummaryFlat,
    url: data.basics?.url,
    email: data.basics?.email,
    sameAs: data._sameAs,
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      name: "Resume / CV",
      url: "https://github.com/ChanMeng666/ChanMeng666/raw/main/public/chan-meng-cv.pdf",
    },
    knowsAbout: (data.skills ?? []).flatMap((s) => s.keywords ?? []),
    alumniOf: (data.education ?? []).map((e) => ({
      "@type": "CollegeOrUniversity",
      name: e.institution,
      ...(e.url ? { url: e.url } : {}),
    })),
    worksFor: data._currentRoles.map((w) => ({
      "@type": "Organization",
      name: w.name,
      ...(w.url ? { url: w.url } : {}),
      jobTitle: w.position,
    })),
    hasOccupation: {
      "@type": "Occupation",
      name: data.basics?.label,
    },
  },
};

data._jsonldItemList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `${data.basics?.name}'s Flagship Projects`,
  dateModified: `${isoDate}T00:00:00+00:00`,
  itemListElement: data._flagshipProjects.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "SoftwareApplication",
      name: p.name,
      description: flatten(p.publicSummary),
      url: p.url ?? p.repoUrl,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
    },
  })),
};

data._jsonldProfilePagePretty = JSON.stringify(data._jsonldProfilePage, null, 2);
data._jsonldItemListPretty = JSON.stringify(data._jsonldItemList, null, 2);

// ---------------------------------------------------------------------------
// Handlebars setup
// ---------------------------------------------------------------------------

Handlebars.registerHelper("urlencode", (s) => encodeURIComponent(s ?? ""));
Handlebars.registerHelper("eq", (a, b) => a === b);
Handlebars.registerHelper("neq", (a, b) => a !== b);
Handlebars.registerHelper("isPresent", (v) => v == null || v === "" || v === "present");
Handlebars.registerHelper("default", (a, b) => (a != null && a !== "" ? a : b));
Handlebars.registerHelper("add", (a, b) => Number(a) + Number(b));
Handlebars.registerHelper("subtract", (a, b) => Number(a) - Number(b));
Handlebars.registerHelper("inc", (a) => Number(a) + 1);
Handlebars.registerHelper("mod", (a, b) => Number(a) % Number(b));
Handlebars.registerHelper("join", (arr, sep) =>
  Array.isArray(arr) ? arr.join(sep ?? ", ") : "",
);
Handlebars.registerHelper("pillsParam", (arr) =>
  Array.isArray(arr) ? encodeURIComponent(arr.join(" | ")) : "",
);
const fmtDate = (d) => {
  if (!d) return "";
  const s = String(d);
  if (/^\d{4}-\d{2}/.test(s)) {
    const [y, m] = s.split("-");
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const mi = parseInt(m, 10) - 1;
    return `${months[mi] ?? m} ${y}`;
  }
  return s;
};
Handlebars.registerHelper("formatDate", (d) => fmtDate(d));
Handlebars.registerHelper("dateRange", (start, end) => {
  const a = fmtDate(start);
  const b = end ? fmtDate(end) : "Present";
  return a ? `${a} -- ${b}` : b;
});
Handlebars.registerHelper("hasNarrative", (n) =>
  !!(
    n &&
    (n.problem ||
      n.audience ||
      n.productLogic ||
      n.businessLogic ||
      n.technicalApproach ||
      n.outcomes ||
      n.myRole ||
      n.companyContext ||
      n.mission ||
      n.myMandate ||
      n.impactDelivered ||
      n.technicalHighlights)
  ),
);
Handlebars.registerHelper("trim", (s) => String(s ?? "").trim());
Handlebars.registerHelper("flatten", (s) => String(s ?? "").replace(/\s+/g, " ").trim());
Handlebars.registerHelper("split", (s, sep) => String(s ?? "").split(sep));
Handlebars.registerHelper("upper", (s) => String(s ?? "").toUpperCase());
Handlebars.registerHelper("json", (v) => JSON.stringify(v));
Handlebars.registerHelper("year", () => year);

// Render a single-line LLM-readable metadata badge for any entry that carries
// tier/recency/lastUpdated. Outputs e.g. `[tier=flagship · recency=active · updated=2026-05-15]`.
// Empty string if the entry carries none of these fields.
Handlebars.registerHelper("tierBadge", (item) => {
  if (!item || typeof item !== "object") return "";
  const parts = [];
  if (item.tier) parts.push(`tier=${item.tier}`);
  if (item.recency) parts.push(`recency=${item.recency}`);
  if (item.lastUpdated) parts.push(`updated=${item.lastUpdated}`);
  return parts.length ? `[${parts.join(" · ")}]` : "";
});

// Logical OR for templates (Handlebars has no builtin `or`/`and`).
Handlebars.registerHelper("or", function (...args) {
  // Last arg is the Handlebars options object.
  const vals = args.slice(0, -1);
  return vals.some(Boolean);
});

// Resolve repo-relative image paths into absolute /-rooted GitHub paths.
// (Templates use the helper for clarity; the data already uses /-rooted paths.)
Handlebars.registerHelper("asset", (p) => p);

// Extract `owner/repo` from a github.com URL — used for shields.io badge URLs.
Handlebars.registerHelper("repoPath", (url) => {
  if (!url) return "";
  const m = String(url).match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git|\/|$)/);
  return m ? `${m[1]}/${m[2]}` : "";
});

// Register partials
const partialsDir = path.join(repoRoot, "templates", "partials");
if (fs.existsSync(partialsDir)) {
  for (const f of fs.readdirSync(partialsDir)) {
    if (f.endsWith(".hbs")) {
      const name = f.replace(/\.hbs$/, "");
      const src = fs.readFileSync(path.join(partialsDir, f), "utf8");
      Handlebars.registerPartial(name, src);
    }
  }
}

// ---------------------------------------------------------------------------
// Render each output
// ---------------------------------------------------------------------------

function render(templateName) {
  const src = fs.readFileSync(
    path.join(repoRoot, "templates", `${templateName}.hbs`),
    "utf8",
  );
  const tpl = Handlebars.compile(src, { noEscape: true });
  return tpl(data);
}

const readme = render("README.md");
fs.writeFileSync(path.join(repoRoot, "README.md"), readme);
console.log(`✓ Wrote README.md          (${readme.length} bytes)`);

const llms = render("llms.txt");
fs.writeFileSync(path.join(repoRoot, "llms.txt"), llms);
console.log(`✓ Wrote llms.txt           (${llms.length} bytes)`);

const llmsFull = render("llms-full.txt");
fs.writeFileSync(path.join(repoRoot, "llms-full.txt"), llmsFull);
console.log(`✓ Wrote llms-full.txt      (${llmsFull.length} bytes)`);

// ---------------------------------------------------------------------------
// dist/profile.json — canonical JSON Resume artifact for external consumers
// (strip meta.x_brand and our `_*` derived caches)
// ---------------------------------------------------------------------------

const distDir = path.join(repoRoot, "dist");
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

const canonical = JSON.parse(JSON.stringify(data));
// strip derived caches
for (const k of Object.keys(canonical)) {
  if (k.startsWith("_")) delete canonical[k];
}
// strip meta.x_brand (non-standard extension)
if (canonical.meta) {
  const { x_brand, ...rest } = canonical.meta;
  canonical.meta = rest;
}
// strip our taglines extension on basics for cleaner JSON Resume conformance
if (canonical.basics?.taglines) {
  delete canonical.basics.taglines;
}

fs.writeFileSync(
  path.join(distDir, "profile.json"),
  JSON.stringify(canonical, null, 2) + "\n",
);
console.log(`✓ Wrote dist/profile.json  (canonical JSON Resume artifact)`);

console.log(`\nBuild OK · lastModified=${isoDate}`);
