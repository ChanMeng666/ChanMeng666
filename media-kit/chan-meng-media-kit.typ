// =============================================================================
// CHAN MENG — SPEAKER & MEDIA KIT
// =============================================================================
// A landscape, magazine-grade kit for event organizers (booking talks) and
// journalists (writing about Chan). Brand-locked to the Caldera system via
// ../cv/theme.typ. All facts sourced verbatim from data/profile/*.yaml.
//
// Design: image-forward — every spread leads with a full-bleed or half-page
// photograph, generous white space, loose leading, and concise copy.
//
// Build (from repo root):
//   typst compile --root . --font-path cv/fonts \
//     media-kit/chan-meng-media-kit.typ public/chan-meng-media-kit.pdf
// =============================================================================

#import "theme.typ": *
#import "components.typ": *

#show: mk-doc

// ─── Shared asset paths ──────────────────────────────────────────────────────
#let logo-black  = "/public/brands/chan-meng-monkey-black-transparent.svg"
#let logo-white  = "/public/brands/chan-meng-monkey-white-transparent.svg"
#let portrait    = "/public/photos/chanmeng-portrait-2026.jpg"
#let photo-tree  = "/public/photos/chan-by-the-tree.jpg"
#let photo-cele  = "/public/photos/chan-celebrate.jpg"
#let photo-keynote = "/public/photos/chan-keynote-ai-hackathon-2025.jpg"
#let photo-panel1  = "/public/photos/chan-panel-shesharp-gesturing.jpg"
#let photo-panel2  = "/public/photos/chan-panel-shesharp.jpg"

// Column widths for half-page bleed splits (sum = 297mm landscape A4).
#let col-img   = 119mm
#let col-panel = 178mm

// =============================================================================
// PAGE 1 — COVER  (half-page portrait · editorial panel)
// =============================================================================
#page(margin: 0pt, fill: canvas-page)[
  #grid(
    columns: (col-img, col-panel),
    rows: (mk-page-h,),
    bleed-image(portrait, col-img),
    box(
      width: col-panel, height: mk-page-h,
      fill: canvas-page, inset: mk-pad,
      stroke: (left: 2pt + accent),
      grid(
        rows: (auto, 1fr, auto),
        // ── top: logo + location ───────────────────────────────────────────
        grid(
          columns: (1fr, auto), align: (left + horizon, right + horizon),
          image(logo-black, height: 38pt),
          text(font: mono, size: mk-meta, fill: muted, tracking: 0.16em)[AUCKLAND · AOTEAROA NZ · UTC+12],
        ),
        // ── middle: name + positioning ─────────────────────────────────────
        align(left + horizon, {
          mk-eyebrow("Speaker & Media Kit")
          v(16pt)
          text(font: sans-display, weight: "regular", size: mk-display, fill: primary, tracking: 0.01em)[CHAN MENG]
          v(12pt)
          text(font: sans, weight: "bold", size: mk-lead, fill: accent)[AI Agent Architect · Full-Stack Engineer]
          v(20pt)
          block(width: 86%, {
            set par(leading: mk-lead-loose)
            text(size: 15pt, style: "italic", fill: ink)[“Building at the intersection of AI, cultural technology, and women’s health.”]
          })
        }),
        // ── bottom: contact strip ──────────────────────────────────────────
        block({
          set par(leading: 1.9em)
          svg-chip("/cv/icons/globe.svg", "chanmeng.org", "https://chanmeng.org/")
          [ ]
          svg-chip("/cv/icons/linkedin.svg", "in/chanmeng666", "https://www.linkedin.com/in/chanmeng666/")
          [ ]
          svg-chip("/cv/icons/github.svg", "ChanMeng666", "https://github.com/ChanMeng666")
          [ ]
          svg-chip("/cv/icons/mail.svg", "chanmeng.career@gmail.com", "mailto:chanmeng.career@gmail.com")
        }),
      ),
    ),
  )
]

// =============================================================================
// PAGE 2 — BIO & REACH  (editorial panel · half-page portrait)
// =============================================================================
#page(margin: 0pt, fill: canvas-page)[
  #grid(
    columns: (col-panel, col-img),
    rows: (mk-page-h,),
    box(
      width: col-panel, height: mk-page-h,
      fill: canvas-page, inset: (top: 1.1cm, bottom: 1.1cm, left: mk-pad, right: mk-pad),
      stroke: (right: 2pt + accent),
      {
        mk-section("About", "Bio & Reach")

        text(font: mono, size: mk-tiny, weight: "bold", fill: accent, tracking: 0.18em)[ONE-LINER]
        v(6pt)
        block(width: 94%, { set par(leading: mk-lead-loose); text(size: 12pt, fill: primary, weight: "medium")[AI agent architect and full-stack engineer working at the intersection of AI, cultural technology, and women’s health — based in Auckland, New Zealand.] })
        v(13pt)

        text(font: mono, size: mk-tiny, weight: "bold", fill: accent, tracking: 0.18em)[SHORT BIO]
        v(6pt)
        block(width: 94%, { set par(leading: mk-lead-loose); text(size: mk-body, fill: ink)[Chan Meng builds agentic AI systems end-to-end — usually solo. She holds a Master of Applied Computing with Distinction from Lincoln University and is part of the Anthropic Partner Network, working remote-first from Auckland.] })
        v(13pt)

        text(font: mono, size: mk-tiny, weight: "bold", fill: accent, tracking: 0.18em)[LONG BIO]
        v(6pt)
        block(width: 94%, { set par(leading: mk-lead-loose); text(size: mk-body, fill: ink)[Creator of Tam-AI-Ti (a Te Whare Tapa Whā AI wellness coach), CTO of FemTech Weekend, and website lead at She Sharp. She spoke at UN CSW 69 in New York; her credo — #emph[“subtraction for life, addition for thought.”]] })

        v(1fr)

        text(font: mono, size: mk-tiny, weight: "bold", fill: muted, tracking: 0.16em)[REACH · AS OF JUNE 2026]
        v(8pt)
        grid(
          columns: (1fr, 1fr, 1fr, 1fr, 1fr),
          column-gutter: 9pt,
          metric-tile("5,856", "LinkedIn"),
          metric-tile("1,103", "Newsletter"),
          metric-tile("218", "GitHub followers"),
          metric-tile("480+", "GitHub stars"),
          metric-tile("23", "Recommendations"),
        )
      },
    ),
    bleed-image(photo-tree, col-img),
  )
]

// =============================================================================
// PAGE 3 — SIGNATURE SPEAKING TOPICS  (framed, airy list)
// =============================================================================
#page(margin: mk-margin, fill: canvas-page)[
  #mk-section("Speaking", "Signature Topics")

  #block({
    topic-row(
      "layer-group",
      "Culture in the Schema, Not the UI",
      "Building Māori-native AI products — why indigenous frameworks belong in the data model, not just the surface.",
      "Keynote · 30–45 min",
    )
    topic-row(
      "robot",
      "AI Agent Architecture, End-to-End",
      "Designing agentic systems the whole way down — retrieval, memory, tool use, and evaluation.",
      "Talk / workshop · 45–60 min",
    )
    topic-row(
      "diagram-project",
      "AI Matching Systems That Work at Scale",
      "A production five-dimension weighted matcher with caching, fallback, and human-in-the-loop.",
      "Case study · 30 min",
    )
    topic-row(
      "heart-pulse",
      "FemTech: Research Platforms for Women’s Health",
      "Building research and community infrastructure for women’s health across borders — bilingual from day one.",
      "Keynote / panel · 25–40 min",
    )
    topic-row(
      "terminal",
      "Natural Language Is the Source Code",
      "Teaching prompt-first AI engineering — the doctrine behind a 12-week cohort and 100+ learners.",
      "Talk / program · 30 min+",
    )
    v(4pt)
    block(width: 100%, fill: primary, radius: mk-radius, inset: (x: 16pt, y: 13pt), {
      set text(size: mk-small, fill: white)
      grid(
        columns: (auto, 1fr, auto, 1fr, auto, 1fr),
        column-gutter: 9pt, align: (horizon, horizon, horizon, horizon, horizon, horizon),
        text(fill: accent, size: 12pt, fa("microphone")), [*UN CSW 69* speaker · UN HQ, New York],
        text(fill: accent, size: 12pt, fa("trophy")), [*Outstanding Mentor* · AI Hackathon Festival 2025],
        text(fill: accent, size: 12pt, fa("podcast")), [Hosts *4 podcasts* · English & Chinese],
      )
    })
  })
]

// =============================================================================
// PAGE 4 — ON STAGE  (speaking-photo gallery)
// =============================================================================
#page(margin: mk-margin, fill: canvas-page)[
  #mk-section("In Action", "On Stage")

  #grid(
    columns: (1.5fr, 1fr), column-gutter: 13pt, align: (top, top),
    // ── hero: keynote ─────────────────────────────────────────────────────────
    {
      photo-frame(photo-keynote, height: 100mm)
      v(6pt)
      mk-caption[Keynote · AI Hackathon Festival 2025 — Auckland]
    },
    // ── two panel frames ──────────────────────────────────────────────────────
    {
      photo-frame(photo-panel1, height: 44mm)
      v(5pt)
      mk-caption[Panel Speaker · She Sharp × Her Waka]
      v(8pt)
      photo-frame(photo-panel2, height: 44mm)
      v(5pt)
      mk-caption[“Your Journey. Your Pace. Your Path.”]
    },
  )

  #v(14pt)
  #align(center, text(font: mono, size: mk-meta, fill: muted, tracking: 0.08em)[RECENT STAGES — UN CSW 69, NEW YORK · AI HACKATHON FESTIVAL 2025 · SHE SHARP × HER WAKA])
]

// =============================================================================
// PAGE 5 — PROOF & RECOGNITION  (full-width)
// =============================================================================
#page(margin: mk-margin, fill: canvas-page)[
  #mk-section("Proof", "Signature Work & Recognition")

  #grid(
    columns: (1.5fr, 1fr), column-gutter: 24pt, align: (top, top),
    // ── left: 2×2 signature-work cards ───────────────────────────────────────
    grid(
      columns: (1fr, 1fr),
      column-gutter: 13pt, row-gutter: 13pt,
      proof-card(
        "Tam-AI-Ti",
        "Solo-built AI wellness coach grounded in the Māori Te Whare Tapa Whā framework.",
        "351", "solo commits / 4 mo",
      ),
      proof-card(
        "She Sharp Platform",
        "Member platform for NZ’s top women-in-STEM nonprofit (2,200+), with an AI matcher.",
        "86.6%", "of 748 commits",
      ),
      proof-card(
        "GAVIGO IRE",
        "AI activation platform with sub-millisecond container pre-warming.",
        "<1 ms", "p50 restore",
      ),
      proof-card(
        "FemTech Weekend",
        "Women’s-health research platform; hosts the Shanghai Summit 2026.",
        "16", "summit speakers",
      ),
    ),
    // ── right: awards + backing ──────────────────────────────────────────────
    {
      text(font: mono, size: mk-tiny, weight: "bold", fill: accent, tracking: 0.18em)[AWARDS & HONORS]
      v(8pt)
      block({ set par(leading: mk-lead-loose); text(size: mk-small, fill: ink)[*UN CSW 69 Speaker* (2025) · *Outstanding Mentor*, AI Hackathon 2025 · *UN Women FemTech Hackathon* · *M. Applied Computing with Distinction*, Lincoln NZ · *Dean’s List, top 5%*] })
      v(18pt)
      text(font: mono, size: mk-tiny, weight: "bold", fill: muted, tracking: 0.16em)[BACKED BY]
      v(6pt)
      block({ set par(leading: mk-lead-loose); text(size: mk-small, fill: ink)[Google for Startups Cloud · NVIDIA Inception · Anthropic Partner Network] })
    },
  )
]

// =============================================================================
// PAGE 5 — PRESS & TESTIMONIALS  (framed, airy)
// =============================================================================
#page(margin: mk-margin, fill: canvas-page)[
  #mk-section("Media", "Press & Praise")

  #text(font: mono, size: mk-tiny, weight: "bold", fill: muted, tracking: 0.16em)[AS FEATURED IN]
  #v(9pt)
  #block({
    set par(leading: 2.1em)
    press-pill("THISDAYLIVE", [FemTech founders · 2025])
    [ ]
    press-pill("PulseMCP", [Weekly Pulse · MCP])
    [ ]
    press-pill("Coder Sisters 码农姐妹", [Podcast])
    [ ]
    press-pill("FemTech At Work", [Spotify · Ep 21])
    [ ]
    press-pill("The Most People 最人物", [Minimalism · 100k+ reads])
  })

  #v(mk-gap)

  #grid(
    columns: (1fr, 1fr, 1fr),
    column-gutter: 15pt,
    align: (top, top, top),
    testimonial-card(
      "He turns ambiguous founder-level direction into working systems and measurable proof. He combines speed with discipline — I would strongly recommend Chan for any ambitious technical team.",
      "Saba Gecgil", "Founder & CEO, GAVIGO Inc.",
    ),
    testimonial-card(
      "An outstanding engineer whose work combines speed, security, and strategic foresight. She embeds privacy into the core architecture — the kind of engineer who elevates those around her.",
      "Gabrielle J. Hurst", "Product Marketing Manager · former CXO, Sanicle",
    ),
    testimonial-card(
      "As a solo developer she coded the entire website and parts of the platform from scratch — deep technical skill and the ability to manage complex projects independently.",
      "Omopeju (Paige) Afanu", "Chief Executive Officer, Sanicle",
    ),
  )
]

// =============================================================================
// PAGE 6 — BOOKING  (celebratory photo band + bold dark CTA panel)
// =============================================================================
#let dark-chip(icon, label, url) = svg-chip(
  icon, label, url,
  fill: white.transparentize(88%), ink: white, stroke-color: white.transparentize(58%),
)

#page(margin: 0pt, fill: primary)[
  #grid(
    columns: (mk-page-w,),
    rows: (92mm, 1fr),
    // ── top: celebratory photo band ──────────────────────────────────────────
    box(width: mk-page-w, height: 92mm, clip: true,
      image(photo-cele, width: mk-page-w, height: 92mm, fit: "cover")),
    // ── bottom: dark booking panel ───────────────────────────────────────────
    box(
      width: mk-page-w, height: 100%,
      fill: primary, inset: (x: mk-pad, top: 26pt, bottom: 22pt),
      grid(
        rows: (1fr, auto),
        align(left + horizon, grid(
          columns: (1fr, auto), column-gutter: 24pt, align: (left + horizon, right + horizon),
          {
            mk-eyebrow("Let’s work together", fill: glare)
            v(14pt)
            text(font: sans-display, weight: "regular", size: mk-title, fill: white, tracking: 0.02em)[BOOK CHAN TO SPEAK]
            v(12pt)
            block(width: 92%, { set par(leading: mk-lead-loose); text(size: mk-lead, fill: white.transparentize(12%))[Keynotes · technical talks · workshops · panels — remote worldwide or in person.] })
          },
          image(logo-white, height: 58pt),
        )),
        {
          v(16pt)
          block({
            set par(leading: 2.1em)
            dark-chip("/cv/icons/mail.svg", "chanmeng.career@gmail.com", "mailto:chanmeng.career@gmail.com")
            [ ]
            dark-chip("/cv/icons/calendar.svg", "Book a 30-min call", "https://cal.com/chan-meng/30min")
            [ ]
            dark-chip("/cv/icons/globe.svg", "chanmeng.org", "https://chanmeng.org/")
            [ ]
            dark-chip("/cv/icons/linkedin.svg", "in/chanmeng666", "https://www.linkedin.com/in/chanmeng666/")
            [ ]
            dark-chip("/cv/icons/github.svg", "ChanMeng666", "https://github.com/ChanMeng666")
          })
          v(14pt)
          grid(
            columns: (1fr, auto), align: (left + horizon, right + horizon),
            text(font: mono, size: mk-tiny, fill: white.transparentize(35%), tracking: 0.14em)[AUCKLAND · AOTEAROA NZ · UTC+12],
            text(font: mono, size: mk-tiny, fill: white.transparentize(35%))[Compiled June 2026 · data as of 2026-06],
          )
        },
      ),
    ),
  )
]
