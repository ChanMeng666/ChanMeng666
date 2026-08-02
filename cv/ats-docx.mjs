// Render the parsed ATS resume as a .docx.
//
// WHY THIS FILE EXISTS AT ALL
// Lever refused an upload of cv/exports/chan-meng-cv-ats.pdf with "Couldn't
// auto-read resume" (2026-08-03) even though that PDF is single-column, tagged,
// image-free and extracts 7,185 characters in correct reading order under both
// poppler and pypdf. Rather than keep guessing at the PDF container, this
// sidesteps it: .docx is the format Lever's own help page recommends first, and
// the most reliably parsed one across Greenhouse / Workday / Taleo too.
//
// This module is a PURE model -> Buffer function. The Date freeze and all file
// writing live in cv/build-ats-exports.mjs, so this stays trivially testable.
//
// ATS RULES, same spirit as the .typ but expressed in OOXML terms:
//   • Real Heading1 paragraph styles, not bold text that looks like a heading —
//     this is the .docx analogue of the PDF's /H1 tags and the reason a parser
//     finds sections at all.
//   • Real numbering (w:numPr) for bullets, never a literal "-" typed into a run.
//   • Real w:hyperlink relationships, styled black + underline rather than
//     Word's blue: visible affordance without introducing colour.
//   • No tables, text boxes, headers, footers, page numbers, images, or columns.
//     Nothing below emits them; verification asserts their absence rather than
//     trusting that.
//   • No cp:keywords. The same anti-keyword-stuffing rule the PDF follows —
//     a keyword list is as legible in Word's Properties pane as /Keywords is in
//     `pdfinfo`, and reads as gaming to a human screener.
//
// PAGE COUNT IS NOT AN ACCEPTANCE CRITERION HERE. Word repaginates against
// whatever fonts and printer metrics the reader has; the two-page budget is a
// PDF constraint enforced in cv/chan-meng-cv-ats.typ. Do not add a page check.

import {
  Document, Packer, Paragraph, TextRun, ExternalHyperlink,
  HeadingLevel, AlignmentType, BorderStyle, LevelFormat, UnderlineType,
  convertMillimetersToTwip,
} from "docx";

// Arial, not DM Sans. DM Sans is vendored under cv/fonts for Typst's
// --font-path; it is NOT installed on a recruiter's machine, so naming it means
// a silent substitution to whatever Word picks. Embedding it is worse: it
// inflates the file, Google Docs ignores embedded fonts entirely, and some ATS
// pipelines choke on the binary word/fonts/ parts.
// Arial over Calibri because Calibri ships with Microsoft Office but NOT with
// macOS or Linux — a recruiter opening this in Pages or Google Docs without
// Office would get a substitution. Arial is native on Windows and macOS, native
// in Google Docs, and metric-substituted by Liberation Sans on Linux.
const FONT = "Arial";

const HALF_PT = (pt) => Math.round(pt * 2);   // w:sz is in half-points
const TWIP = (pt) => Math.round(pt * 20);     // 1pt = 20 twips

const BULLETS = "ats-bullets";

/** Fragment[] -> docx runs, preserving bold and turning href into a real link. */
function runs(frags) {
  return frags.map((f) => {
    const run = new TextRun({ text: f.text, bold: f.bold || undefined });
    if (!f.href) return run;
    return new ExternalHyperlink({
      link: f.href,
      children: [new TextRun({
        text: f.text,
        bold: f.bold || undefined,
        color: "000000",
        underline: { type: UnderlineType.SINGLE, color: "000000" },
      })],
    });
  });
}

/** One plain paragraph. `after` is trailing space in points. */
function para(children, { after = 4, keepNext = false } = {}) {
  return new Paragraph({
    children,
    keepNext,
    spacing: { after: TWIP(after) },
  });
}

function bullet(frags) {
  return new Paragraph({
    numbering: { reference: BULLETS, level: 0 },
    children: runs(frags),
    spacing: { after: TWIP(3) },
  });
}

/** A hyperlinked plain string, or a plain run when there is no target. */
function linked(text, href, { bold = false } = {}) {
  return runs([{ text, href: href || undefined, bold: bold || undefined }]);
}

function renderBlock(block) {
  switch (block.type) {
    case "para":
      return [para(runs(block.frags), { after: 6 })];

    case "subhead":
      return [para([new TextRun({ text: block.text, bold: true })], { after: 4, keepNext: true })];

    case "labelled":
      // Commas between items, matching the .typ: the designed CV's skill pills
      // extract space-separated, so two skills read as one.
      return [para([
        new TextRun({ text: `${block.label}: `, bold: true }),
        new TextRun({ text: block.items.join(", ") }),
      ], { after: 4 })];

    case "role": {
      const meta = [block.location, block.arrangement, block.dates].filter(Boolean);
      if (block.compact) {
        return [para([
          new TextRun({ text: `${block.title}, `, bold: true }),
          ...linked(block.org, block.orgUrl),
          ...(meta.length ? [new TextRun({ text: ` | ${meta.join(" | ")}` })] : []),
        ], { after: 4 })];
      }
      return [
        // keepNext so a job title can never sit alone at the foot of a page with
        // its employer and dates stranded overleaf.
        para([new TextRun({ text: block.title, bold: true })], { after: 0, keepNext: true }),
        para([
          ...linked(block.org, block.orgUrl),
          ...(meta.length ? [new TextRun({ text: ` | ${meta.join(" | ")}` })] : []),
        ], { after: 3, keepNext: block.bullets.length > 0 }),
        ...block.bullets.map(bullet),
      ];
    }

    case "project": {
      const dest = block.target || block.url;
      return [
        para([
          ...linked(block.name, dest, { bold: true }),
          ...(block.url ? [new TextRun({ text: " | " }), ...linked(block.url, dest)] : []),
        ], { after: 2, keepNext: true }),
        para(runs(block.body), { after: 7 }),
      ];
    }

    case "education": {
      const rest = [block.dates, block.note].filter(Boolean);
      return [para([
        new TextRun({ text: `${block.degree}, `, bold: true }),
        ...linked(block.school, block.schoolUrl),
        ...(rest.length ? [new TextRun({ text: ` | ${rest.join(" | ")}` })] : []),
      ], { after: 4 })];
    }

    case "list":
      return block.items.map(bullet);

    default:
      throw new Error(`ats-docx: unhandled block type ${block.type}`);
  }
}

function renderBody(model) {
  const children = [];

  // Identity: a plain bold paragraph, NOT a Title or Heading1 style. A
  // Heading1 reading "Chan Meng" invites a parser to open a section called
  // "Chan Meng"; the .typ makes the same call ("unlabelled by convention —
  // parsers expect the name block first, with no heading above it").
  children.push(new Paragraph({
    children: [new TextRun({ text: model.identity.name, bold: true, size: HALF_PT(16) })],
    spacing: { after: TWIP(2) },
    keepNext: true,
  }));
  children.push(para([new TextRun({ text: model.identity.tagline })], { after: 2, keepNext: true }));

  model.identity.contactLines.forEach((line, n) => {
    const last = n === model.identity.contactLines.length - 1;
    children.push(new Paragraph({
      children: runs(line),
      spacing: { after: TWIP(last ? 8 : 2) },
      // Mirrors the hairline rule the .typ draws under the contact block.
      border: last
        ? { bottom: { style: BorderStyle.SINGLE, size: 4, space: 4, color: "000000" } }
        : undefined,
    }));
  });

  for (const section of model.sections) {
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: section.heading })],
      keepNext: true,
    }));
    for (const block of section.blocks) children.push(...renderBlock(block));
  }

  return children;
}

export function buildDocument(model) {
  return new Document({
    title: model.docTitle,
    creator: model.docAuthor,
    lastModifiedBy: model.docAuthor,
    description:
      "Single-column ATS resume. GENERATED from cv/chan-meng-cv-ats.typ by " +
      "cv/build-ats-exports.mjs — do not edit by hand; edit the .typ and run " +
      "pwsh cv/build.ps1.",
    // NO `keywords:` — see the header note.
    styles: {
      default: {
        document: {
          run: { font: FONT, size: HALF_PT(10.5), color: "000000" },
          paragraph: { spacing: { line: 252, lineRule: "auto" } },
        },
        heading1: {
          run: { font: FONT, size: HALF_PT(12), bold: true, color: "000000" },
          paragraph: {
            spacing: { before: TWIP(11), after: TWIP(4) },
            // Word's stock Heading1 is blue Calibri Light — it would still
            // parse, but it injects colour and a second font family that the
            // ATS rules ban. Overridden here rather than avoided.
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, space: 3, color: "000000" } },
          },
        },
      },
    },
    numbering: {
      config: [{
        reference: BULLETS,
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 340, hanging: 170 } } },
        }],
      }],
    },
    sections: [{
      properties: {
        page: {
          size: {
            width: convertMillimetersToTwip(210),
            height: convertMillimetersToTwip(297),
          },
          // The PDF's 1.6cm was chosen against a PDF-specific heuristic
          // ("within 0.5in of the edge = header/footer, discard") that has no
          // OOXML analogue, so this can relax to normal Word resume margins.
          margin: {
            top: convertMillimetersToTwip(18),
            bottom: convertMillimetersToTwip(18),
            left: convertMillimetersToTwip(18),
            right: convertMillimetersToTwip(18),
          },
        },
      },
      children: renderBody(model),
    }],
  });
}

/** model -> .docx bytes. Callers own determinism (see build-ats-exports.mjs). */
export function buildDocx(model) {
  return Packer.toBuffer(buildDocument(model));
}
