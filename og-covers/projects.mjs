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

  // ── Wave 1: flagship / primary deployed web apps ──
  {
    // NOTE: the deployed site is the PUBLIC repo (remote
    // ChanMeng666/github-readme-suno-cards), NOT the local
    // `github-readme-suno-cards` folder (which is the private research repo
    // `suno-research-private`). Deployed on a separate Vercel account.
    id: "github-readme-suno-cards",
    repoDir: "D:/github_repository/github-readme-suno-cards-public",
    publicDir: "apps/web/public",
    siteUrl: "https://github-readme-suno-cards.vercel.app",
    name: "Suno Music Cards",
    eyebrow: "GitHub README",
    tagline: "Turn your Suno tracks into dynamic GitHub README cards.",
    bg: "#0A0A0F",
    accent: "#8B5CF6",
    tileBg: "#FFFFFF", // colorful transparent logo — pops on a white tile
    logo: "apps/web/public/logo.svg",
    logoPad: true,
    framework: "app",
    metaFile: "apps/web/app/layout.tsx",
    deployBranch: "main",
  },
  {
    id: "vitex",
    repoDir: "D:/github_repository/easy-resume",
    publicDir: "public",
    siteUrl: "https://www.vitex.org.nz",
    name: "Vitex",
    eyebrow: "AI Career Agent",
    tagline: "Job-targeted resumes, ATS scoring, and cover letters — powered by AI.",
    bg: "#6C3CE9",
    accent: "#00D4AA",
    logo: "public/logo/vitex-logo-white.svg",
    logoPad: true,
    framework: "app",
    metaFile: "src/app/layout.tsx",
    deployBranch: "master",
  },
  {
    id: "image-generator",
    repoDir: "D:/github_repository/image-generator",
    publicDir: "public",
    siteUrl: "https://image-generator.chanmeng-dev.workers.dev",
    name: "AI Image Generator",
    eyebrow: "FLUX.1",
    tagline: "Turn your prompts into images in seconds.",
    bg: "#F4F4F5",
    accent: "#111111",
    tileBg: "#FFFFFF",
    logo: "public/logo.svg",
    logoPad: true,
    framework: "app",
    metaFile: "app/layout.tsx",
    deployBranch: "main",
    autoDeploy: false, // manual `opennextjs-cloudflare deploy`
  },
  {
    id: "free-period-website",
    repoDir: "D:/github_repository/free-period-website",
    publicDir: "public",
    siteUrl: "https://free-period-website.pages.dev",
    name: "FreePeriod",
    eyebrow: "Menstrual Care",
    tagline: "Sustainable menstrual care, accessible to everyone.",
    bg: "#F43F5E",
    accent: "#0EA5E9",
    tileBg: "#FFFFFF",
    logo: "public/images/main-logo.svg",
    logoPad: true,
    framework: "app",
    metaFile: "src/app/layout.tsx",
    deployBranch: "main",
    autoDeploy: false, // manual `wrangler pages deploy out`
  },
  {
    id: "archcanvas",
    repoDir: "D:/github_repository/archcanvas",
    publicDir: "public",
    siteUrl: "https://archcanvas.chanmeng.org",
    name: "ArchCanvas",
    eyebrow: "AI Design Agent",
    tagline: "Generate architectural design variations on an infinite canvas.",
    bg: "#0F172A",
    accent: "#5B7DFF",
    logo: null, // no dedicated project logo — uses the no-logo panel layout
    framework: "app",
    metaFile: "src/app/layout.tsx",
    deployBranch: "main",
  },
  {
    id: "she-sharp",
    repoDir: "D:/github_repository/she-sharp",
    publicDir: "public",
    // Canonical OG domain is the Vercel deploy: shesharp.org.nz is a separate
    // Cloudflare site that does not serve this deployment's assets.
    siteUrl: "https://she-sharp-zeta.vercel.app",
    name: "She Sharp",
    eyebrow: "Women in STEM",
    tagline: "Connecting women in tech through events, mentorship & careers.",
    bg: "#9B2E83",
    accent: "#C846AB",
    tileBg: "#B23D98",
    logo: "public/logos/she-sharp-logo-white.png",
    logoPad: true,
    framework: "app",
    metaFile: "app/layout.tsx",
    deployBranch: "main",
    remoteOwner: "NZ-SheSharp", // org repo — push access may differ
  },
  {
    id: "femtech-weekend-website",
    repoDir: "D:/github_repository/femtech-weekend-website",
    publicDir: "static",
    siteUrl: "https://www.femtechweekend.com",
    name: "FemTech Weekend",
    eyebrow: "Women's Health Tech",
    tagline: "Rooted in China, connecting women's health innovation globally.",
    bg: "#AA7C52",
    accent: "#E7C9B9",
    tileBg: "#FFFFFF",
    logo: "static/img/logo/femtech_weekend_logo_new.svg",
    logoPad: true,
    framework: "docusaurus",
    metaFile: "docusaurus.config.ts",
    deployBranch: "main",
  },

  // ── Wave 2: flagship / private web apps ──
  {
    id: "tam-ai-ti",
    repoDir: "D:/github_repository/tam-ai-ti-web",
    publicDir: "public",
    siteUrl: "https://tamaiti.whiri-ai.com",
    name: "TAM AI TI",
    eyebrow: "Financial Wellness",
    tagline: "Financial wellness that weaves Māori wisdom with AI.",
    bg: "#064E3B", // deep pounamu — dark companion to the brand green #10B981
    accent: "#10B981",
    tileBg: "#FFFFFF", // logo is a single-color (black) square mark
    logo: "public/tam-ai-ti-logo.svg",
    logoPad: true,
    framework: "app",
    metaFile: "app/layout.tsx",
    deployBranch: "main",
    remoteOwner: "Whiri-AI", // org repo; Vercel git-integration auto-deploy
  },
  {
    id: "gavigo-ire",
    repoDir: "D:/github_repository/gavigo",
    publicDir: "frontend/public",
    siteUrl: "https://ire.gavigo.com",
    name: "Gavigo IRE",
    eyebrow: "Instant Reality Exchange",
    tagline: "AI-driven container orchestration, visualized in real time.",
    bg: "#0A0E1A",
    accent: "#0082FB",
    tileBg: "#FFFFFF", // logo is a dark-blue gradient mark — pops on a white tile
    logo: "frontend/public/gavigo-logo.svg",
    logoPad: true,
    framework: "static", // Vite + React; meta tags live in frontend/index.html
    metaFile: "frontend/index.html",
    deployBranch: "main",
    autoDeploy: false, // GKE: docker build → push to GCR → kubectl apply (manual, on their infra)
    remoteOwner: "gavigo-inc",
  },
  {
    id: "linkedin-jobs-search",
    repoDir: "D:/github_repository/linkedin-jobs-search",
    publicDir: "public",
    siteUrl: "https://linkedin-jobs-search.chanmeng-dev.workers.dev",
    name: "LinkedIn Jobs Search",
    eyebrow: "Job Search API",
    tagline: "Programmatic LinkedIn job search for humans and AI agents.",
    bg: "#0A66C2",
    accent: "#FFA7D7",
    tileBg: "#FFFFFF", // branded blue+pink square mark, framed on white
    logo: "public/assets/images/linkedin-jobs-search-logo.svg",
    logoPad: true,
    framework: "static", // Vite + React SPA on a Cloudflare Worker; meta in index.html
    metaFile: "index.html",
    deployBranch: "main",
    autoDeploy: false, // manual: npm run deploy:wrangler (vite build && wrangler deploy)
  },
];
