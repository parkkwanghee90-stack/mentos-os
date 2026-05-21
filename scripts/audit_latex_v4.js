import fs from 'fs';
import path from 'path';
import katex from 'katex';

const dbPath = 'src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const mathSangUnits = [
  '고차방정식', '일차부등식', '이차부등식', '경우의수', '경우의 수',
  '점과좌표', '직선의방정식', '직선의 방정식', '원의방정식', '원의 방정식', '도형의이동', '도형의 이동', '행렬',
  '지수함수', '로그함수', '삼각함수', '수열', '수학1'
];

const failPatterns = [
  { p: /\\frac\b/, name: '\\frac' },
  { p: /\\sqrt\b/, name: '\\sqrt' },
  { p: /\\alpha\b/, name: '\\alpha' },
  { p: /\\beta\b/, name: '\\beta' },
  { p: /\\gamma\b/, name: '\\gamma' },
  { p: /\\left\b/, name: '\\left' },
  { p: /\\right\b/, name: '\\right' },
  { p: /\\begin\b/, name: '\\begin' },
  { p: /\\end\b/, name: '\\end' },
  { p: /\\qquad\b/, name: '\\qquad' },
  { p: /\\cdots\b/, name: '\\cdots' },
  { p: /\\bigcirc\b/, name: '\\bigcirc' },
  { p: /\\neq\b/, name: '\\neq' },
  { p: /\\pm\b/, name: '\\pm' },
  { p: /\\therefore\b/, name: '\\therefore' },
  { p: /\\matrix\b/, name: '\\matrix' },
  { p: /\\cases\b/, name: '\\cases' },
  { p: /\\array\b/, name: '\\array' },
  { p: /\\hline\b/, name: '\\hline' },
  { p: /\beq O\b/, name: 'eq O' },
  { p: /\beq B\b/, name: 'eq B' },
  { p: /\bsqrT\b/, name: 'sqrT' },
  { p: /\bsqlT\b/, name: 'sqlT' }
];

function normalizeMathText(raw) {
  if (!raw) return '';
  let txt = String(raw);
  txt = txt.replace(/\\\\n/g, '\n').replace(/\\n(?!eq\b)/g, '\n');
  txt = txt.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$');
  txt = txt.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
  return txt;
}

const results = [];

function checkText(rawInput, sourceField, keyInfo) {
  if (!rawInput) return;
  const text = normalizeMathText(rawInput);
  
  let plainSegments = [];
  let katexErrors = [];

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
      katexErrors.push(`Block Error: ${e.message}`);
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
        katexErrors.push(`Inline Error: ${e.message}`);
      }
      last = m.index + m[0].length;
    }
    if (last < p.length) plainSegments.push(p.slice(last));
  }

  const plainText = plainSegments.join(' ');
  
  let failedPatterns = [];
  for (const pat of failPatterns) {
    if (pat.p.test(plainText)) {
      failedPatterns.push(pat.name);
    }
  }

  const dollarCount = (text.match(/\$/g) || []).length;
  const doubleDollarCount = (text.match(/\$\$/g) || []).length;
  const singleDollarCount = dollarCount - (doubleDollarCount * 2);

  if (singleDollarCount % 2 !== 0) failedPatterns.push('orphan $');
  if (doubleDollarCount % 2 !== 0) failedPatterns.push('orphan $$');

  if (plainText.match(/(?:^|[^\\])\$/)) failedPatterns.push('leading/trailing/orphan $ in plain text');

  const beginCount = (text.match(/\\begin/g) || []).length;
  const endCount = (text.match(/\\end/g) || []).length;
  if (beginCount !== endCount) failedPatterns.push('unmatched \\begin/\\end');
  
  const leftCount = (text.match(/\\left\b/g) || []).length;
  const rightCount = (text.match(/\\right\b/g) || []).length;
  if (leftCount !== rightCount) failedPatterns.push('unmatched \\left/\\right');

  if (failedPatterns.length > 0 || katexErrors.length > 0) {
    const severity = sourceField.includes('option') || sourceField.includes('choice') ? 'critical' : 'major';
    results.push({
      unit: keyInfo.unit,
      stage: keyInfo.stage,
      number: keyInfo.number,
      sourceField: sourceField,
      detectedPattern: failedPatterns.join(', ') + (katexErrors.length > 0 ? ' [KaTeX Error]' : ''),
      rawSnippet: plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText,
      severity: severity
    });
  }
}

for (const key of Object.keys(data)) {
  if (!mathSangUnits.some(u => key.includes(u))) continue;

  let rawText = data[key];
  if (!rawText) continue;

  const mInfo = key.match(/([^\/]+)\/([^\/]+)\.webp/);
  const unitStage = mInfo ? mInfo[1] : key;
  const num = mInfo ? mInfo[2] : '';
  const keyInfo = { unit: unitStage, stage: unitStage, number: num };

  let normText = normalizeMathText(rawText);

  // Extract question and options
  const optStartIdx = normText.search(/(?:^|\n)[①②③④⑤]/);
  let body = optStartIdx === -1 ? normText : normText.slice(0, optStartIdx);
  const optBlock = optStartIdx === -1 ? '' : normText.slice(optStartIdx);

  checkText(body, 'question', keyInfo);

  if (optBlock) {
    const reg = /(?:^|\n)([①②③④⑤])\s*([^\n①②③④⑤]*)/g;
    let m;
    while ((m = reg.exec(optBlock)) !== null) {
      checkText(m[2].trim(), `choice_${m[1]}`, keyInfo);
    }
  }

  // Check Hints JSON file if it exists
  const hintPath = path.join('public/math_hints', unitStage, `${num}.json`);
  if (fs.existsSync(hintPath)) {
    try {
      const hintData = JSON.parse(fs.readFileSync(hintPath, 'utf8'));
      if (Array.isArray(hintData)) {
        hintData.forEach((step, idx) => {
          if (step.text) checkText(step.text, `hint_step_${idx}_text`, keyInfo);
          if (step.explanation) checkText(step.explanation, `hint_step_${idx}_explanation`, keyInfo);
          if (step.math) checkText(step.math, `hint_step_${idx}_math`, keyInfo);
        });
      }
    } catch (e) {
      // Ignore parse errors or read errors
    }
  }
}

fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/math_upper_math1_plaintext_latex_failures.json', JSON.stringify(results, null, 2), 'utf8');
console.log(`Found ${results.length} failures.`);
