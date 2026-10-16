// Generated organisation context strings (owner decision d9, 2026-10-16).
//
// organizations[].meta.x_brand.context is the one-line "what Chan did there"
// shown after an organisation's name (README partner line, llms.txt,
// llms-full.txt, dist/profile.json). A title + date string must not be typed
// by hand: it duplicated work[] / volunteer[] / education[] with no gate.
//
//   context: auto              -> "<title> (<Mon YYYY> — <Mon YYYY|Present>)"
//   contextTitle: "<short>"    -> optional curated title; default is the
//                                 related entry's position (studyType for
//                                 education). Dates always come from the entry.
//   context: "<prose>"         -> hand-written prose, no dates (lint-kb
//                                 rejects a hand-written title + date string).
//
// The related entry is the first of relatedWorkId, relatedVolunteerId,
// relatedEducationId that the org sets.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const fmtMonthYear = (d) => {
  if (!d) return "";
  const m = /^(\d{4})-(\d{2})/.exec(String(d));
  if (!m) return String(d);
  return `${MONTHS[parseInt(m[2], 10) - 1] ?? m[2]} ${m[1]}`;
};

export const orgContextRange = (start, end) => `${fmtMonthYear(start)} — ${end ? fmtMonthYear(end) : "Present"}`;

// Returns { list, id, entry } for the org's related entry, or null.
export function orgRelatedEntry(org, profile) {
  const x = org?.meta?.x_brand ?? {};
  for (const [list, key] of [["work", "relatedWorkId"], ["volunteer", "relatedVolunteerId"], ["education", "relatedEducationId"]]) {
    const id = x[key];
    if (!id) continue;
    const entry = (profile[list] ?? []).find((e) => e?.id === id) ?? null;
    return { list, id, entry };
  }
  return null;
}

// The generated string for an org, or null when it has no dated related entry.
export function generatedOrgContext(org, profile) {
  const rel = orgRelatedEntry(org, profile);
  const e = rel?.entry;
  if (!e?.startDate) return null;
  const title = org.meta?.x_brand?.contextTitle ?? e.position ?? e.studyType;
  if (!title) return null;
  return `${title} (${orgContextRange(e.startDate, e.endDate)})`;
}

// Replace every `context: auto` in place with its generated string (and drop
// contextTitle). Throws
// when an `auto` org has nothing to generate from, so it never renders "auto".
export function expandOrgContexts(profile) {
  for (const o of profile.organizations ?? []) {
    const x = o?.meta?.x_brand;
    if (!x || x.context !== "auto") continue;
    const s = generatedOrgContext(o, profile);
    if (!s) throw new Error(`organizations[${o.id}].meta.x_brand.context is "auto" but it has no related work/volunteer/education entry with a startDate and a title`);
    x.context = s;
    delete x.contextTitle; // an input to the string, not output: keeps dist/profile.json's shape
  }
  return profile;
}
