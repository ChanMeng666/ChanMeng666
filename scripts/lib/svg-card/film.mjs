// Helpers for cards whose picture comes from one of Chan's product films.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// One JPEG (base64) per time, cut from `film` with ffmpeg: crop "w:h:x:y" in the
// film's own pixels, then scale to w×h. Needs ffmpeg on PATH.
export function filmStills(film, times, { crop, w, h, quality = 6 }) {
  const dir = mkdtempSync(path.join(tmpdir(), "svg-card-"));
  try {
    return times.map((t, i) => {
      const out = path.join(dir, `s${i}.jpg`);
      execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", String(t), "-i", film, "-frames:v", "1", "-vf", `crop=${crop},scale=${w}:${h}`, "-q:v", String(quality), out]);
      return readFileSync(out).toString("base64");
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// Greedy word wrap against measured glyph widths.
export function wrap(glyphs, text, style, maxWidth) {
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (line && glyphs.measure(next, style) > maxWidth) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}
