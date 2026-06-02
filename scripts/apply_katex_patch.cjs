// Generic, verified patch applier for KaTeX repairs reconstructed from ORIGINAL images.
// A patch module exports an array of rules:
//   { keys: [...], replaces: [[find, repl], ...] }   // surgical find/replace on original value
//   { keys: [...], value: "..." }                     // wholesale replacement
// For each touched key, the result MUST render with 0 KaTeX throws or the whole patch is ABORTED (no write).
//   node scripts/apply_katex_patch.cjs scratch/patches/<unit>.cjs [--write]
const fs = require('fs');
const katex = require('../node_modules/katex');
const TARGET = 'public/data/math_problem_texts.json';
const PATCH = process.argv[2];
const WRITE = process.argv.includes('--write');
if (!PATCH) { console.error('usage: node scripts/apply_katex_patch.cjs <patch.cjs> [--write]'); process.exit(1); }
const rules = require(require('path').resolve(process.cwd(), PATCH));
const data = JSON.parse(fs.readFileSync(TARGET, 'utf8'));

function normalizeMathText(raw) {
  if (!raw) return '';
  let txt = String(raw);
  txt = txt.replace(/\n(?=eq|abla|u|otin|subseteq|supset|Rightarrow|Leftrightarrow|i|olimits|ormalfont|ewline|exists)/g, '\\n').replace(/\\\\n/g, '\n').replace(/\\n(?!eq|abla|u|otin|subseteq|supset|Rightarrow|Leftrightarrow|i|olimits|ormalfont|ewline|exists)/g, '\n');
  txt = txt.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$1$$$$').replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
  txt = txt.replace(/\$\$([\s\S]+?)\$\$/g, (m, inner) => (inner.includes('\\begin{aligned}') || inner.includes('\\begin{cases}') || inner.includes('\\begin{array}')) ? m : (inner.includes('\\\\') ? `$$ \\begin{aligned} ${inner} \\end{aligned} $$` : m));
  return txt;
}
console.warn = () => {}; console.error = () => {};
function isBalanced(raw) { const n = normalizeMathText(raw); const noB = n.replace(/\$\$[\s\S]*?\$\$/g, ''); return ((noB.match(/(?<!\\)\$/g) || []).length) % 2 === 0; }
function thr(b, d) { try { katex.renderToString(b, { throwOnError: true, displayMode: d, strict: false }); return false; } catch { return true; } }
function countFails(val) {
  const norm = normalizeMathText(val); let f = 0;
  const seg = t => { if (!t) return; const br = /\$\$([\s\S]+?)\$\$/g; let b, last = 0; const ch = []; while ((b = br.exec(t))) { if (b.index > last) ch.push(t.slice(last, b.index)); if (thr(b[1], true)) f++; last = b.index + b[0].length; } if (last < t.length) ch.push(t.slice(last)); const il = /\$((?:[^$\\]|\\[\s\S])+?)\$/g; for (const c of ch) { let m; while ((m = il.exec(c))) if (thr(m[1], false)) f++; } };
  const os = norm.search(/[①②③④⑤]/); if (os === -1) seg(norm); else { seg(norm.slice(0, os)); const ob = norm.slice(os); const r = /(①|②|③|④|⑤)\s*([^\n①②③④⑤]*)/g; let m; while ((m = r.exec(ob))) seg(m[2]); }
  return f;
}

const out = { ...data };
const results = []; let aborted = false;
for (const rule of rules) {
  for (const key of rule.keys) {
    if (!(key in data)) { console.log(`  ⚠ key absent: ${key}`); continue; }
    const before = countFails(data[key]);
    let next;
    if ('value' in rule) next = rule.value;
    else { next = data[key]; for (const [find, repl] of rule.replaces) { if (!next.includes(find)) { console.log(`  ⚠ find-string not present in ${key}: ${JSON.stringify(find.slice(0,40))}`); } next = next.split(find).join(repl); } }
    const after = countFails(next);
    const bal = isBalanced(next);
    results.push({ key, before, after, changed: next !== data[key], bal });
    if (after !== 0) { console.log(`  ✗ ${key}: still ${after} fails after patch — ABORT`); aborted = true; }
    else if (!bal) { console.log(`  ✗ ${key}: unbalanced $ after patch — ABORT`); aborted = true; }
    else out[key] = next;
  }
}
console.log('\n=== PATCH', PATCH, WRITE ? '(WRITE)' : '(DRY)', '===');
for (const r of results) console.log(`  ${r.changed ? '✎' : ' '} ${r.key}: ${r.before} -> ${r.after}`);
if (aborted) { console.log('\n❌ ABORTED — some keys still fail. No write.'); process.exit(1); }
console.log(`\n✓ all ${results.length} keys render clean (0 throws).`);
if (WRITE) { fs.writeFileSync(TARGET, JSON.stringify(out, null, 2), 'utf8'); console.log('WROTE', TARGET); }
else console.log('(dry-run; pass --write to persist)');
