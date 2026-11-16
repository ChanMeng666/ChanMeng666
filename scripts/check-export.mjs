#!/usr/bin/env node
// check:export - verifies the generated public registers. Runs with no access to the private ledger repo.
//   node scripts/check-export.mjs [dir]      dir = the repo root holding export-manifest.json (default: current directory)
// Fails (exit 1) when: a file in the manifest is missing or changed by hand (sha256), a register file is not in the
// manifest, a file lacks the GENERATED header, a key is outside export-allowlist.json, a third-party author's opening
// text is present, or a file name looks private.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Allowlist check for the public registers: a file may only contain keys listed in export/allowlist.json.
// Pure functions; the caller passes in the YAML module so this also runs inside ChanMeng666 (check-export-public.mjs).

const fileKey = (rel) => rel.replace(/\/posts\/\d{4}\.yaml$/, '/posts/*.yaml');

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const scalar = (v) => v === null || typeof v !== 'object';

// Returns a list of problems (strings). Empty list = the file is inside the allowlist.
function checkDoc(rel, doc, spec, ownAuthors) {
  const entry = spec.files[fileKey(rel)];
  if (!entry) return [`${rel}: this file is not in the allowlist`];
  const allow = new Set(entry.allow);
  const free = entry.free_maps || {};
  const problems = [];
  const walk = (node, p) => {
    if (Array.isArray(node)) { for (const x of node) walk(x, p + '[]'); return; }
    if (!isObj(node)) return;
    if (Object.prototype.hasOwnProperty.call(entry.free_maps || {}, p)) {
      const sub = free[p]; // null = values are scalars; array = values are objects with only these keys
      for (const [k, v] of Object.entries(node)) {
        if (sub === null) { if (!scalar(v)) problems.push(`${rel}: ${p}.<${k}> must be a scalar`); continue; }
        if (!isObj(v)) { problems.push(`${rel}: ${p}.<${k}> must be a map`); continue; }
        for (const [k2, v2] of Object.entries(v)) {
          if (!sub.includes(k2)) problems.push(`${rel}: key not in allowlist: ${p}.<data>.${k2}`);
          else if (!scalar(v2)) problems.push(`${rel}: ${p}.<${k}>.${k2} must be a scalar`);
        }
      }
      return;
    }
    // Quoted text of someone else's post is never public.
    if (typeof node.opens === 'string' && typeof node.author === 'string' && !ownAuthors.includes(node.author)) {
      problems.push(`${rel}: ${p || '(root)'} carries the opening text of a post by ${JSON.stringify(node.author)}`);
    }
    for (const [k, v] of Object.entries(node)) {
      const q = p ? `${p}.${k}` : k;
      if (!allow.has(q)) { problems.push(`${rel}: key not in allowlist: ${q}`); continue; }
      walk(v, q);
    }
  };
  walk(doc, '');
  return problems;
}

// Build an allowlist spec from documents that are known to be good (used once, and when the registers gain a field on purpose).
function inferSpec(docsByRel, freeMapSpec, ownAuthors) {
  const files = {};
  for (const [rel, doc] of Object.entries(docsByRel)) {
    const e = (files[fileKey(rel)] ||= { allow: new Set(), free_maps: {} });
    const walk = (node, p) => {
      if (Array.isArray(node)) { for (const x of node) walk(x, p + '[]'); return; }
      if (!isObj(node)) return;
      if (p in freeMapSpec) { e.free_maps[p] = freeMapSpec[p]; return; }
      for (const [k, v] of Object.entries(node)) { const q = p ? `${p}.${k}` : k; e.allow.add(q); walk(v, q); }
    };
    walk(doc, '');
  }
  const out = { version: 1, own_authors: ownAuthors, files: {} };
  for (const k of Object.keys(files).sort()) out.files[k] = { allow: [...files[k].allow].sort(), free_maps: files[k].free_maps };
  return out;
}

let yaml;
try { yaml = (await import('js-yaml')).default; } catch { throw new Error('check-export needs the js-yaml package'); }

const root = path.resolve(process.argv[2] || '.');
const problems = [];
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const REGISTER = /^(x\/(posts|account)\.yaml|linkedin\/(posts|account)\.yaml|linkedin\/posts\/\d{4}\.yaml|linkedin\/company\/archcanvas\/(posts|account)\.yaml|linkedin\/company\/archcanvas\/posts\/\d{4}\.yaml)$/;

if (!fs.existsSync(path.join(root, 'export-manifest.json'))) { console.error('check:export: export-manifest.json is missing'); process.exit(1); }
const manifest = JSON.parse(read('export-manifest.json'));
const spec = JSON.parse(read('export-allowlist.json'));
const listed = new Set(manifest.files.map((f) => f.path));

for (const f of manifest.files) {
  if (!fs.existsSync(path.join(root, f.path))) { problems.push(`${f.path}: listed in the manifest but missing`); continue; }
  const buf = fs.readFileSync(path.join(root, f.path));
  // line endings are not content: a checkout with autocrlf turns LF into CRLF, so hash the LF form
  const lf = Buffer.from(buf.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
  if (crypto.createHash('sha256').update(lf).digest('hex') !== f.sha256) problems.push(`${f.path}: changed since it was generated (sha256 differs); regenerate it, do not edit it`);
  if (/private|\.env|secret/i.test(f.path)) problems.push(`${f.path}: private-looking file name`);
  if (REGISTER.test(f.path)) {
    const text = buf.toString('utf8').replace(/\r\n/g, '\n');
    if (!/^# GENERATED from chanmeng-social-ledger@\S+ by export-public\. Do not edit\.\n/.test(text)) problems.push(`${f.path}: missing the GENERATED header`);
    try { problems.push(...checkDoc(f.path, yaml.load(text), spec, spec.own_authors)); } catch (e) { problems.push(`${f.path}: does not parse (${e.message})`); }
  }
}
for (const sub of ['x', 'linkedin']) {
  if (!fs.existsSync(path.join(root, sub))) continue;
  for (const f of fs.readdirSync(path.join(root, sub), { recursive: true })) {
    const rel = `${sub}/${String(f).split(path.sep).join('/')}`;
    if (REGISTER.test(rel) && !listed.has(rel)) problems.push(`${rel}: a register file that is not in the manifest`);
    if (/\.private\./.test(rel)) problems.push(`${rel}: a private file inside the public repo`);
  }
}
if (problems.length) { console.error(`check:export: ${problems.length} problem(s)\n  ${problems.slice(0, 40).join('\n  ')}`); process.exit(1); }
console.log(`check:export: ok (${manifest.files.length} files, ledger commit ${manifest.ledger_commit})`);
