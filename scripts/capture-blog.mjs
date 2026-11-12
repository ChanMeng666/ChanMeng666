#!/usr/bin/env node
// Capture the published posts on chanmeng.org/blog from its RSS feed, into blog/capture/latest.json.
//
// The blog lives in the 2d-portfolio repo (content/*.mdx). Its build-time feed lists every
// published post and no drafts, so it is the one place that says what is live. scripts/build.mjs
// reads this capture: a post with no hand-written `publications[]` entry still reaches the README
// Writing table (as the newest posts), the article count and llms.txt.
//
// The file is rewritten only when the posts change, so the daily CI run commits nothing on a
// quiet day. A failed fetch keeps the last capture and exits 0: the build must not break because
// the site was briefly unreachable.
//
//   node scripts/capture-blog.mjs [--strict]
//
// --strict   exit 1 when the feed cannot be read (for a local run)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FEED_URL = "https://chanmeng.org/blog/feed.xml";
const OUT = path.join(repoRoot, "blog", "capture", "latest.json");
const strict = process.argv.slice(2).includes("--strict");

function unescapeXml(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&")
    .trim();
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? unescapeXml(m[1]) : "";
}

function parse(xml) {
  const posts = [];
  for (const [, block] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const url = tag(block, "link");
    const slug = url.replace(/^https:\/\/chanmeng\.org\/blog\//, "").replace(/\/$/, "");
    const date = new Date(tag(block, "pubDate"));
    if (!url || !slug || slug === url || Number.isNaN(date.getTime())) {
      throw new Error(`unreadable feed item: ${block.slice(0, 200)}`);
    }
    posts.push({
      slug,
      title: tag(block, "title"),
      url,
      publishedAt: date.toISOString().slice(0, 10),
      summary: tag(block, "description"),
      tags: [...block.matchAll(/<category>([\s\S]*?)<\/category>/g)].map((m) => unescapeXml(m[1])),
    });
  }
  return posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug));
}

let posts;
try {
  const res = await fetch(FEED_URL, { headers: { "User-Agent": "chanmeng666-profile-build" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  posts = parse(await res.text());
  if (posts.length === 0) throw new Error("the feed has no items");
} catch (err) {
  console.warn(`⚠ capture-blog: could not read ${FEED_URL} (${err.message}); keeping the last capture`);
  process.exit(strict ? 1 : 0);
}

const previous = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : null;
if (previous && JSON.stringify(previous.posts) === JSON.stringify(posts)) {
  console.log(`✓ capture-blog: ${posts.length} posts, unchanged`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(
  OUT,
  JSON.stringify({ source: FEED_URL, capturedAt: new Date().toISOString(), posts }, null, 2) + "\n",
);
const known = new Set((previous?.posts ?? []).map((p) => p.slug));
const added = posts.filter((p) => !known.has(p.slug)).map((p) => p.slug);
console.log(`✓ capture-blog: ${posts.length} posts${added.length ? `, new: ${added.join(", ")}` : ""}`);
