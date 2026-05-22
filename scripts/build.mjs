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
  volunteer: byId(data.volunteer),
  education: byId(data.education),
  collaborators: byId(data.collaborators),
};

// ---------------------------------------------------------------------------
// Collaborator cross-reference validation + privacy scrub
// (collaborators[] is the entity-graph index that drives JSON-LD Person.knows[])
// ---------------------------------------------------------------------------

const orgRoster = data.organizations ?? data.meta?.x_brand?.organisations ?? [];
const orgIds = new Set(orgRoster.map((o) => o.id));
const workIds = new Set((data.work ?? []).map((w) => w.id));
const volunteerIds = new Set((data.volunteer ?? []).map((v) => v.id));
const projectIds = new Set((data.projects ?? []).map((p) => p.id));

const xrefWarnings = [];
for (const c of data.collaborators ?? []) {
  if (c.currentOrgId && !orgIds.has(c.currentOrgId)) {
    xrefWarnings.push(`collaborator '${c.id}'.currentOrgId='${c.currentOrgId}' not in organisations roster`);
  }
  for (const w of c.worksTogether ?? []) {
    const pool = w.contextType === "project" ? projectIds
               : w.contextType === "work" ? workIds
               : w.contextType === "volunteer" ? volunteerIds
               : null;
    if (pool && !pool.has(w.contextId)) {
      xrefWarnings.push(`collaborator '${c.id}'.worksTogether[].contextId='${w.contextId}' not in ${w.contextType}[]`);
    }
  }
  // Privacy scrub — strip private contact from every rendered surface.
  if (c.meta?.x_brand?.privateContact) {
    delete c.meta.x_brand.privateContact;
  }
}
if (xrefWarnings.length) {
  console.warn("⚠ collaborator cross-reference warnings:");
  for (const w of xrefWarnings) console.warn(`  ${w}`);
}

// Derived caches: visible (publicListing !== false) and tier-filtered slices.
const visibleCollaborators = (data.collaborators ?? []).filter((c) => c.publicListing !== false);
data._collaboratorsFlagshipPrimary = visibleCollaborators.filter(
  (c) => c.tier === "flagship" || c.tier === "primary",
);
data._collaboratorsAll = visibleCollaborators;

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

// ---------------------------------------------------------------------------
// README v2 — provenance-based project buckets resolved from meta.x_brand
// editorial ID lists. Each visible project appears in exactly one bucket.
// Archive-tier projects stay in data + JSON-LD + llms-full.txt but are
// excluded from these visible buckets.
// ---------------------------------------------------------------------------

const resolveIds = (ids) =>
  (ids ?? []).map((id) => data._index.projects[id]).filter(Boolean);

data._commissionedProjects     = resolveIds(data.meta?.x_brand?.commissionedProjectIds);
data._aiAgentProjects          = resolveIds(data.meta?.x_brand?.aiAgentProjectIds);
data._openSourceCraftProjects  = resolveIds(data.meta?.x_brand?.openSourceCraftProjectIds);

data._moreProjectsByGroup = [
  { heading: "More AI agents & tools",     items: resolveIds(data.meta?.x_brand?.moreAiAgentProjectIds) },
  { heading: "More open-source products",  items: resolveIds(data.meta?.x_brand?.moreOpenSourceProjectIds) },
  { heading: "More commissioned work",     items: resolveIds(data.meta?.x_brand?.moreCommissionedProjectIds) },
  { heading: "Creative & experiments",     items: resolveIds(data.meta?.x_brand?.moreCreativeProjectIds) },
].filter((g) => g.items.length > 0);

// Legacy openSourcePrimaryIds is retained for backwards-compat consumers but
// is no longer rendered by the v2 templates.
const primaryIds = data.meta?.x_brand?.openSourcePrimaryIds ?? [];
data._openSourcePrimary = resolveIds(primaryIds);

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

// Certificates by category (issuer) — drop tier=archive (HackerRank pile) from
// the visible grid; they remain in llms-full.txt + dist/profile.json + JSON-LD.
// Tier=flagship certs surface above the <details> grid as anchor credentials.
data._certsFlagship = (data.certificates ?? []).filter((c) => c.tier === "flagship");

const certsByCat = new Map();
for (const c of data.certificates ?? []) {
  if (c.tier === "archive") continue;          // HackerRank pile — text-only mention
  if (c.tier === "flagship") continue;         // surfaced separately above the grid
  const k = c.category ?? "other";
  if (!certsByCat.has(k)) certsByCat.set(k, []);
  certsByCat.get(k).push(c);
}
data._certsByCategory = ["microsoft", "other", "hackerrank"]
  .filter((k) => certsByCat.has(k))
  .map((k) => ({
    category: k,
    label:
      k === "hackerrank"
        ? "HackerRank Professional Certifications"
        : k === "microsoft"
          ? "Microsoft Career Essentials"
          : "Other Professional Certifications",
    items: certsByCat.get(k),
  }));

// Media Appearances — only third-party press / interviews / podcast episodes
// where Chan is the subject. Drops the ~20 LinkedIn Pulse articles (covered by
// the Medium widget), the 4 podcastShow entries (rendered separately as
// "Podcasts I Host"), and the 2 newsletter entries.
data._mediaAppearances = (data.publications ?? []).filter((p) => {
  const type = p?.meta?.x_brand?.type;
  return type === "press" || type === "interview" || type === "podcastEpisode";
});

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

// Editorial subset of _currentRoles for the README "Currently" section.
// Limit to flagship + primary tiers so the section stays calm; the full
// current-roles list still surfaces in llms.txt and JSON-LD worksFor[].
const CURRENTLY_TIERS = new Set(["flagship", "primary"]);
data._currentRolesFeatured = data._currentRoles.filter(
  (w) => CURRENTLY_TIERS.has(w.tier),
).slice(0, 4);

// Flat (single-line) form of basics.summary for use inside JSON-LD and similar
// inline-string contexts where multi-line YAML blocks would break formatting.
const flatten = (s) =>
  String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();
data._basicsSummaryFlat = flatten(data.basics?.summary);

// ---------------------------------------------------------------------------
// Personal-brand showcase: value proposition, engagement roles, availability,
// FAQ, organisations (trusted-by band), teaching cohorts (AI Mentor section).
// All derived from meta.x_brand additions; null-safe so partials render
// gracefully when a block is absent.
// ---------------------------------------------------------------------------

data._valueProposition = data.meta?.x_brand?.valueProposition ?? null;

const engagementRoles = data.meta?.x_brand?.engagementRoles ?? [];
data._engagementRoles = {
  all: engagementRoles,
  firstRow: engagementRoles.slice(0, 2),
  secondRow: engagementRoles.slice(2, 4),
};

data._engagementAvailability = data.meta?.x_brand?.engagementAvailability ?? null;
data._faq = data.meta?.x_brand?.faq ?? [];

// Organisations: split by displayTier; entries whose logoLight file doesn't
// exist on disk are filtered out of the rendered band but still surface in
// llms.txt / llms-full.txt and in `_organisationsMissingLogos` (a sourcing
// to-do list printed during build for transparency).
//
// Source-of-truth moved from meta.x_brand.organisations (display-only roster)
// to top-level data.organizations[] (full Organization entity records). The
// legacy roster is still accepted as fallback during the migration window.
// We project each top-level entry into the legacy roster shape here so the
// downstream caches (_orgByWorkId etc.) and existing templates work unchanged.
const sourceOrgs = data.organizations ?? data.meta?.x_brand?.organisations ?? [];
const allOrgs = sourceOrgs.map((o) => ({
  id: o.id,
  name: o.name,
  url: o.url,
  logoLight: o.logo ?? o.logoLight ?? null,
  logoDark:  o.logoDark ?? o.logo ?? o.logoLight ?? null,
  displayTier:        o.meta?.x_brand?.displayTier        ?? o.displayTier        ?? (o.tier === "secondary" ? "secondary" : "primary"),
  category:           o.meta?.x_brand?.category           ?? o.category           ?? "employer",
  context:            o.meta?.x_brand?.context            ?? o.context            ?? (o.description ? String(o.description).split("\n")[0] : ""),
  relatedWorkId:      o.meta?.x_brand?.relatedWorkId      ?? o.relatedWorkId      ?? null,
  relatedVolunteerId: o.meta?.x_brand?.relatedVolunteerId ?? o.relatedVolunteerId ?? null,
  relatedProjectId:   o.meta?.x_brand?.relatedProjectId   ?? o.relatedProjectId   ?? null,
  // Carry the enriched record through for JSON-LD Organization emission.
  _enriched: o,
}));
const orgHasRenderableLogo = (o) => {
  if (!o?.logoLight) return false;
  const rel = String(o.logoLight).replace(/^\/+/, "");
  return fs.existsSync(path.join(repoRoot, rel));
};
const orgsRenderable = allOrgs.filter(orgHasRenderableLogo);
data._organisationsAll = allOrgs;
data._organisationsPrimary = orgsRenderable.filter((o) => o.displayTier === "primary");
data._organisationsSecondary = orgsRenderable.filter((o) => o.displayTier === "secondary");
data._organisationsByTier = {
  primary: allOrgs.filter((o) => o.displayTier === "primary"),
  secondary: allOrgs.filter((o) => o.displayTier === "secondary"),
};
data._organisationsMissingLogos = allOrgs
  .filter((o) => !orgHasRenderableLogo(o))
  .map((o) => ({ id: o.id, name: o.name, expectedPath: o.logoLight ?? "(none specified)" }));

// Inverse lookups: org-by-{id, workId, volunteerId, projectId}. Only orgs whose
// logo file exists on disk are surfaced — partials that show inline logos use
// these to decide whether to render an <img>. Orgs without renderable logos
// still appear in llms.txt / JSON-LD `affiliation` for AI ingestion.
data._orgById = Object.fromEntries(orgsRenderable.map((o) => [o.id, o]));
data._orgByWorkId = {};
data._orgByVolunteerId = {};
data._orgByProjectId = {};
for (const o of orgsRenderable) {
  if (o.relatedWorkId)      data._orgByWorkId[o.relatedWorkId] = o;
  if (o.relatedVolunteerId) data._orgByVolunteerId[o.relatedVolunteerId] = o;
  if (o.relatedProjectId)   data._orgByProjectId[o.relatedProjectId] = o;
}

if (data._organisationsMissingLogos.length) {
  console.warn(
    `\n⚠ ${data._organisationsMissingLogos.length} organisations have no renderable logo yet — band will skip them until logo files land:`,
  );
  for (const o of data._organisationsMissingLogos) {
    console.warn(`    ${o.id.padEnd(32)} ${o.name}  ← ${o.expectedPath}`);
  }
}

// ---------------------------------------------------------------------------
// Logo-hierarchy resolver — attach to each visible project:
//   _featuredStackResolved : tech-stack mini-icons (18px in templates)
//   _contextLogo           : array of IP / platform context logos (22px)
//   _affiliationOrg        : commissioning-org logo (22px) from existing lookup
// Each tier gracefully skips entries whose underlying file is missing on disk,
// so the build never fails because a tech-logo SVG hasn't landed yet.
// ---------------------------------------------------------------------------

const techIconMap = data.meta?.x_brand?.techIconMap ?? {};
const missingTechLogos = new Set();
const fileExistsCache = new Map();
const fileExists = (relPath) => {
  if (!relPath) return false;
  if (fileExistsCache.has(relPath)) return fileExistsCache.get(relPath);
  const ok = fs.existsSync(path.join(repoRoot, String(relPath).replace(/^\/+/, "")));
  fileExistsCache.set(relPath, ok);
  return ok;
};
const resolveStack = (names) =>
  (names ?? [])
    .map((name) => {
      const src = techIconMap[name];
      if (!src) { missingTechLogos.add(name); return null; }
      if (!fileExists(src)) { missingTechLogos.add(name); return null; }
      return { name, src };
    })
    .filter(Boolean)
    .slice(0, 5);    // cap at 5 — keeps rows visually quiet

const normalizeContextLogo = (raw) => {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.filter((c) => c?.src && fileExists(c.src));
};

const visibleProjects = [
  ...data._flagshipProjects,
  ...data._commissionedProjects,
  ...data._aiAgentProjects,
  ...data._openSourceCraftProjects,
];
for (const p of visibleProjects) {
  const xb = p?.meta?.x_brand ?? {};
  p._featuredStackResolved = resolveStack(xb.featuredStack);
  p._contextLogo           = normalizeContextLogo(xb.contextLogo);
  p._affiliationOrg        = data._orgByProjectId[p.id] ?? null;
}

if (missingTechLogos.size) {
  console.warn(
    `\n⚠ ${missingTechLogos.size} tech-stack logo files are missing — featured-stack icons will skip them until logos land in public/tech-logos/:`,
  );
  for (const name of [...missingTechLogos].sort()) {
    console.warn(`    ${name.padEnd(24)} ← ${techIconMap[name] ?? "(no entry in techIconMap)"}`);
  }
}

data._teachingCohorts = (data.meta?.x_brand?.teachingCohorts ?? []).map((c) => ({
  ...c,
  // Resolve partnerOrgIds to renderable org objects (skipping ones without a
  // logo file on disk) so the cohort card can iterate inline logos directly.
  _partnerOrgs: (c.partnerOrgIds ?? [])
    .map((id) => data._orgById[id])
    .filter(Boolean),
}));
data._teachingImpact = data.meta?.x_brand?.teachingImpact ?? null;
// 2×2 grid rows for the AI Mentor partial
data._teachingCohortRows = [];
for (let i = 0; i < data._teachingCohorts.length; i += 2) {
  data._teachingCohortRows.push(data._teachingCohorts.slice(i, i + 2));
}

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
    hasCredential: [
      {
        "@type": "EducationalOccupationalCredential",
        name: "Resume / CV",
        url: "https://github.com/ChanMeng666/ChanMeng666/raw/main/public/chan-meng-cv.pdf",
      },
      ...(data.certificates ?? [])
        .filter((c) => (c.tier === "flagship" || c.tier === "primary") && c.url)
        .map((c) => ({
          "@type": "EducationalOccupationalCredential",
          name: c.name,
          ...(c.credentialId ? { credentialId: c.credentialId } : {}),
          credentialCategory: "certificate",
          url: c.url,
          recognizedBy: {
            "@type": "Organization",
            name: c.issuer,
          },
          ...(c.date ? { datePublished: c.date } : {}),
        })),
    ],
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
    affiliation: data._organisationsByTier.primary.map((o) => {
      const e = o._enriched ?? {};
      const sameAs = (e.sameAs ?? []).filter(Boolean);
      const desc = e.description ? String(e.description).replace(/\s+/g, " ").trim() : o.context;
      return {
        "@type": "Organization",
        ...(sameAs[0] ? { "@id": sameAs[0] } : {}),
        name: o.name,
        url: o.url,
        ...(o.logoLight ? { logo: `https://github.com/ChanMeng666/ChanMeng666/raw/main${o.logoLight}` } : {}),
        ...(desc ? { description: desc } : {}),
        ...(sameAs.length ? { sameAs } : {}),
        ...(e.founded ? { foundingDate: String(e.founded) } : {}),
        ...(e.hq?.city || e.hq?.countryCode ? {
          location: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              ...(e.hq?.city ? { addressLocality: e.hq.city } : {}),
              ...(e.hq?.region ? { addressRegion: e.hq.region } : {}),
              ...(e.hq?.countryCode ? { addressCountry: e.hq.countryCode } : {}),
            },
          },
        } : {}),
      };
    }),
    knows: data._collaboratorsFlagshipPrimary.map((c) => {
      const orgEntry = c.currentOrgId ? orgRoster.find((o) => o.id === c.currentOrgId) : null;
      const sameAs = [c.linkedin, c.github, c.website, ...(c.sameAs ?? [])].filter(Boolean);
      return {
        "@type": "Person",
        ...(c.linkedin ? { "@id": c.linkedin } : {}),
        name: c.name,
        ...(c.currentTitle ? { jobTitle: c.currentTitle } : {}),
        ...(c.linkedin ? { url: c.linkedin } : {}),
        ...(sameAs.length ? { sameAs } : {}),
        ...(orgEntry ? {
          worksFor: {
            "@type": "Organization",
            ...(orgEntry.sameAs?.[0] ? { "@id": orgEntry.sameAs[0] } : {}),
            name: orgEntry.name,
            url: orgEntry.url,
            ...(orgEntry.sameAs?.length ? { sameAs: orgEntry.sameAs } : {}),
          },
        } : {}),
        ...(c.note ? { description: c.note } : {}),
      };
    }),
    hasOccupation: [
      {
        "@type": "Occupation",
        name: data.basics?.label,
      },
      {
        "@type": "Occupation",
        name: "AI Programming Educator",
        description: data._valueProposition?.tagline ?? "Lead instructor for AI-programming cohorts.",
        occupationLocation: [
          { "@type": "Country", name: "New Zealand" },
          { "@type": "Country", name: "Canada" },
          { "@type": "Country", name: "China" },
        ],
        educationRequirements: "https://programming.chanmeng.org",
      },
    ],
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

// ---------------------------------------------------------------------------
// Additional JSON-LD for the personal-brand showcase frame:
//   - Services (4 engagement role archetypes Chan offers)
//   - FAQPage (5 employer-facing Q&A pairs — highest-leverage GEO surface)
//   - Cohort ItemList (4 AI-programming cohorts as EducationalOccupationalProgram)
// All three reference back to the Person via @id so crawlers can stitch the graph.
// ---------------------------------------------------------------------------

data._jsonldServices = (data._engagementRoles.all ?? []).map((role) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${data._jsonldIdentifier}#service-${role.id}`,
  serviceType: role.title,
  name: role.title,
  description: role.scope,
  termsOfService: role.format,
  areaServed: "Worldwide",
  provider: {
    "@type": "Person",
    "@id": data._jsonldIdentifier,
    name: data.basics?.name,
  },
}));

data._jsonldFAQPage = data._faq.length
  ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: data._faq.map((qa) => ({
        "@type": "Question",
        name: qa.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: qa.answer,
        },
      })),
    }
  : null;

data._jsonldCohortItemList = data._teachingCohorts.length
  ? {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${data.basics?.name}'s AI Programming Cohorts Taught`,
      dateModified: `${isoDate}T00:00:00+00:00`,
      itemListElement: data._teachingCohorts.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "EducationalOccupationalProgram",
          name: c.programName,
          description: `${c.cohortLabel} · ${c.audience} · ${c.format}`,
          provider: {
            "@type": "Organization",
            name: c.partnerOrg,
          },
          educationalLevel: "Adult / Professional",
          url: c.curriculumUrl,
          startDate: c.dateRange,
        },
      })),
    }
  : null;

data._jsonldProfilePagePretty = JSON.stringify(data._jsonldProfilePage, null, 2);
data._jsonldItemListPretty = JSON.stringify(data._jsonldItemList, null, 2);
data._jsonldServicesPretty = data._jsonldServices.map((s) => JSON.stringify(s, null, 2));
data._jsonldFAQPagePretty = data._jsonldFAQPage ? JSON.stringify(data._jsonldFAQPage, null, 2) : "";
data._jsonldCohortItemListPretty = data._jsonldCohortItemList ? JSON.stringify(data._jsonldCohortItemList, null, 2) : "";

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
Handlebars.registerHelper("slice", (arr, start, end) =>
  Array.isArray(arr) ? arr.slice(Number(start) || 0, Number(end) || arr.length) : [],
);

// Brief one-line tagline for tight table cells. Falls back through:
//   1. text before the first " — " (em-dash) -- typical natural break point
//   2. text before the first ". " (sentence boundary)
//   3. character truncation at ~160 chars on a word boundary
// Used by the Open Source primary table where every row must stay scannable.
Handlebars.registerHelper("briefTagline", (s) => {
  const raw = String(s ?? "").replace(/\s+/g, " ").trim();
  if (!raw) return "";
  // Split on em-dash, en-dash, or hyphen surrounded by spaces.
  const dashSplit = raw.split(/\s+[—–-]\s+/);
  let first = dashSplit[0];
  // If first segment is still huge, take first sentence.
  if (first.length > 200) {
    const sentSplit = first.split(/(?<=[.!?])\s+/);
    first = sentSplit[0];
  }
  // Final hard cap on length, on word boundary.
  if (first.length > 200) {
    const cut = first.substring(0, 200);
    const lastSpace = cut.lastIndexOf(" ");
    first = (lastSpace > 120 ? cut.substring(0, lastSpace) : cut) + "…";
  }
  return first;
});
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
