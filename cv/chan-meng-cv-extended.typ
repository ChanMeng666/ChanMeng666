// Chan Meng — EXTENDED CV, «Subtraction / Addition» 16-page magazine.
// Image-led personal-brand magazine: minimalist × independent developer.
// Build: pwsh cv/build.ps1 → public/chan-meng-cv-extended.pdf.
#import "theme-extended.typ": *
#import "extended.typ": *

#set document(
  title: "Chan Meng — Subtraction / Addition (Extended)",
  author: "Chan Meng",
  description: "A 16-page image-led personal-brand magazine: minimalist and independent developer. Companion to the 2-page CV. Canonical: https://chanmeng.org/cv",
  keywords: ("minimalist", "independent developer", "AI-native", "Claude Code", "product design", "Auckland New Zealand"),
)

// Inner-page geometry: calm margins + a slim footer with an orange page dot.
#set page(
  paper: "a4",
  margin: (top: 1.8cm, bottom: 1.5cm, left: 1.9cm, right: 1.9cm),
  footer: context [
    #set text(size: 7pt, fill: muted)
    #grid(columns: (1fr, auto, 1fr),
      align: (left + horizon, center + horizon, right + horizon),
      [Chan Meng — Subtraction / Addition],
      text(fill: accent)[#counter(page).display()],
      [chanmeng.org])
  ],
)
#set text(font: sans, size: size-body-x, fill: ink, lang: "en")
#set par(leading: leading-body-x, justify: false, first-line-indent: 0pt)
#show link: it => underline(stroke: 0.3pt + accent, offset: 1.5pt, it)

#x-cover()
#x-opening()
#x-story()
#x-minimalist()
#x-build()
#x-teaching()
#x-voices()
#x-recognition()
#x-backcover()
