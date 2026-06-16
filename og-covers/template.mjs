// Pure HTML template for a project's OG / social-share cover (1200×630, the
// platform-standard 1.91:1). One parametric layout, themed per project by its
// own brand color + logo + name/tagline, with a subtle "by Chan Meng" monkey
// mark in the corner. Rendered to PNG by render.mjs via Playwright (the same
// fixed-surface + `data-out` screenshot pattern as
// scripts/export-linkedin-cards.mjs).
//
// renderHtml() is pure: it receives already-encoded data URIs for the logo and
// the monkey mark, so it touches no filesystem.

/** Relative luminance (WCAG) of a #rrggbb color, 0 (black) … 1 (white). */
export function relLum(hex) {
  const c = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
  const lin = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** True when a #rrggbb background is dark enough to want light foreground text. */
export function isDark(hex) {
  return relLum(hex) < 0.4;
}

/**
 * @param {object} e
 *   e.name        display name (Anton headline)
 *   e.tagline     one-line description (DM Sans)
 *   e.eyebrow     small uppercase kicker (e.g. "OPEN SOURCE")
 *   e.bg          page background hex (the project's brand color)
 *   e.accent      accent color hex, OR a CSS color/gradient string for the bar
 *   e.logoDataUri data: URI for the project logo (svg/png)
 *   e.markDataUri data: URI for the monkey mark (variant chosen for contrast)
 *   e.ink         optional text color override (else auto from bg luminance)
 *   e.tileBg      optional logo-tile backing color (else auto)
 *   e.out         output filename (default "og-cover.png")
 */
export function renderHtml(e) {
  const dark = isDark(e.bg);
  const ink = e.ink || (dark ? "#FFFFFF" : "#070607");
  const sub = dark ? "rgba(255,255,255,0.82)" : "rgba(7,6,7,0.78)";
  // Logo tile backing: on dark pages a near-black tile with a light hairline
  // reads as a distinct panel; on light pages a clean ash tile.
  const tileBg = e.tileBg || (dark ? "#0E0E18" : "#F7F6F2");
  const tileBorder = dark ? "rgba(255,255,255,0.22)" : "rgba(7,6,7,0.14)";
  const accentBar = e.accent || "#FC5000";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${e.name} — OG cover</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{ box-sizing:border-box; }
  html,body{ margin:0; padding:0; background:#888; font-family:'DM Sans',-apple-system,'Segoe UI',sans-serif; -webkit-font-smoothing:antialiased; }

  .cover{
    width:1200px; height:630px; position:relative; overflow:hidden;
    background:${e.bg}; color:${ink};
  }

  /* Decorative pixel squares — the cyber-playground signature, tinted subtly. */
  .px{ position:absolute; width:18px; height:18px; opacity:0.9; }

  /* ── Left content column ── */
  .content{ position:absolute; left:88px; top:0; bottom:0; width:660px;
    display:flex; flex-direction:column; justify-content:center; }
  .eyebrow{ font-size:21px; font-weight:700; letter-spacing:0.22em;
    text-transform:uppercase; color:${ink}; opacity:0.9; }
  .bar{ width:96px; height:10px; margin:22px 0 26px; background:${accentBar};
    border-radius:2px; }
  .name{ font-family:'Anton',sans-serif; font-weight:400; line-height:0.94;
    letter-spacing:0.012em; color:${ink}; font-size:96px; margin:0; }
  .tagline{ margin-top:26px; font-size:29px; line-height:1.34; font-weight:500;
    color:${sub}; max-width:600px; }

  /* ── Right logo tile ── */
  .tile{ position:absolute; right:88px; top:50%; transform:translateY(-50%);
    width:300px; height:300px; border-radius:44px; background:${tileBg};
    border:2px solid ${tileBorder}; overflow:hidden;
    display:flex; align-items:center; justify-content:center; }
  .tile img{ width:100%; height:100%; object-fit:contain; }
  .tile.pad img{ width:74%; height:74%; }

  /* ── Personal mark (bottom-left corner) ── */
  .mark{ position:absolute; left:88px; bottom:46px;
    display:flex; align-items:center; gap:12px; opacity:0.92; }
  .mark img{ width:40px; height:40px; }
  .mark span{ font-size:20px; font-weight:600; color:${sub}; letter-spacing:0.01em; }
</style>
</head>
<body>

<div class="cover" data-out="${e.out || "og-cover.png"}">
  <!-- pixel accents -->
  <span class="px" style="right:60px; top:48px; background:${accentBar};"></span>
  <span class="px" style="right:96px; top:84px; background:${ink}; opacity:0.18;"></span>
  <span class="px" style="left:540px; bottom:70px; background:${accentBar}; opacity:0.5;"></span>

  <div class="content">
    <div class="eyebrow">${e.eyebrow || "Open Source"}</div>
    <div class="bar"></div>
    <h1 class="name">${e.name}</h1>
    <p class="tagline">${e.tagline}</p>
  </div>

  <div class="tile${e.logoPad ? " pad" : ""}">
    <img src="${e.logoDataUri}" alt="">
  </div>

  <div class="mark">
    <img src="${e.markDataUri}" alt="">
    <span>by Chan Meng</span>
  </div>
</div>

</body>
</html>`;
}
