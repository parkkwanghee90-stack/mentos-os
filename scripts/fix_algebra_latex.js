/**
 * fix_algebra_latex.js
 *
 * ESM runner that:
 *   A) Finds broken-LaTeX entries in public/data/math_problem_texts.json for algebra units,
 *      applies AUTO fixes (APPEND-CLOSE / REMOVE-STRAY) for SAFE entries, and writes back.
 *   B) Produces review lists for entries that could not be auto-fixed.
 *   C) Scans avs_answers.json algebra units for broken LaTeX (REVIEW-only, no writes).
 *   D) Writes markdown reports to docs/superpowers/specs/.
 */

import fs from 'fs';
import path from 'path';
import { autoFix } from '../src/lib/algebraFix/latexFix.js';
import { detectIssues } from '../src/lib/algebraFix/latexDetect.js';
import { isAlgebraKey } from '../src/lib/algebraFix/algebraUnits.js';

const ROOT = process.cwd();
const p = (r) => path.join(ROOT, r);
const readJson = (r) => JSON.parse(fs.readFileSync(p(r), 'utf8'));

// ─── Load data ────────────────────────────────────────────────────────────────
const mathTexts = readJson('public/data/math_problem_texts.json');
const avsAnswers = readJson('public/data/avs_answers.json');

// ─── Section A: math_problem_texts.json ───────────────────────────────────────
/** @type {{ key: string, before: string, after: string, rules: string[] }[]} */
const autoApplied = [];
/** @type {{ key: string, value: string, codes: string[], autoFixSuggestion: string|null }[]} */
const reviewA = [];

// Build nextA as a shallow clone — immutable pattern
const nextA = { ...mathTexts };

for (const [key, value] of Object.entries(mathTexts)) {
  if (typeof value !== 'string') continue;

  // Only algebra keys: the part before '/' is the unit key
  const unitPart = key.split('/')[0];
  if (!isAlgebraKey(unitPart)) continue;

  const before = detectIssues(value);
  if (before.length === 0) continue; // not broken

  const { output, applied } = autoFix(value);

  const after = detectIssues(output);
  const isAutoClean = output !== value && after.length === 0;

  if (isAutoClean) {
    autoApplied.push({ key, before: value, after: output, rules: applied });
    nextA[key] = output; // immutable update on shallow clone
  } else {
    reviewA.push({
      key,
      value,
      codes: before.map((i) => i.code),
      autoFixSuggestion: output !== value ? output : null,
    });
  }
}

// ─── Section B: avs_answers.json (REVIEW-only) ────────────────────────────────
/** @type {{ key: string, value: string, codes: string[] }[]} */
const reviewB = [];

for (const [unit, numMap] of Object.entries(avsAnswers)) {
  if (!isAlgebraKey(unit)) continue;
  if (!numMap || typeof numMap !== 'object') continue;

  for (const [num, val] of Object.entries(numMap)) {
    if (typeof val !== 'string') continue;
    const issues = detectIssues(val);
    if (issues.length > 0) {
      reviewB.push({
        key: `${unit}/${num}`,
        value: val,
        codes: issues.map((i) => i.code),
      });
    }
  }
}

// ─── Safety gate ──────────────────────────────────────────────────────────────
if (autoApplied.length > 100) {
  process.stderr.write(
    `[fix-latex] ABORT: autoApplied count=${autoApplied.length} is suspiciously large (>100). Logic check needed.\n`
  );
  process.exit(1);
}
if (autoApplied.length === 0 && reviewA.length === 0) {
  // No broken algebra entries found at all — worth noting but not aborting
  process.stderr.write(
    '[fix-latex] WARNING: zero broken algebra entries found in math_problem_texts.json.\n'
  );
}

// ─── Writes ───────────────────────────────────────────────────────────────────
const TEXTS_PATH = 'public/data/math_problem_texts.json';
const BAK_PATH = 'public/data/math_problem_texts.json.bak';

// Backup first
fs.copyFileSync(p(TEXTS_PATH), p(BAK_PATH));

// Write nextA (only AUTO-CLEAN values have changed)
fs.writeFileSync(p(TEXTS_PATH), JSON.stringify(nextA, null, 2), 'utf8');

// ─── Reports ──────────────────────────────────────────────────────────────────
const SPECS_DIR = 'docs/superpowers/specs';

// Helper: truncate string for display
const trunc = (s, n) => (s && s.length > n ? s.slice(0, n) + '…' : s ?? '');

// 1) diff report
const diffLines = [
  '# AUTO-applied LaTeX fixes — 2026-06-02',
  '',
  `Total AUTO-applied: **${autoApplied.length}**`,
  '',
];
for (const { key, before, after, rules } of autoApplied) {
  diffLines.push(`## ${key}`);
  diffLines.push(`- **Rules**: ${rules.join(', ')}`);
  diffLines.push(`- **Before**: \`${trunc(before, 120)}\``);
  diffLines.push(`- **After**: \`${trunc(after, 120)}\``);
  diffLines.push('');
}
fs.writeFileSync(
  p(`${SPECS_DIR}/2026-06-02-latex-fix-diff.md`),
  diffLines.join('\n'),
  'utf8'
);

// 2) review list
const reviewLines = [
  '# REVIEW-required LaTeX entries — 2026-06-02',
  '',
  `## Section A — math_problem_texts.json (${reviewA.length} entries)`,
  '',
];
for (const { key, codes, value, autoFixSuggestion } of reviewA) {
  reviewLines.push(`### ${key}`);
  reviewLines.push(`- **Codes**: ${codes.join(', ')}`);
  reviewLines.push(`- **Value**: \`${trunc(value, 160)}\``);
  if (autoFixSuggestion) {
    reviewLines.push(`- **AutoFix suggestion**: \`${trunc(autoFixSuggestion, 160)}\``);
  }
  reviewLines.push('');
}

reviewLines.push('');
reviewLines.push(`## Section B — avs_answers.json (${reviewB.length} entries)`);
reviewLines.push('');
for (const { key, codes, value } of reviewB) {
  reviewLines.push(`### ${key}`);
  reviewLines.push(`- **Codes**: ${codes.join(', ')}`);
  reviewLines.push(`- **Value**: \`${trunc(value, 160)}\``);
  reviewLines.push('');
}

fs.writeFileSync(
  p(`${SPECS_DIR}/2026-06-02-latex-review-list.md`),
  reviewLines.join('\n'),
  'utf8'
);

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(
  `[fix-latex] AUTO-applied=${autoApplied.length}, reviewA=${reviewA.length}, reviewB=${reviewB.length}`
);
