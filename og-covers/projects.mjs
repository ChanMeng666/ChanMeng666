// Manifest of deployed projects that get an OG/social cover. render.mjs reads
// this, embeds each project's own logo, and writes <repoDir>/og/og-cover.html +
// <repoDir>/<publicDir>/og-cover.png.
//
// Fields:
//   id          stable slug (also used by `--only`)
//   repoDir     absolute path to the project repo
//   publicDir   static dir served at site root (where og-cover.png lands)
//   siteUrl     production origin (for the og:image absolute URL when wiring tags)
//   name        Anton headline
//   eyebrow     small uppercase kicker
//   tagline     one-line description (English — Anton/DM Sans have no CJK glyphs)
//   bg          page background hex = the project's own brand color
//   accent      accent color hex OR a CSS gradient string (drives the bar/pixels)
//   logo        logo file path within the repo
//   logoPad     true for transparent marks (inset in the tile); false for
//               square app-icon logos that already fill their own tile
//   framework   "app" | "pages" | "static"  (for the meta-tag wiring step)
//   metaFile    file that controls <head>/metadata (relative to repoDir)
//   deployBranch branch whose push triggers the live deploy

export const projects = [
  {
    id: "fanfic-lab",
    repoDir: "D:/github_repository/fanfic-lab",
    publicDir: "public",
    siteUrl: "https://www.fanfic-lab.tech",
    name: "FanFic Lab",
    eyebrow: "AI Writing Studio",
    tagline: "AI co-writing studio for Honkai: Star Rail fanfiction.",
    bg: "#2DD4BF",
    accent: "#FFB84D",
    logo: "public/logo/fanfic-lab-logo-green.svg",
    logoPad: true,
    framework: "app",
    metaFile: "src/app/layout.tsx",
    deployBranch: "master",
  },
  {
    id: "gradient-svg-generator",
    repoDir: "D:/github_repository/gradient-svg-generator",
    publicDir: "public",
    siteUrl: "https://gradient-svg-generator.vercel.app",
    name: "Gradient SVG Generator",
    eyebrow: "Open Source",
    tagline: "340+ animated gradient SVG banners — one URL, no install.",
    bg: "#1A1A2E",
    accent: "linear-gradient(90deg,#FC5000,#F5F28E,#02FF73,#524AE9)",
    logo: "public/gradient-svg-generator.svg",
    logoPad: false,
    framework: "pages",
    metaFile: "src/pages/_document.tsx",
    deployBranch: "main",
  },
  {
    id: "library-os",
    repoDir: "D:/github_repository/library-os",
    publicDir: "public",
    siteUrl: "https://libraryos.live",
    name: "LibraryOS",
    eyebrow: "Multi-Tenant SaaS",
    tagline: "The operating system for modern libraries.",
    bg: "#02FF73",
    accent: "#09ADAA",
    logo: "public/libraryos-logo.svg",
    logoPad: false,
    framework: "app",
    metaFile: "src/app/layout.tsx",
    deployBranch: "master",
  },
];
