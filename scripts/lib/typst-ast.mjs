// Scanning primitives for hand-curated Typst sources.
//
// These are hardened generalisations of the two regexes scripts/check-cv-sync.mjs
// has used since the CV drift guard was written:
//
//     /role-line\(([\s\S]*?)\n\s*\)/g      and      /<field>:\s*"([^"]*)"/
//
// That pair works because cv/chan-meng-cv-ats.typ and cv/sections/experience.typ
// are formatted to a documented hard rule (one argument per line, quoted fields
// first, closing ")" on its own line). The .docx/.txt generators need three
// things the pair cannot do:
//
//   1. survive NESTED delimiters — the `bullets:` array, `project-entry(...)[body]`,
//      and `#link(…)[…]` inside a `[…]` bullet;
//   2. not be fooled by delimiters inside STRING LITERALS — "Model Context
//      Protocol (MCP)", "Distinction, Dean's List (Top 5%)";
//   3. ignore COMMENTS — the entry point's comments quote Typst calls and CLI
//      flags verbatim, and a comment mentioning `role-line(` would otherwise
//      parse as a phantom entry.
//
// `stringArg` below is deliberately behaviour-compatible with check-cv-sync's
// inner field(), and `callBodies` is strictly MORE permissive than its call
// regex — anything the old regex matches, these match identically. That is what
// keeps the two parsers from ever disagreeing about role count because of
// formatting alone.
//
// NOTE: `stripComments` preserves byte offsets (comments become spaces, newlines
// survive), so an error raised against the stripped source still points at the
// right line of the original file.

const OPEN = { "(": ")", "[": "]", "{": "}" };
const CLOSE = { ")": "(", "]": "[", "}": "{" };

/**
 * Replace `// …` and `/* … *\/` with spaces, preserving length and newlines so
 * every offset into the result is still valid against the original source.
 * String-literal aware: the `//` in "https://chanmeng.org/" is not a comment.
 */
export function stripComments(src) {
  const out = src.split("");
  let i = 0;
  let inString = false;
  while (i < src.length) {
    const c = src[i];
    if (inString) {
      if (c === "\\") { i += 2; continue; }
      if (c === '"') inString = false;
      i++;
      continue;
    }
    if (c === '"') { inString = true; i++; continue; }
    if (c === "\\") { i += 2; continue; }
    if (c === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") { out[i] = " "; i++; }
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const stop = end === -1 ? src.length : end + 2;
      for (; i < stop; i++) if (src[i] !== "\n") out[i] = " ";
      continue;
    }
    i++;
  }
  return out.join("");
}

/**
 * Given `start` pointing at one of `(`, `[`, `{`, return the index just past the
 * matching close. Tracks all three delimiter kinds on one stack, skips string
 * literals, and treats `\X` as one atomic token so an escaped `\[` in markup can
 * never unbalance the count.
 */
export function scanBalanced(src, start) {
  if (!OPEN[src[start]]) {
    throw new Error(`scanBalanced: expected an opening delimiter at ${start}, found ${JSON.stringify(src[start])}`);
  }
  const stack = [];
  let i = start;
  let inString = false;
  while (i < src.length) {
    const c = src[i];
    if (inString) {
      if (c === "\\") { i += 2; continue; }
      if (c === '"') inString = false;
      i++;
      continue;
    }
    if (c === "\\") { i += 2; continue; }
    if (c === '"') { inString = true; i++; continue; }
    if (OPEN[c]) { stack.push(c); i++; continue; }
    if (CLOSE[c]) {
      if (stack.pop() !== CLOSE[c]) {
        throw new Error(`scanBalanced: mismatched ${c} at offset ${i}`);
      }
      i++;
      if (stack.length === 0) return i;
      continue;
    }
    i++;
  }
  throw new Error(`scanBalanced: unterminated delimiter opened at offset ${start}`);
}

/**
 * Every call to `name(` in `src`, as {start, argStart, end, body}. `start` is the
 * index of the name, `end` is just past the closing paren, `body` is the text
 * between the parens. Only matches at a token boundary, so searching "role-line"
 * never matches inside another identifier.
 */
export function callBodies(src, name) {
  const out = [];
  let from = 0;
  for (;;) {
    const at = src.indexOf(name, from);
    if (at === -1) return out;
    from = at + name.length;
    const before = at > 0 ? src[at - 1] : "";
    if (/[\w.-]/.test(before) && before !== "#") continue;
    let j = from;
    while (j < src.length && (src[j] === " " || src[j] === "\t")) j++;
    if (src[j] !== "(") continue;
    const end = scanBalanced(src, j);
    out.push({ start: at, argStart: j, end, body: src.slice(j + 1, end - 1) });
    from = end;
  }
}

/**
 * One named string argument out of a call body — the same technique as
 * check-cv-sync.mjs's field(), extended to tolerate an escaped quote.
 * Returns null when the argument is absent (vs "" when it is present and empty).
 */
export function stringArg(body, name) {
  const re = new RegExp(`(^|[\\s,(])${name}\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
  const m = body.match(re);
  return m ? m[2] : null;
}

/** Every string literal in `body`, in source order. */
export function stringLiterals(body) {
  const out = [];
  const re = /"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(body)) !== null) out.push(m[1]);
  return out;
}

/**
 * The next balanced `[…]` content block at or after `from`, skipping only
 * whitespace. Returns {inner, end} or null if the next non-space char is not `[`.
 */
export function nextContentBlock(src, from) {
  let i = from;
  while (i < src.length && /\s/.test(src[i])) i++;
  if (src[i] !== "[") return null;
  const end = scanBalanced(src, i);
  return { inner: src.slice(i + 1, end - 1), end };
}

/** Every top-level `[…]` block inside `body`, in source order. */
export function contentBlocks(body) {
  const out = [];
  let i = 0;
  let inString = false;
  while (i < body.length) {
    const c = body[i];
    if (inString) {
      if (c === "\\") { i += 2; continue; }
      if (c === '"') inString = false;
      i++;
      continue;
    }
    if (c === '"') { inString = true; i++; continue; }
    if (c === "\\") { i += 2; continue; }
    if (c === "[") {
      const end = scanBalanced(body, i);
      out.push(body.slice(i + 1, end - 1));
      i = end;
      continue;
    }
    if (c === "(" || c === "{") { i = scanBalanced(body, i); continue; }
    i++;
  }
  return out;
}

/**
 * Consume a top-level statement starting at `i` — everything up to the first
 * newline that lands at delimiter depth zero. Handles `#import "x": *`,
 * multi-line `#set document(…)`, and `#show a: it => block(…, {…},)` alike.
 * Returns the index just past the statement.
 */
export function consumeStatement(src, i) {
  let inString = false;
  const stack = [];
  while (i < src.length) {
    const c = src[i];
    if (inString) {
      if (c === "\\") { i += 2; continue; }
      if (c === '"') inString = false;
      i++;
      continue;
    }
    if (c === "\\") { i += 2; continue; }
    if (c === '"') { inString = true; i++; continue; }
    if (OPEN[c]) { stack.push(c); i++; continue; }
    if (CLOSE[c]) { stack.pop(); i++; continue; }
    if (c === "\n" && stack.length === 0) return i + 1;
    i++;
  }
  return i;
}

/** 1-indexed line number of `offset`, for error messages. */
export function lineOf(src, offset) {
  let line = 1;
  for (let i = 0; i < offset && i < src.length; i++) if (src[i] === "\n") line++;
  return line;
}
