#!/usr/bin/env node
// Staleness budget / review-SLA checker for the profile data.
//
// Schema validation proves the data is WELL-FORMED; nothing proves it is still
// TRUE. Hand-typed facts (roles, outcomes, impact prose) drift silently. This
// check turns `lastUpdated` from a decorative field into an enforced review
// cadence: every entry must have been deliberately reviewed within its tier's
// budget. Bump `lastUpdated` only via `npm run reviewed -- <section.key>`
// after actually re-reading the entry — that's the whole point.
//
// Finding classes:
//   LOGIC ERRORS (always exit 1 — deterministic, not time-flaky):
//     - work/volunteer entry that is current (endDate null/present) but
//       recency is not "active"
//     - recency "active" but endDate is a past date
//     - flagship/primary entry with no lastUpdated at all
//   OVERDUE (lastUpdated older than the tier budget):
//     - flagship-or-active entries: exit 1 under --strict (PR gate), else warn
//     - everything else: warning + listed in the review queue
//
// Budgets (months): flagship 3, primary 6, secondary 12, archive exempt.
// Any recency:"active" entry is capped at 3 regardless of tier.
//
// Usage:
//   node scripts/check-freshness.mjs               # report; exit 1 on logic errors
//   node scripts/check-freshness.mjs --strict      # also exit 1 on flagship/active overdue
//   node scripts/check-freshness.mjs --format=md   # markdown (for the review-queue issue)

import { loadProfileWithProvenance, shardForInstancePath } from "./lib/load-profile.mjs";

const STRICT = process.argv.includes("--strict");
const MD = process.argv.includes("--format=md");

const TIER_BUDGET_MONTHS = { flagship: 3, primary: 6, secondary: 12, archive: null };
const ACTIVE_CAP_MONTHS = 3;

const SECTIONS = [
  "work", "volunteer", "projects", "education", "awards",
  "certificates", "publications", "domains", "references",
  "openSourceContributions", "events",
];

const { data, provenance } = loadProfileWithProvenance();

const today = new Date();
const keyOf = (e) => e.id ?? e.name ?? e.title ?? e.awarder ?? "(unkeyed)";

function parseLoose(d) {
  if (d == null || d === "" || d === "present") return null;
  const m = String(d).match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/);
  if (!m) return null;
  return new Date(Date.UTC(Number(m[1]), m[2] ? Number(m[2]) - 1 : 0, m[3] ? Number(m[3]) : 1));
}
function addMonths(date, months) {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}
const daysBetween = (a, b) => Math.floor((b - a) / 86_400_000);

const logicErrors = [];   // strings
const overdue = [];       // { ref, shard, tier, recency, lastUpdated, budget, overdueDays, gate }

for (const section of SECTIONS) {
  const entries = data[section];
  if (!Array.isArray(entries)) continue;
  entries.forEach((e, idx) => {
    if (e == null || typeof e !== "object") return;
    const ref = `${section}.${keyOf(e)}`;
    const shard = shardForInstancePath(provenance, `/${section}/${idx}`) ?? "?";
    const tier = e.tier ?? null;
    const recency = e.recency ?? null;

    // --- logic errors ---
    const isCurrent =
      ("endDate" in e) && (e.endDate === null || e.endDate === "" || e.endDate === "present");
    if ((section === "work" || section === "volunteer") && isCurrent && recency && recency !== "active") {
      logicErrors.push(`${ref} [${shard}]: endDate says current role but recency is "${recency}" (expected "active").`);
    }
    const end = parseLoose(e.endDate);
    if (recency === "active" && end && end < today) {
      logicErrors.push(`${ref} [${shard}]: recency "active" but endDate ${e.endDate} is in the past.`);
    }
    if ((tier === "flagship" || tier === "primary") && !e.lastUpdated) {
      logicErrors.push(`${ref} [${shard}]: tier "${tier}" entry has no lastUpdated — add one via \`npm run reviewed -- "${ref}" --apply\` after reviewing it.`);
    }

    // --- time budget ---
    let budget = tier ? TIER_BUDGET_MONTHS[tier] : null;
    if (recency === "active") budget = budget == null ? ACTIVE_CAP_MONTHS : Math.min(budget, ACTIVE_CAP_MONTHS);
    if (budget == null) return;
    const lu = parseLoose(e.lastUpdated);
    if (!lu) return; // missing lastUpdated on flagship/primary already reported above
    const due = addMonths(lu, budget);
    if (due < today) {
      overdue.push({
        ref, shard, tier: tier ?? "—", recency: recency ?? "—",
        lastUpdated: String(e.lastUpdated), budget: `${budget}mo`,
        overdueDays: daysBetween(due, today),
        gate: tier === "flagship" || recency === "active",
      });
    }
  });
}

overdue.sort((a, b) => b.overdueDays - a.overdueDays);

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const pad = (s, n) => String(s).padEnd(n);

if (MD) {
  console.log("### Freshness review queue\n");
  if (logicErrors.length) {
    console.log(`**${logicErrors.length} logic error(s):**\n`);
    for (const e of logicErrors) console.log(`- ❌ ${e}`);
    console.log("");
  }
  if (overdue.length) {
    console.log("| Entry | Shard | Tier | Recency | lastUpdated | Budget | Overdue |");
    console.log("|---|---|---|---|---|---|---|");
    for (const o of overdue) {
      console.log(`| \`${o.ref}\` | ${o.shard.replace("data/profile/", "")} | ${o.tier} | ${o.recency} | ${o.lastUpdated} | ${o.budget} | ${o.overdueDays}d |`);
    }
    console.log(`\nReview each entry, then \`npm run reviewed -- "<section.key>" --apply\`.`);
  }
  if (!logicErrors.length && !overdue.length) console.log("✅ All entries within their freshness budgets.");
} else {
  if (logicErrors.length) {
    console.error(`✗ ${logicErrors.length} freshness logic error(s):`);
    for (const e of logicErrors) console.error(`    ${e}`);
  }
  if (overdue.length) {
    console.log(`\n${overdue.length} entr${overdue.length === 1 ? "y" : "ies"} overdue for review (sorted by overdue days):`);
    console.log(`  ${pad("Entry", 42)} ${pad("Tier", 10)} ${pad("Recency", 11)} ${pad("lastUpdated", 12)} ${pad("Budget", 7)} Overdue`);
    for (const o of overdue) {
      console.log(`  ${pad(o.ref, 42)} ${pad(o.tier, 10)} ${pad(o.recency, 11)} ${pad(o.lastUpdated, 12)} ${pad(o.budget, 7)} ${o.overdueDays}d${o.gate ? "  ← gated" : ""}`);
      console.log(`    fix: review the entry, then npm run reviewed -- "${o.ref}" --apply`);
    }
  }
  if (!logicErrors.length && !overdue.length) {
    console.log("✓ All entries within their freshness budgets — nothing to review.");
  }
}

const gatedOverdue = overdue.filter((o) => o.gate);
if (logicErrors.length) process.exit(1);
if (STRICT && gatedOverdue.length) {
  console.error(`\n✗ --strict: ${gatedOverdue.length} flagship/active entr${gatedOverdue.length === 1 ? "y is" : "ies are"} overdue.`);
  process.exit(1);
}
