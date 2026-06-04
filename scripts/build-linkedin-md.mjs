// Generate human-readable markdown companions from linkedin/linkedin-profile.json.
// The JSON is the single source of truth for LinkedIn copy; these .md files are
// derived (always in sync). Run:  node scripts/build-linkedin-md.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const dir = path.join(repoRoot, "linkedin");
const data = JSON.parse(readFileSync(path.join(dir, "linkedin-profile.json"), "utf8"));

const banner = (title) =>
  `<!-- GENERATED from linkedin-profile.json by scripts/build-linkedin-md.mjs — DO NOT EDIT BY HAND. -->\n` +
  `<!-- Edit the JSON (the source of truth) and re-run the script. -->\n\n# ${title}\n`;

const block = (text) => "```\n" + text + "\n```\n";

const skillsLine = (e) => {
  if (!e.skills || !e.skills.length) return "";
  const more = e.moreSkillsCount ? ` and +${e.moreSkillsCount} skill${e.moreSkillsCount === 1 ? "" : "s"}` : "";
  return `**Skills:** ${e.skills.join(", ")}${more}\n`;
};

const mediaLine = (e) => {
  if (!e.media || !e.media.length) return "";
  const more = e.mediaTotal && e.mediaTotal > e.media.length ? `  _(Show all ${e.mediaTotal} media)_` : "";
  return `**Media:** ${e.media.map((m) => `\`${m}\``).join(" · ")}${more}\n`;
};

const files = {};

/* ---- banner / headline ---- */
{
  const b = data.banner;
  let s = banner("LinkedIn — Banner / Intro");
  s += `\n**Name:** ${b.name}\n`;
  s += `**Pronouns:** ${b.pronouns}\n`;
  s += `**Location:** ${b.location}\n`;
  s += `**Current:** ${b.currentEmployerBadge}  |  **Education:** ${b.educationBadge}\n`;
  const website = b.websiteUrl ? `[${b.websiteLabel}](${b.websiteUrl})` : b.websiteLabel;
  s += `**Website:** ${website}  |  **Connections:** ${b.connections}  |  **Open to work:** ${b.openToWork ? "yes" : "no"}\n`;
  s += `\n**Headline:**\n\n${block(b.headline)}`;
  files["linkedin-banner.md"] = s;
}

/* ---- about ---- */
{
  const a = data.about;
  let s = banner("LinkedIn — About");
  s += `\n${block(a.lead)}`;
  for (const sec of a.sections) {
    s += `\n## ${sec.emoji} ${sec.heading}\n\n${block(sec.body)}`;
  }
  s += `\n**Top skills:** ${a.topSkills.join(" • ")}\n`;
  files["linkedin-about.md"] = s;
}

/* ---- services ---- */
{
  const v = data.services;
  let s = banner("LinkedIn — Services");
  s += `\n**Page title:** ${v.pageTitle}\n`;
  s += `**Open to work:** ${v.openToWork ? "yes" : "no"}\n`;
  s += `**Availability:** ${v.availability}\n`;
  s += `**Pricing:** ${v.pricing}\n`;
  s += `**Reviews:** ${v.reviews}\n`;
  s += `\n**Overview:**\n\n${block(v.overview)}`;
  s += `\n**Services provided:**\n\n${v.servicesProvided.map((x) => `- ${x}`).join("\n")}\n`;
  files["linkedin-services.md"] = s;
}

/* ---- featured ---- */
{
  let s = banner("LinkedIn — Featured");
  data.featured.forEach((f, i) => {
    s += `\n## ${i + 1}. ${f.title}\n\n`;
    s += `**Type:** ${f.type}\n`;
    if (f.site) s += `**Site:** ${f.site}\n`;
    s += `**URL:** ${f.url}\n`;
  });
  files["linkedin-featured.md"] = s;
}

/* ---- experience ---- */
{
  let s = banner("LinkedIn — Experience");
  data.experience.forEach((c) => {
    s += `\n## ${c.company}\n`;
    if (c.companyDuration) s += `_${c.companyDuration}${c.companyLocation ? " · " + c.companyLocation : ""}_\n`;
    if (c.links) s += `**Links:** ${c.links.map((l) => `<${l}>`).join(" · ")}\n`;
    c.positions.forEach((p) => {
      s += `\n### ${p.title}\n\n`;
      if (p.employmentType) s += `**Employment type:** ${p.employmentType}\n`;
      s += `**Dates:** ${p.dateRange}${p.duration ? " · " + p.duration : ""}\n`;
      if (p.location) s += `**Location:** ${p.location}\n`;
      if (p.foundViaLinkedIn) s += `**LinkedIn helped me get this job**\n`;
      s += `\n${block(p.description)}`;
      const sk = skillsLine(p);
      if (sk) s += `\n${sk}`;
      const md = mediaLine(p);
      if (md) s += md;
    });
  });
  files["linkedin-experience.md"] = s;
}

/* ---- education ---- */
{
  let s = banner("LinkedIn — Education");
  data.education.forEach((e, i) => {
    s += `\n## ${i + 1}. ${e.school}\n\n`;
    s += `**Degree:** ${e.degree}\n`;
    s += `**Field of study:** ${e.fieldOfStudy}\n`;
    s += `**Dates:** ${e.dateRange}\n`;
    s += `**Grade:** ${e.grade}\n`;
    if (e.credentialId) s += `**Credential ID:** ${e.credentialId}\n`;
    if (e.url) s += `**URL:** <${e.url}>\n`;
    s += `\n**Activities and societies:**\n\n${block(e.activitiesAndSocieties)}`;
    s += `\n**Description:**\n\n${block(e.description)}`;
    s += mediaLine(e);
  });
  files["linkedin-education.md"] = s;
}

/* ---- licenses & certifications ---- */
{
  let s = banner("LinkedIn — Licenses & Certifications");
  s += `\n${data.licensesAndCertifications.length} credentials, newest first.\n`;
  s += `\n| # | Name | Issuer | Issued | Credential ID | Verify | Skills |\n`;
  s += `|---|------|--------|--------|---------------|--------|--------|\n`;
  data.licensesAndCertifications.forEach((c, i) => {
    const cid = c.credentialId || "—";
    const sk = c.skills ? c.skills.join(", ") : "";
    const link = c.credentialUrl ? `[link](${c.credentialUrl})` : "—";
    s += `| ${i + 1} | ${c.name}${c.note ? " (" + c.note + ")" : ""} | ${c.issuer} | ${c.issued} | ${cid} | ${link} | ${sk} |\n`;
  });
  files["linkedin-licenses-and-certifications.md"] = s;
}

/* ---- projects ---- */
{
  let s = banner("LinkedIn — Projects");
  data.projects.forEach((p, i) => {
    s += `\n## ${i + 1}. ${p.name}\n\n`;
    s += `**Dates:** ${p.dateRange}\n`;
    if (p.associatedWith) s += `**Associated with:** ${p.associatedWith}\n`;
    if (p.hasOtherContributors) s += `**Other contributors:** yes\n`;
    s += `\n${block(p.description)}`;
    const sk = skillsLine(p);
    if (sk) s += `\n${sk}`;
    s += mediaLine(p);
  });
  files["linkedin-projects.md"] = s;
}

/* ---- volunteering ---- */
{
  let s = banner("LinkedIn — Volunteering");
  data.volunteering.forEach((v, i) => {
    s += `\n## ${i + 1}. ${v.role} — ${v.organization}\n\n`;
    s += `**Dates:** ${v.dateRange}${v.duration ? " · " + v.duration : ""}\n`;
    s += `**Cause:** ${v.cause}\n`;
    if (v.url) s += `**URL:** <${v.url}>\n`;
    s += `\n${block(v.description)}`;
    s += mediaLine(v);
  });
  files["linkedin-volunteering.md"] = s;
}

/* ---- honors & awards ---- */
{
  let s = banner("LinkedIn — Honors & Awards");
  data.honorsAndAwards.forEach((h, i) => {
    s += `\n## ${i + 1}. ${h.title}${h.onLiveProfile === false ? "  _(not yet on live profile)_" : ""}\n\n`;
    if (h.associatedWith) s += `**Associated with:** ${h.associatedWith}\n`;
    s += `**Issuer:** ${h.issuer}\n`;
    s += `**Issue date:** ${h.issueDate}\n`;
    if (h.url) s += `**URL:** <${h.url}>\n`;
    if (h.links) s += `**Links:** ${h.links.map((l) => `<${l}>`).join(" · ")}\n`;
    s += mediaLine(h);
    s += `\n${block(h.description)}`;
  });
  files["linkedin-honors-and-awards.md"] = s;
}

/* ---- publications ---- */
{
  let s = banner("LinkedIn — Publications");
  s += `\nCurated subset (${data.publications.length}) — grouped for reference; LinkedIn shows them flat, date-ordered.\n`;
  let lastGroup = "";
  data.publications.forEach((p, i) => {
    if (p.group && p.group !== lastGroup) {
      s += `\n---\n\n### ${p.group}\n`;
      lastGroup = p.group;
    }
    s += `\n## ${i + 1}. ${p.title}\n\n`;
    s += `**Publication/Publisher:** ${p.publisher}\n`;
    s += `**Publication date:** ${p.publicationDate}\n`;
    s += `**Author:** ${p.author}\n`;
    if (p.url) s += `**URL:** <${p.url}>\n`;
    if (p.engagement) s += `**Engagement:** ${p.engagement}\n`;
    s += `\n${block(p.description)}`;
  });
  files["linkedin-publications.md"] = s;
}

/* ---- skills ---- */
if (data.skills) {
  const endorseLine = (e) => {
    if (!e) return "";
    const bits = [];
    if (e.count) bits.push(`${e.count} endorsement${e.count === 1 ? "" : "s"}`);
    if (e.notes) bits.push(...e.notes);
    if (e.detailsTotal) bits.push(`Show all ${e.detailsTotal} details`);
    return bits.length ? `  _${bits.join(" · ")}_\n` : "";
  };
  let s = banner("LinkedIn — Skills");
  s += `\n${data.skills.items.length} skills, in the order LinkedIn's "All" view displays them.\n`;
  s += `\n**Category tabs:** ${data.skills.categories.join(" · ")}\n`;
  data.skills.items.forEach((sk) => {
    s += `\n### ${sk.name}\n`;
    if (sk.associations) sk.associations.forEach((a) => (s += `- ${a}\n`));
    s += endorseLine(sk.endorsements);
  });
  files["linkedin-skills.md"] = s;
}

/* ---- recommendations ---- */
if (data.recommendations) {
  let s = banner("LinkedIn — Recommendations (Received)");
  s += `\n${data.recommendations.received.length} received recommendations, newest first.\n`;
  data.recommendations.received.forEach((r, i) => {
    const who = r.profileUrl ? `[${r.recommender}](${r.profileUrl})` : r.recommender;
    s += `\n## ${i + 1}. ${who}\n\n`;
    s += `_${r.headline}_\n\n`;
    s += `**${r.date}** · ${r.relationship}\n`;
    s += `\n${block(r.text)}`;
  });
  files["linkedin-recommendations.md"] = s;
}

/* ---- languages ---- */
if (data.languages) {
  let s = banner("LinkedIn — Languages");
  s += `\n| Language | Proficiency |\n|----------|-------------|\n`;
  data.languages.forEach((l) => (s += `| ${l.language} | ${l.proficiency} |\n`));
  files["linkedin-languages.md"] = s;
}

for (const [name, content] of Object.entries(files)) {
  writeFileSync(path.join(dir, name), content, "utf8");
  console.log("  ✓", name);
}
console.log(`\nGenerated ${Object.keys(files).length} markdown files from linkedin-profile.json`);
