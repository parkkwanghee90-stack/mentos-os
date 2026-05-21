import fs from 'fs';
import path from 'path';
import katex from 'katex';

const dbPath = 'src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Fail patterns to check in PLAIN TEXT (after removing valid math blocks)
const failPatterns = [
  { p: /\\begin\b/, name: '\\begin' },
  { p: /\\end\b/, name: '\\end' },
  { p: /\\frac\b/, name: '\\frac' },
  { p: /\\sqrt\b/, name: '\\sqrt' },
  { p: /\\left\b/, name: '\\left' },
  { p: /\\right\b/, name: '\\right' },
  { p: /\\alpha\b/, name: '\\alpha' },
  { p: /\\beta\b/, name: '\\beta' },
  { p: /\\gamma\b/, name: '\\gamma' },
  { p: /\\qquad\b/, name: '\\qquad' },
  { p: /\\cdots\b/, name: '\\cdots' },
  { p: /\\bigcirc\b/, name: '\\bigcirc' },
  { p: /\\hline\b/, name: '\\hline' },
  { p: /\\pm\b/, name: '\\pm' },
  { p: /\\therefore\b/, name: '\\therefore' },
  { p: /\beq O\b/, name: 'eq O' },
  { p: /\beq B\b/, name: 'eq B' },
  { p: /\bsqrT\b/, name: 'sqrT' },
  { p: /\bsqlT\b/, name: 'sqlT' },
  { p: /(?<!\\)\\n/, name: '\\n (raw backslash n)' }, // literal \n without being parsed
];

function normalizeMathText(raw) {
  if (!raw) return '';
  let txt = String(raw);
  txt = txt.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n');
  txt = txt.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$');
  txt = txt.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
  return txt;
}

const results = [];

// Mimic the new MathProblemRenderer behavior (no \n splitting before extraction)
function extractPlainTextAndCheckKatex(text, sourceField, keyInfo) {
  if (!text) return '';
  let plainSegments = [];
  let katexErrors = [];
  let orphanDollars = false;

  const parts = [];
  const blockReg = /\$\$([\s\S]+?)\$\$/g;
  let bMatch;
  let lastIdx = 0;
  
  while ((bMatch = blockReg.exec(text)) !== null) {
    if (bMatch.index > lastIdx) {
      parts.push(text.slice(lastIdx, bMatch.index));
    }
    const bMath = bMatch[1];
    try {
      katex.renderToString(bMath, { throwOnError: true, displayMode: true });
    } catch (e) {
      katexErrors.push(`Block KaTeX Error: ${e.message}`);
    }
    lastIdx = bMatch.index + bMatch[0].length;
  }
  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx));
  }

  for (const p of parts) {
    const reg = /\$((?:[^$\\]|\\[\s\S])+?)\$/g;
    let last = 0, m;
    while ((m = reg.exec(p)) !== null) {
      if (m.index > last) plainSegments.push(p.slice(last, m.index));
      const mMath = m[1];
      try {
        katex.renderToString(mMath, { throwOnError: true, displayMode: false });
      } catch (e) {
        katexErrors.push(`Inline KaTeX Error: ${e.message}`);
      }
      last = m.index + m[0].length;
    }
    if (last < p.length) plainSegments.push(p.slice(last));
  }

  const plainText = plainSegments.join(' ');
  
  // Check for orphans
  const dollarCount = (text.match(/\$/g) || []).length;
  if (dollarCount % 2 !== 0) orphanDollars = true;

  let failedPatterns = [];
  for (const pat of failPatterns) {
    if (pat.p.test(plainText)) {
      failedPatterns.push(pat.name);
    }
  }

  if (orphanDollars) failedPatterns.push('orphan $');
  
  if (failedPatterns.length > 0 || katexErrors.length > 0) {
    results.push({
      unit: keyInfo.unit,
      stage: keyInfo.stage,
      number: keyInfo.number,
      sourceField: sourceField,
      detectedPattern: failedPatterns.join(', ') + (katexErrors.length > 0 ? (failedPatterns.length > 0 ? ', ' : '') + 'KaTeX Parse Error' : ''),
      katexErrors: katexErrors.length > 0 ? katexErrors : undefined,
      rawText: plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText,
      probableCause: katexErrors.length > 0 ? 'Invalid KaTeX syntax' : 'Raw LaTeX command exposed in plain text',
      severity: 'critical'
    });
  }
}

for (const key of Object.keys(data)) {
  let rawText = data[key];
  if (!rawText) continue;

  const mInfo = key.match(/([^\/]+)\/([^\/]+)\.webp/);
  const unitStage = mInfo ? mInfo[1] : key;
  const num = mInfo ? mInfo[2] : '';
  
  const keyInfo = { unit: unitStage, stage: unitStage, number: num };

  let normText = normalizeMathText(rawText);

  // Split into question and options block
  const optStartIdx = normText.search(/(?:^|\n)[①②③④⑤]/);
  let body = optStartIdx === -1 ? normText : normText.slice(0, optStartIdx);
  const optBlock = optStartIdx === -1 ? '' : normText.slice(optStartIdx);

  // Check question body
  extractPlainTextAndCheckKatex(body, 'question', keyInfo);

  // Check options
  if (optBlock) {
    const reg = /(?:^|\n)([①②③④⑤])\s*([^\n①②③④⑤]*)/g;
    let m;
    while ((m = reg.exec(optBlock)) !== null) {
      let optText = m[2].trim();
      extractPlainTextAndCheckKatex(optText, `option_${m[1]}`, keyInfo);
    }
  }
}

fs.mkdirSync('logs', { recursive: true });
fs.writeFileSync('logs/math_upper_math1_auto_latex_fail_report.json', JSON.stringify(results, null, 2), 'utf8');
console.log(`Found ${results.length} failures.`);
