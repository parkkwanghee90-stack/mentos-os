// Conservative KaTeX repair with PER-ENTRY verification.
// - Only touches entries that currently FAIL to render.
// - Applies a fix only if it STRICTLY reduces the throwing-segment count for that entry.
// - Never modifies entries that already render cleanly (zero risk to good content).
// Dry-run by default; pass --write to persist.
const fs = require('fs');
const katex = require('../node_modules/katex');

const TARGET = 'public/data/math_problem_texts.json';
const WRITE = process.argv.includes('--write');
const data = JSON.parse(fs.readFileSync(TARGET, 'utf8'));

// ---- ported verbatim from MathProblemRenderer.normalizeMathText ----
function normalizeMathText(raw) {
  if (!raw) return '';
  let txt = String(raw);
  txt = txt
    .replace(/\n(?=eq|abla|u|otin|subseteq|supset|Rightarrow|Leftrightarrow|i|olimits|ormalfont|ewline|exists)/g, '\\n')
    .replace(/\\\\n/g, '\n')
    .replace(/\\n(?!eq|abla|u|otin|subseteq|supset|Rightarrow|Leftrightarrow|i|olimits|ormalfont|ewline|exists)/g, '\n');
  txt = txt.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$1$$$$');
  txt = txt.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
  txt = txt.replace(/\$\$([\s\S]+?)\$\$/g, (match, inner) => {
    if (inner.includes('\\begin{aligned}') || inner.includes('\\begin{cases}') || inner.includes('\\begin{array}')) return match;
    if (inner.includes('\\\\')) return `$$ \\begin{aligned} ${inner} \\end{aligned} $$`;
    return match;
  });
  return txt;
}
console.warn = () => {}; console.error = () => {};
function throws(body, display) { try { katex.renderToString(body, { throwOnError: true, displayMode: display, strict: false }); return false; } catch { return true; } }
function countFails(val) {
  const norm = normalizeMathText(val);
  let fails = 0;
  const seg = (text) => {
    if (!text) return;
    const blockReg = /\$\$([\s\S]+?)\$\$/g; let b, last = 0; const chunks = [];
    while ((b = blockReg.exec(text)) !== null) { if (b.index > last) chunks.push(text.slice(last, b.index)); if (throws(b[1], true)) fails++; last = b.index + b[0].length; }
    if (last < text.length) chunks.push(text.slice(last));
    const inl = /\$((?:[^$\\]|\\[\s\S])+?)\$/g;
    for (const c of chunks) { let m; while ((m = inl.exec(c)) !== null) if (throws(m[1], false)) fails++; }
  };
  const optStart = norm.search(/[①②③④⑤]/);
  if (optStart === -1) seg(norm);
  else { seg(norm.slice(0, optStart)); const ob = norm.slice(optStart); const r = /(①|②|③|④|⑤)\s*([^\n①②③④⑤]*)/g; let m; while ((m = r.exec(ob)) !== null) seg(m[2]); }
  return fails;
}

// ---- conservative transforms (target observed corruption only) ----
// T1: stray $ inside \text{...} (KaTeX forbids $ in text mode)
function fixDollarInText(s) {
  return s.replace(/\\text\{([^{}]*)\}/g, (full, inner) => inner.includes('$') ? '\\text{' + inner.replace(/\$/g, '').replace(/\s+\}/, '}').trimEnd() + '}' : full);
}
// T2: stray $ immediately adjacent to LaTeX delimiters \( \) \[ \]
function fixDollarAdjacentDelims(s) {
  return s
    .replace(/\$\s*(\\[([])/g, '$1')   // $\(  /  $\[
    .replace(/(\\[)\]])\s*\$/g, '$1'); // \)$  /  \]$
}
// T3: stray $ hugging a brace group (observed: \frac{$\sqrt{5}$}{3} -> \frac{\sqrt{5}}{3})
function fixDollarHuggingBraces(s) {
  return s
    .replace(/\{\s*\$(?=\\?[A-Za-z\\])/g, '{') // {$\sqrt  -> {\sqrt
    .replace(/\$\s*\}/g, '}');                 // 5$}      -> 5}
}
function repair(s) { return fixDollarHuggingBraces(fixDollarAdjacentDelims(fixDollarInText(s))); }

let touched = 0, totalBefore = 0, totalAfter = 0;
const fixed = [], residual = [];
const out = { ...data };
for (const [key, val] of Object.entries(data)) {
  if (typeof val !== 'string') continue;
  const before = countFails(val);
  if (before === 0) continue;            // never touch clean entries
  totalBefore += before;
  const cand = repair(val);
  const after = cand === val ? before : countFails(cand);
  if (after < before) {
    out[key] = cand; touched++; totalAfter += after;
    fixed.push({ key, before, after });
    if (after > 0) residual.push({ key, remaining: after });
  } else {
    totalAfter += before;
    residual.push({ key, remaining: before });
  }
}

console.log('=== CONSERVATIVE KaTeX REPAIR', WRITE ? '(WRITE)' : '(DRY-RUN)', '===');
console.log('entries with failures:', fixed.length + residual.filter(r => !fixed.find(f => f.key === r.key)).length);
console.log('entries improved:', touched);
console.log('throwing segments: before', totalBefore, '-> after', totalAfter, `(fixed ${totalBefore - totalAfter})`);
console.log('entries still broken after repair:', residual.length);
console.log('\n--- improved (first 20) ---');
for (const f of fixed.slice(0, 20)) console.log(`  ${f.key}: ${f.before} -> ${f.after}`);
console.log('\n--- residual needing MANUAL review (first 40) ---');
for (const r of residual.slice(0, 40)) console.log(`  [${r.remaining}] ${r.key}`);

fs.writeFileSync('scratch/katex_repair_report.json', JSON.stringify({ fixed, residual }, null, 2));
console.log('\nreport -> scratch/katex_repair_report.json');
if (WRITE) { fs.writeFileSync(TARGET, JSON.stringify(out, null, 2) + (data && '\n'.repeat(0)), 'utf8'); console.log('WROTE', TARGET); }
