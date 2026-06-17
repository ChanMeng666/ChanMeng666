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

  // ── Wave 3: remaining deployed apps + games (+ 2 SVG-og fixes) ──
  {
    id: "sunostats",
    repoDir: "D:/github_repository/sunostats",
    publicDir: "public",
    siteUrl: "https://sunostats.chanmeng.org",
    name: "SunoStats",
    eyebrow: "Suno Analytics",
    tagline: "The analyst for Suno creators — tag reports, snapshots, trending intel.",
    bg: "#161616", // monochrome editorial brand
    accent: "#FAFAFA",
    logo: null, // only ships the personal monkey mark → no-logo panel layout
    framework: "app",
    metaFile: "src/app/layout.tsx",
    deployBranch: "master", // GitHub Actions → Docker → VPS, auto on push
  },
  {
    id: "chinese-redefine",
    repoDir: "D:/github_repository/chinese-redefine",
    publicDir: "public",
    siteUrl: "https://chinese-redefine.chanmeng-dev.workers.dev",
    name: "Chinese Redefine",
    eyebrow: "Word Card Generator",
    tagline: "Reinterpreting classical Chinese words for modern times.",
    bg: "#F7F4EF", // warm paper cream
    accent: "#C82F1D", // vermillion (朱砂红)
    tileBg: "#FFFFFF",
    logo: "public/logo-seal.svg", // circular red seal mark
    logoPad: true,
    framework: "app",
    metaFile: "app/layout.tsx",
    deployBranch: "master",
    autoDeploy: false, // manual: npm run deploy (opennextjs-cloudflare); acct c87dca (chanmeng-dev)
  },
  {
    id: "agrihire-solutions",
    repoDir: "D:/github_repository/agrihire-solutions",
    publicDir: "public",
    siteUrl: "https://agrihire.chanmeng.org",
    name: "AgriHire Solutions",
    eyebrow: "Equipment Hire",
    tagline: "Agricultural equipment hire made simple — across New Zealand.",
    bg: "#2D8659", // brand green
    accent: "#1B5E20", // deeper green panel
    logo: null, // only ships the personal monkey mark → no-logo panel layout
    framework: "app",
    metaFile: "src/app/layout.tsx",
    deployBranch: "main",
    autoDeploy: false, // manual: npm run deploy (opennextjs-cloudflare)
  },
  {
    id: "ai-hackathon-assistant",
    repoDir: "D:/github_repository/ai-hackathon-assistant",
    publicDir: "public",
    siteUrl: "https://ai-hackathon-assistant.chanmeng-dev.workers.dev",
    name: "AI Hackathon 2025",
    eyebrow: "Festival Assistant",
    tagline: "Schedules, team formation, judging criteria — instant answers.",
    bg: "#050505",
    accent: "linear-gradient(135deg,#47D83A,#189C91)", // the event green→teal gradient
    logo: null, // logo is a wide wordmark; use the gradient panel instead
    framework: "app",
    metaFile: "app/layout.tsx",
    deployBranch: "master", // GitHub Actions → Cloudflare, auto on push to main/master
  },
  {
    id: "forward-with-her-mentorship-program",
    repoDir: "D:/github_repository/forward-with-her-mentorship-program",
    publicDir: "public",
    siteUrl: "https://forward-with-her-mentorship-program.pages.dev",
    name: "Forward with Her",
    eyebrow: "Mentorship",
    tagline: "A growth program connecting women in tech with mentors.",
    bg: "#FFF5E6", // warm cream
    accent: "#FF9933", // orange
    tileBg: "#FFFFFF",
    logo: "public/images/logo.svg",
    logoPad: true,
    framework: "app",
    metaFile: "src/app/layout.tsx",
    deployBranch: "master",
    autoDeploy: false, // Cloudflare Pages: npm run build && wrangler pages deploy out
  },
  {
    id: "send-joy",
    repoDir: "D:/github_repository/send-joy",
    publicDir: "public",
    siteUrl: "https://sendjoy.chanmeng-dev.workers.dev",
    name: "SendJoy",
    eyebrow: "Email Templates",
    tagline: "Drag-and-drop email templates — free, open-source, no code.",
    bg: "#FFFFFF",
    accent: "#DC2626", // neo-red
    tileBg: "#FEF3C7", // neo-cream tile frames the red mark
    logo: "public/send-joy-logo.svg",
    logoPad: true,
    framework: "app",
    metaFile: "app/layout.tsx", // FIX: og:image .svg → /og-cover.png
    deployBranch: "master", // GitHub Actions → Cloudflare, auto on push
  },
  {
    id: "leviathan",
    repoDir: "D:/github_repository/leviathan",
    publicDir: "packages/client/public",
    siteUrl: "https://leviathan-client.vercel.app",
    name: "Leviathan",
    eyebrow: "AI Roguelike",
    tagline: "An AI-native narrative strategy roguelike. Every run is unique.",
    bg: "#1B2B1B", // Balatro-style forest green
    accent: "#D4A843", // warm gold
    tileBg: "#F5F0E8", // cream card frames the dark mark
    logo: "packages/client/public/leviathan-logo.svg",
    logoPad: true,
    framework: "static", // Vite; meta in packages/client/index.html (FIX og:image .svg → png)
    metaFile: "packages/client/index.html",
    deployBranch: "main", // Vercel auto on push
  },
  {
    id: "css-tower-defense",
    repoDir: "D:/github_repository/css-tower-defense",
    publicDir: "assets/images", // gulp copies assets/ → dist/ (served by the worker)
    siteUrl: "https://towerdefense.chanmeng.org",
    name: "Guardians of Aotearoa",
    eyebrow: "Te Pā Tiaki",
    tagline: "A 3D tower defense game rendered entirely in CSS.",
    bg: "#000000",
    accent: "#2D8A8A", // cyan
    tileBg: "#FFF8F0", // warm white frames the ornate Māori mark
    logo: "assets/images/tower-defense-logo.svg",
    logoPad: true,
    framework: "static", // gulp-built; meta in index.src.html → built index.html (absolute og url)
    metaFile: "index.src.html",
    deployBranch: "main", // GitHub Actions: compile + wrangler, auto on push
  },
  {
    id: "ai-human-game",
    repoDir: "D:/github_repository/ai-human-game",
    publicDir: "public",
    siteUrl: "https://ai-human-game.chanmeng-dev.workers.dev",
    name: "AI vs Human",
    eyebrow: "Guessing Game",
    tagline: "Can you tell AI-generated content from human-made?",
    bg: "#0A0A0A",
    accent: "#C846AB", // bright purple
    tileBg: "#FFFFFF",
    logo: "public/ai-human-game.svg",
    logoPad: true,
    framework: "app",
    metaFile: "app/layout.tsx",
    deployBranch: "main",
    autoDeploy: false, // manual: npm run deploy (build:cloudflare && wrangler deploy); acct c87dca
  },
  {
    id: "journey-of-reincarnation",
    repoDir: "D:/github_repository/journey-of-reincarnation",
    publicDir: "public",
    siteUrl: "https://journey-of-reincarnation.pages.dev",
    name: "Journey of Reincarnation",
    eyebrow: "Life Simulation",
    tagline: "A journey through different lives.",
    bg: "#020817",
    accent: "#6366F1", // indigo pop on the near-black brand bg
    logo: "public/images/JourneyofReincarnation_white.svg", // white variant for dark bg
    logoPad: true,
    framework: "app",
    metaFile: "src/app/layout.tsx",
    deployBranch: "main",
    autoDeploy: false, // manual: npm run deploy (next build && wrangler pages deploy out)
  },
  {
    id: "otherworld-god-farmer",
    repoDir: "D:/github_repository/otherworld-god-farmer",
    publicDir: "public",
    siteUrl: "https://otherworld-god-farmer.pages.dev",
    name: "Otherworld God-Farmer",
    eyebrow: "Farm Sim",
    tagline: "A leisurely garden, from scratch.",
    bg: "#2C3E50", // game canvas slate
    accent: "#FA4F00", // logo orange
    tileBg: "#FFFFFF",
    logo: "public/otherworld-god-farmer-logo.svg",
    logoPad: true,
    framework: "angular", // meta in src/index.html (absolute og url)
    metaFile: "src/index.html",
    deployBranch: "main",
    autoDeploy: false, // manual: npm run deploy (ng build && wrangler pages deploy)
  },
  {
    id: "html-brick-game",
    repoDir: "D:/github_repository/html-brick-game",
    publicDir: ".", // plain static site; png sits next to index.html at repo root
    siteUrl: "https://chanmeng666.github.io/html-brick-game",
    name: "Starlight Breaker",
    eyebrow: "HTML5 Canvas",
    tagline: "An artistic brick-breaking game in pure vanilla JavaScript.",
    bg: "#1E3C72", // deep arcade blue
    accent: "#00D4FF", // cyan
    logo: null, // ships only a 1200×630 banner PNG → use the no-logo panel
    framework: "static", // GitHub Pages subpath; absolute og url required
    metaFile: "index.html",
    deployBranch: "main", // GitHub Pages, auto on push to main (root)
  },
  {
    id: "kaboom-rpg-adventure",
    repoDir: "D:/github_repository/kaboom-rpg-adventure",
    publicDir: "public", // Vite copies public/ → dist/ root
    siteUrl: "https://chanmeng666.github.io/kaboom-rpg-adventure",
    name: "Kaboom RPG",
    eyebrow: "Pixel Adventure",
    tagline: "A 2D pixel-art RPG adventure built with Kaboom.js.",
    bg: "#311047", // dark purple
    accent: "#6366F1", // indigo
    tileBg: "#FFFFFF",
    logo: "public/logo.svg",
    logoPad: true,
    framework: "static", // Vite + GitHub Actions → Pages subpath; absolute og url required
    metaFile: "index.html",
    deployBranch: "master", // GitHub Actions: vite build → Pages, auto on push
  },
];
