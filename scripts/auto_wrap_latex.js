import fs from 'fs';
import path from 'path';

const dbPath = 'src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const mathSangUnits = [
  '고차방정식', '일차부등식', '이차부등식', '경우의수', '경우의 수',
  '점과좌표', '직선의방정식', '직선의 방정식', '원의방정식', '원의 방정식', '도형의이동', '도형의 이동', '행렬',
  '지수함수', '로그함수', '삼각함수', '수열', '수학1'
];

let fixedCount = 0;

function fixPlainText(plain) {
  let fixed = plain;

  // 1. Fix corrupted \neq
  fixed = fixed.replace(/\beq O\b/g, '$\\neq O$');
  fixed = fixed.replace(/\beq B\b/g, '$\\neq B$');
  fixed = fixed.replace(/\bsqrT\b/g, '$\\sqrt{T}$');
  fixed = fixed.replace(/\bsqlT\b/g, '$\\sqrt{T}$');

  // 2. Remove isolated orphan $ (if they are alone or leading/trailing with no match)
  // We'll strip all $ from plain text since by definition plain text shouldn't have valid $ pairs
  fixed = fixed.replace(/\$/g, '');

  // 3. Wrap specific commands
  // \frac{...}{...}
  fixed = fixed.replace(/\\frac\s*\{[^{}]*\}\s*\{[^{}]*\}/g, m => `$${m}$`);
  // nested frac depth 1 (heuristic)
  fixed = fixed.replace(/\\frac\s*\{[^{}]*\}\s*\{[^{}]*\}/g, m => `$${m}$`); // won't match if already wrapped because $ was removed? wait, we removed $ before this!

  // \sqrt{...}
  fixed = fixed.replace(/\\sqrt\s*(?:\[[^\]]*\])?\s*\{[^{}]*\}/g, m => `$${m}$`);
  
  // \left( ... \right)
  fixed = fixed.replace(/\\left[\(\[\{][\s\S]*?\\right[\)\]\}]/g, m => `$${m}$`);

  // \begin{...} ... \end{...}
  fixed = fixed.replace(/\\begin\{([^}]+)\}[\s\S]*?\\end\{\1\}/g, m => `$$${m}$$`);

  // Standalone Greek/Symbols
  fixed = fixed.replace(/\\(?:alpha|beta|gamma|theta|pi|cdots|bigcirc|pm|neq|therefore|qquad|hline)\b/g, m => `$${m}$`);

  // Wrap connected alphanumeric and symbols around $...$
  // To merge adjacent math blocks: $a$ $b$ -> $a b$
  fixed = fixed.replace(/\$\s*\$/g, ' ');

  return fixed;
}

function processAndFixString(text) {
  if (!text) return text;
  
  const segments = [];
  // Use non-greedy match for $$ and $
  const regex = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]+?\$\$|\$(?:[^$\\]|\\[\s\S])+?\$)/g;
  
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ isMath: false, val: text.slice(lastIndex, match.index) });
    }
    segments.push({ isMath: true, val: match[0] });
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < text.length) {
    segments.push({ isMath: false, val: text.slice(lastIndex) });
  }

  for (let i = 0; i < segments.length; i++) {
    if (!segments[i].isMath) {
      segments[i].val = fixPlainText(segments[i].val);
    }
  }

  return segments.map(s => s.val).join('');
}

for (const key of Object.keys(data)) {
  if (!mathSangUnits.some(u => key.includes(u))) continue;
  
  let rawText = data[key];
  if (!rawText) continue;

  const fixedText = processAndFixString(rawText);
  if (fixedText !== rawText) {
    data[key] = fixedText;
    fixedCount++;
  }
}

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`Fixed problems in DB: ${fixedCount}`);
