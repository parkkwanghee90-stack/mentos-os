import fs from 'fs';
import katex from 'katex';

const dbPath = 'src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const mathSangUnits = [
  '고차방정식', '일차부등식', '이차부등식', '경우의수', '경우의 수',
  '점과좌표', '직선의방정식', '직선의 방정식', '원의방정식', '원의 방정식', '도형의이동', '도형의 이동', '행렬'
];

function normalizeMathText(raw) {
  if (!raw) return '';
  let txt = String(raw);
  txt = txt.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n');
  txt = txt.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$');
  txt = txt.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
  return txt;
}

const failPatterns = [
  { p: /\\alpha\b/, name: '\\alpha' },
  { p: /\\beta\b/, name: '\\beta' },
  { p: /\\gamma\b/, name: '\\gamma' },
  { p: /\\frac\b/, name: '\\frac' },
  { p: /\\sqrt\b/, name: '\\sqrt' },
  { p: /\\left\b/, name: '\\left' },
  { p: /\\right\b/, name: '\\right' },
  { p: /\\begin\b/, name: '\\begin' },
  { p: /\\end\b/, name: '\\end' },
  { p: /\\qquad\b/, name: '\\qquad' },
  { p: /\\cdots\b/, name: '\\cdots' },
  { p: /\\bigcirc\b/, name: '\\bigcirc' },
  { p: /\\neq\b/, name: '\\neq' },
  { p: /\\hline\b/, name: '\\hline' },
  { p: /\beq O\b/, name: 'eq O' },
  { p: /\beq B\b/, name: 'eq B' },
  { p: /\$([A-Za-z])/g, name: 'orphan leading $' },
];

const results = [];

for (const key of Object.keys(data)) {
  if (!mathSangUnits.some(u => key.includes(u))) continue;
  
  let rawText = data[key];
  if (!rawText) continue;

  let normText = normalizeMathText(rawText);

  // We must simulate the exact MathProblemRenderer parsing logic!
  // Because if it's broken during parsing, it will be exposed as raw text.
  
  // Actually, instead of just running the regex on the plain text, 
  // let's do exactly what MathProblemRenderer does to find what becomes plain text.
  const optStartIdx = normText.search(/[①②③④⑤]/);
  let body = optStartIdx === -1 ? normText : normText.slice(0, optStartIdx);
  const optBlock = optStartIdx === -1 ? '' : normText.slice(optStartIdx);

  const bodyLines = body.split(/\n/).filter(l => l.trim() !== '');
  
  let plainTextSegments = [];

  // body parsing
  for (const line of bodyLines) {
    const parts = [];
    const blockReg = /\$\$([\s\S]+?)\$\$/g;
    let bMatch;
    let lastIdx = 0;
    while ((bMatch = blockReg.exec(line)) !== null) {
      if (bMatch.index > lastIdx) {
        parts.push(line.slice(lastIdx, bMatch.index));
      }
      lastIdx = bMatch.index + bMatch[0].length;
    }
    if (lastIdx < line.length) {
      parts.push(line.slice(lastIdx));
    }

    for (const p of parts) {
      const reg = /\$((?:[^$\\]|\\[\s\S])+?)\$/g;
      let last = 0, m;
      while ((m = reg.exec(p)) !== null) {
        if (m.index > last) plainTextSegments.push(p.slice(last, m.index));
        last = m.index + m[0].length;
      }
      if (last < p.length) plainTextSegments.push(p.slice(last));
    }
  }

  // options parsing
  if (optBlock) {
    const reg = /(?:^|\n)([①②③④⑤])\s*([^\n①②③④⑤]*)/g;
    let m;
    while ((m = reg.exec(optBlock)) !== null) {
      let optText = m[2].trim();
      const oParts = [];
      const oBlockReg = /\$\$([\s\S]+?)\$\$/g;
      let bMatch;
      let lastIdx = 0;
      while ((bMatch = oBlockReg.exec(optText)) !== null) {
        if (bMatch.index > lastIdx) oParts.push(optText.slice(lastIdx, bMatch.index));
        lastIdx = bMatch.index + bMatch[0].length;
      }
      if (lastIdx < optText.length) oParts.push(optText.slice(lastIdx));

      for (const p of oParts) {
        const oReg = /\$((?:[^$\\]|\\[\s\S])+?)\$/g;
        let last = 0, om;
        while ((om = oReg.exec(p)) !== null) {
          if (om.index > last) plainTextSegments.push(p.slice(last, om.index));
          last = om.index + om[0].length;
        }
        if (last < p.length) plainTextSegments.push(p.slice(last));
      }
    }
  }

  const plainText = plainTextSegments.join(' ');

  let failedPatterns = [];
  for (const pat of failPatterns) {
    if (pat.p.test(plainText)) {
      failedPatterns.push(pat.name);
    }
  }

  // Check orphans
  const dollarCount = (normText.match(/\$/g) || []).length;
  if (dollarCount % 2 !== 0) {
    failedPatterns.push('orphan $');
  }

  const beginCount = (normText.match(/\\begin/g) || []).length;
  const endCount = (normText.match(/\\end/g) || []).length;
  if (beginCount !== endCount) {
    failedPatterns.push('unmatched begin/end');
  }
  
  const leftCount = (normText.match(/\\left\b/g) || []).length;
  const rightCount = (normText.match(/\\right\b/g) || []).length;
  if (leftCount !== rightCount) {
    failedPatterns.push('unmatched left/right');
  }

  if (failedPatterns.length > 0) {
    // Extract unit and problem id
    const m = key.match(/\/([^\/]+)\/([^\/]+)\.webp/);
    const unitStage = m ? m[1] : 'unknown';
    const num = m ? m[2] : 'unknown';

    results.push({
      unit: unitStage,
      stage: unitStage,
      number: num,
      sourceField: "math_problem_texts.json",
      detectedPattern: failedPatterns.join(', '),
      rawText: rawText,
      probableCause: "Multi-line math block split by \\n or missing delimiters",
      severity: "critical"
    });
  }
}

fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/math_upper_latex_render_failures_v2.json', JSON.stringify(results, null, 2), 'utf8');
console.log(`Found ${results.length} failures.`);
