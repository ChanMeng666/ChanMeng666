#!/usr/bin/env python3
"""Verify the ATS resume deliverables in cv/exports/ before uploading them.

    python cv/verify-ats-exports.py

This is the runnable form of the two "definition of done" lists in cv/README.md.
Those lists used to be prose, which meant they were checked by hand or not at
all — and the failure they guard against is silent: a Word file that is quietly
missing a job still opens fine and still looks like a resume.

WHY PYTHON IN A NODE REPO
A .docx is a ZIP of XML and this machine has no Word, no LibreOffice, no pandoc
and no Java — so the only honest way to read one back is a ZIP reader plus a
couple of regexes, and Python's stdlib has both with zero install. The PDF half
already depends on poppler and pypdf, which cv/README.md has assumed since the
ATS resume was written.

NOT WIRED INTO CI. It needs poppler + pypdf, which the validate workflow does
not install; `npm run check:ats` is the cheap gate that runs on every PR. Run
this one before an actual upload, and after touching cv/chan-meng-cv-ats.typ,
cv/ats-docx.mjs or cv/ats-txt.mjs.

Requires: poppler (pdftotext, pdfinfo, pdffonts, pdfimages) on PATH, and pypdf.
Exit code 0 = every check passed.
"""

import html
import re
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCX = ROOT / "cv/exports/chan-meng-cv-ats.docx"
PDF = ROOT / "cv/exports/chan-meng-cv-ats.pdf"
TXT = ROOT / "cv/exports/chan-meng-cv-ats.txt"

# Must match EXPECT.headings in scripts/lib/parse-ats-resume.mjs. Only section
# names an ATS lexicon knows belong here (cv/README.md, "ATS variant — hard rules").
EXPECTED_HEADINGS = [
    "PROFESSIONAL SUMMARY", "TECHNICAL SKILLS", "PROFESSIONAL EXPERIENCE",
    "PROJECTS", "EDUCATION", "CERTIFICATIONS", "AWARDS AND RECOGNITION",
]
EXPECTED_BULLETS = 11     # 8 role bullets (She Sharp carries two) + 3 awards
EXPECTED_PAGES = 2

failures = []


def check(label, ok, detail=""):
    print(f"{'  ok  ' if ok else ' FAIL '} {label}{('  — ' + detail) if detail else ''}")
    if not ok:
        failures.append(f"{label}: {detail}")


def run(*cmd):
    return subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8").stdout


def tokens(s):
    """Whitespace-collapsed word stream, with bullet markers removed.

    Standalone "-" goes on BOTH sides. pdftotext reflows a role's marker to
    mid-line ("… May 2026 - Present - Recruited onto …"), so a leading-"-" strip
    cannot catch it — and dropping every standalone "-" also drops the one in
    "May 2026 - Present", which is fine precisely because it is dropped
    identically everywhere. A separator is not content.
    """
    s = s.replace("•", " ").replace("­", "")
    return [t for t in re.sub(r"\s+", " ", s).strip().split(" ") if t != "-"]


def docx_paragraph_text(xml):
    out = []
    for p in re.split(r"</w:p>", xml):
        out.append(html.unescape("".join(re.findall(r"<w:t[^>]*>(.*?)</w:t>", p, re.S))))
    return out


def main():
    missing_tools = [t for t in ("pdftotext", "pdfinfo", "pdffonts", "pdfimages") if not shutil.which(t)]
    if missing_tools:
        sys.exit(f"poppler not on PATH: missing {', '.join(missing_tools)}")
    for f in (DOCX, PDF, TXT):
        if not f.exists():
            sys.exit(f"{f} is missing — run `pwsh cv/build.ps1` first.")

    zf = zipfile.ZipFile(DOCX)
    names = set(zf.namelist())
    xml = zf.read("word/document.xml").decode("utf-8")
    rels = zf.read("word/_rels/document.xml.rels").decode("utf-8")
    styles = zf.read("word/styles.xml").decode("utf-8")
    core = zf.read("docProps/core.xml").decode("utf-8")
    all_parts = "\n".join(
        zf.read(n).decode("utf-8", "ignore") for n in zf.namelist() if n.endswith((".xml", ".rels"))
    )

    pdf_text = run("pdftotext", "-enc", "UTF-8", str(PDF), "-")
    txt_text = TXT.read_text(encoding="utf-8")
    docx_text = "\n".join(p for p in docx_paragraph_text(xml) if p.strip())

    print("== .docx ==")

    required = ["[Content_Types].xml", "_rels/.rels", "word/document.xml", "word/styles.xml",
                "word/numbering.xml", "word/_rels/document.xml.rels", "docProps/core.xml"]
    absent = [r for r in required if r not in names]
    check("valid OOXML package", zf.testzip() is None and not absent,
          f"missing {absent}" if absent else f"{len(names)} parts")

    # The strongest anti-truncation proof available: if the Word file had lost a
    # job, a bullet or a skill, this is where it would show.
    t_pdf, t_docx = tokens(pdf_text), tokens(docx_text)
    first = [(i, a, b) for i, (a, b) in enumerate(zip(t_pdf, t_docx)) if a != b][:3]
    check("text identical to the PDF", t_pdf == t_docx,
          f"{len(t_pdf)} vs {len(t_docx)} tokens; first diff {first}" if t_pdf != t_docx
          else f"{len(t_pdf)} tokens")

    h1 = [html.unescape("".join(re.findall(r"<w:t[^>]*>(.*?)</w:t>", p, re.S)))
          for p in re.split(r"</w:p>", xml) if '<w:pStyle w:val="Heading1"/>' in p]
    check("real Heading1 styles, in order", h1 == EXPECTED_HEADINGS, f"{len(h1)} found: {h1}")

    numpr = xml.count("<w:numPr>")
    literal = len(re.findall(r"<w:t[^>]*>- ", xml))
    check("real numbered bullets, no typed '- '", numpr == EXPECTED_BULLETS and literal == 0,
          f"numPr={numpr} (want {EXPECTED_BULLETS}), typed-dash={literal}")

    # A dangling relationship is the #1 cause of "Word found unreadable content".
    used = set(re.findall(r'<w:hyperlink[^>]*r:id="([^"]+)"', xml))
    external = set(re.findall(r'Id="([^"]+)"[^>]*TargetMode="External"', rels))
    check("no dangling hyperlink relationships", not (used - external),
          f"{len(used)} links, dangling={sorted(used - external)}" if used - external
          else f"{len(used)} links all resolve")

    hostile = {t: xml.count(t) for t in
               ("<w:tbl", "<w:drawing", "<w:pict", "<w:txbxContent", "<w:framePr", '<w:cols w:num="2"')}
    stray = [n for n in names if re.match(r"word/(header|footer)\d*\.xml|word/media/", n)]
    check("no tables/images/text boxes/headers/footers",
          not any(hostile.values()) and not stray,
          f"{ {k: v for k, v in hostile.items() if v} } {stray}")

    undefined = (set(re.findall(r'<w:(?:p|r)Style w:val="([^"]+)"', xml))
                 - set(re.findall(r'<w:style [^>]*w:styleId="([^"]+)"', styles)))
    check("every style reference is defined", not undefined, f"undefined: {sorted(undefined)}")

    fonts = set(re.findall(r'<w:rFonts[^>]*w:ascii="([^"]+)"', all_parts))
    check("Arial only; DM Sans absent", fonts <= {"Arial"} and "DM Sans" not in all_parts,
          f"fonts={sorted(fonts)}")

    props = [k for k in ("dc:title", "dc:creator", "dcterms:created", "dcterms:modified") if k not in core]
    check("core properties set, no keywords", not props and "cp:keywords" not in core,
          f"missing {props}, keywords={'cp:keywords' in core}")

    print("== .txt ==")

    # The only sanctioned divergence: the five "Also built:" prose links get
    # " (url)" appended, because their visible text is a bare word and they
    # would otherwise carry no address at all in plain text. Stripped as
    # SUBSTRINGS — token-wise stripping would strand the trailing "." of
    # "Seismophone (url)." as its own token and report a phantom difference.
    t_txt = tokens(re.sub(r" \(https?://[^)\s]+\)", "", txt_text))
    first = [(i, a, b) for i, (a, b) in enumerate(zip(t_pdf, t_txt)) if a != b][:3]
    check("text identical to the PDF (modulo appended urls)", t_pdf == t_txt,
          f"{len(t_pdf)} vs {len(t_txt)} tokens; first diff {first}" if t_pdf != t_txt
          else f"{len(t_txt)} tokens")

    check("LF line endings, no BOM",
          "\r" not in txt_text and not txt_text.startswith("﻿"),
          f"CR present={chr(13) in txt_text}")

    print("== .pdf ==")

    info = run("pdfinfo", str(PDF))

    def field(name):
        m = re.search(rf"^{name}:\s*(.+)$", info, re.M)
        return m.group(1).strip() if m else ""

    check(f"{EXPECTED_PAGES} pages", field("Pages") == str(EXPECTED_PAGES), f"Pages: {field('Pages')}")
    check("tagged PDF", field("Tagged") == "yes", f"Tagged: {field('Tagged')}")
    # A PDF with neither date is a known trip-hazard for legacy resume parsers,
    # and was the clearest structural anomaly in the file Lever refused.
    check("CreationDate + ModDate present", bool(field("CreationDate")) and bool(field("ModDate")),
          f"CreationDate={field('CreationDate') or 'ABSENT'} ModDate={field('ModDate') or 'ABSENT'}")

    # Columns: name type encoding emb sub uni object-ID(2 tokens). Indexed from
    # the END because "type" is itself two words ("CID TrueType"), and the
    # object ID is two — so uni is [-3], not [-2].
    font_rows = [r for r in run("pdffonts", str(PDF)).splitlines()[2:] if r.strip()]
    not_unicode = [r.split()[0] for r in font_rows if r.split()[-3] != "yes"]
    check("every font maps to Unicode (uni=yes)",
          bool(font_rows) and not not_unicode,
          f"{len(font_rows)} fonts" + (f"; no ToUnicode: {not_unicode}" if not_unicode else ""))

    image_rows = [r for r in run("pdfimages", "-list", str(PDF)).splitlines()[2:] if r.strip()]
    check("no images", not image_rows, f"{len(image_rows)} image(s)")

    try:
        from pypdf import PdfReader
    except ImportError:
        check("7 /H1 structure elements", False, "pypdf not installed (pip install pypdf)")
    else:
        reader = PdfReader(str(PDF))
        tags = []

        def walk(node):
            if isinstance(node, list):
                for n in node:
                    walk(n)
                return
            try:
                obj = node.get_object()
            except Exception:
                return
            if isinstance(obj, dict):
                if "/S" in obj:
                    tags.append(str(obj["/S"]))
                if "/K" in obj:
                    walk(obj["/K"])

        root = reader.trailer["/Root"]
        if "/StructTreeRoot" in root:
            walk(root["/StructTreeRoot"].get_object().get("/K"))
        check(f"{len(EXPECTED_HEADINGS)} /H1 structure elements",
              tags.count("/H1") == len(EXPECTED_HEADINGS), f"found {tags.count('/H1')}")

    # The automated form of README's "hyphenated-keyword grep". Typst treats an
    # explicit hyphen as a break opportunity and pdftotext DELETES one that lands
    # at a line end — which silently cost "web-vitals", "multi-user" and
    # "gpt-5.4-mini" on the first build of this resume. The box() show rule in
    # chan-meng-cv-ats.typ fixes it; this proves the fix still holds.
    stripped = re.sub(r" \(https?://[^)\s]+\)", "", txt_text)
    compounds = {t.strip(".,;:()") for t in re.findall(r"[\w.]+(?:-[\w.]+)+", stripped)}
    lost = sorted(c for c in compounds if c and c not in pdf_text)
    check("no hyphenated compound lost in extraction", not lost,
          f"{len(compounds)} checked; lost: {lost}" if lost else f"{len(compounds)} checked")

    print()
    if failures:
        print(f"{len(failures)} check(s) FAILED")
        return 1
    print("all checks passed — safe to upload")
    return 0


if __name__ == "__main__":
    sys.exit(main())
