// Render the parsed ATS resume as plain text.
//
// This is the artifact for "paste your resume" textareas — the fallback every
// portal offers when its file parser gives up, which is exactly the situation
// this whole export path exists for.
//
// ENCODING: UTF-8, no BOM, NO ASCII folding. cv/README.md already rules that
// Māori macrons stay — they carry meaning and extract byte-exact. Folding
// "Te Whare Tapa Whā" to "Wha" in a document about culturally-typed data would
// degrade a person's and a culture's names to buy nothing: the same characters
// already survive the PDF's text layer. Em dashes stay for the same reason.
//
// LINE ENDINGS: LF. .gitattributes is `* text=auto eol=lf`; we write "\n" and
// add no *.txt exception. (This is also why the generator writes the file
// itself instead of being piped through PowerShell's `| Out-File`, which would
// rejoin stdout with CRLF.)
//
// NO HARD WRAP: one logical unit per line. Hard-wrapping a bullet into three
// lines makes a line-oriented parser see three items; every paste box soft-wraps
// anyway; and one bullet = one line = one diff hunk in a tracked artifact.
//
// URL POLICY is per block, not one global heuristic:
//   contact lines, project entries  visible text already IS the URL — leave it
//   role org, education school      target OMITTED. These are structured fields
//                                   and "Engram (https://engram.media/)" invites
//                                   a parser to fold the URL into the company.
//   "Also built:" prose links       target APPENDED as " (url)". Their visible
//                                   text is a bare word, so without it those
//                                   five projects would have no address at all
//                                   — a real loss versus the PDF.
// That last rule is the ONLY place this file's token stream differs from
// `pdftotext` on the PDF.

import { fragsToText } from "../scripts/lib/parse-ats-resume.mjs";

/** Fragment run → text, appending " (url)" for links whose text is not the URL. */
function withUrls(frags) {
  return frags
    .map((f) => {
      if (!f.href) return f.text;
      // Strip scheme, "www." and any trailing slash before comparing, so
      // "linkedin.com/in/chanmeng666" is recognised as already being its own
      // address (its href is https://www.linkedin.com/in/…/) and no redundant
      // URL is appended to the contact line.
      const bare = f.href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
      if (f.text === bare) return f.text;
      // Deliberately an EXACT match, not startsWith: "gradient-svg-generator"
      // is a prefix of "gradient-svg-generator.vercel.app" but is not itself a
      // resolvable address, so that project would otherwise be left with none.
      return `${f.text} (${f.href})`;
    })
    .join("");
}

export function buildTxt(model) {
  const out = [];
  const blank = () => { if (out.length && out[out.length - 1] !== "") out.push(""); };

  out.push(model.identity.name);
  out.push(model.identity.tagline);
  for (const line of model.identity.contactLines) out.push(fragsToText(line));

  for (const section of model.sections) {
    blank();
    out.push(section.heading);
    out.push("");

    for (const block of section.blocks) {
      switch (block.type) {
        case "para":
          out.push(withUrls(block.frags));
          blank();
          break;

        case "subhead":
          out.push(block.text);
          out.push("");
          break;

        case "labelled":
          // Commas, not spaces: the designed CV's skill pills extract
          // space-separated, so two skills become indistinguishable from one.
          out.push(`${block.label}: ${block.items.join(", ")}`);
          break;

        case "role": {
          const meta = [block.location, block.arrangement, block.dates].filter(Boolean);
          if (block.compact) {
            out.push([`${block.title}, ${block.org}`, ...meta].join(" | "));
          } else {
            out.push(block.title);
            out.push([block.org, ...meta].join(" | "));
            for (const bullet of block.bullets) out.push(`- ${withUrls(bullet)}`);
            blank();
          }
          break;
        }

        case "project":
          out.push([block.name, block.url].filter(Boolean).join(" | "));
          out.push(withUrls(block.body));
          blank();
          break;

        case "education":
          out.push([`${block.degree}, ${block.school}`, block.dates, block.note].filter(Boolean).join(" | "));
          break;

        case "list":
          for (const item of block.items) out.push(`- ${withUrls(item)}`);
          break;

        default:
          throw new Error(`ats-txt: unhandled block type ${block.type}`);
      }
    }
  }

  // Collapse any run of blank lines to one, and end with exactly one newline.
  return `${out.join("\n").replace(/\n{3,}/g, "\n\n").replace(/\s+$/, "")}\n`;
}
