import fs from 'fs';
import path from 'path';

const dbPath = 'src/data/math_problem_texts.json';
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// The list of units to process
const mathSangUnits = [
  '고차방정식', '일차부등식', '이차부등식', '경우의수', '경우의 수',
  '점과좌표', '직선의방정식', '직선의 방정식', '원의방정식', '원의 방정식', '도형의이동', '도형의 이동', '행렬',
  '지수함수', '로그함수', '삼각함수', '수열', '수학1'
];

let fixedProblemCount = 0;
let fixedHintFileCount = 0;

function fixPlainText(plain) {
  let fixed = plain;

  // 1. Fix known broken sequences
  fixed = fixed.replace(/\beq O\b/g, '\\neq O');
  fixed = fixed.replace(/\beq B\b/g, '\\neq B');
  fixed = fixed.replace(/\bsqrT\b/g, '\\sqrt');
  fixed = fixed.replace(/\bsqlT\b/g, '\\sqrt');

  // 2. Remove all orphan $ in plain text (we will re-wrap things correctly)
  fixed = fixed.replace(/\$/g, '');

  // 3. Find sequences of characters that are typical math characters and wrap them in $$
  // Exclude Hangul (\u3131-\uD79D), options (①②③④⑤), newlines, and some common punctuations that shouldn't start/end math
  const mathCharsRegex = /([^\u3131-\uD79D\n①②③④⑤]+)/g;

  fixed = fixed.replace(mathCharsRegex, (match) => {
    // Only wrap if it contains a backslash command
    if (match.includes('\\') && /[a-zA-Z]/.test(match)) {
      let m = match;
      let leading = '';
      let trailing = '';
      
      // Extract leading spaces
      const leadMatch = m.match(/^([\s]*)(.*)$/);
      if (leadMatch) {
        leading = leadMatch[1];
        m = leadMatch[2];
      }
      
      // Extract trailing spaces and punctuation (like period, comma, question mark)
      const trailMatch = m.match(/^(.*?)([\s\.\,\?]*)$/);
      if (trailMatch) {
        m = trailMatch[1];
        trailing = trailMatch[2];
      }

      if (m.includes('\\')) {
        // If the math block is just a single \therefore with no other math, wrap it.
        return `${leading}$${m}$${trailing}`;
      }
    }
    return match;
  });

  return fixed;
}

// Function to process a string: splits it into valid math blocks and plain text, then fixes plain text
function processAndFixString(text) {
  if (!text) return text;
  
  // We need to carefully split by $$ and $, fix the outside parts, and then reassemble.
  // We mimic the exact parsing logic to separate them.
  let txt = String(text);
  
  // We shouldn't mess with \\n replacing here, we just work on the raw string.
  // Actually, MathProblemRenderer does replace before parsing.
  // But we want to modify the RAW string and save it.
  // It's safer to just do a regex replace on the raw string for naked commands?
  // No, if we do a global regex replace, we might wrap things inside already valid \[ \] or $$ !
  // So we MUST NOT touch anything inside \[ \], \( \), $$, $.

  const segments = [];
  const regex = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]+?\$\$|\$(?:[^$\\]|\\[\s\S])+?\$)/g;
  
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(txt)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ isMath: false, val: txt.slice(lastIndex, match.index) });
    }
    segments.push({ isMath: true, val: match[0] });
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < txt.length) {
    segments.push({ isMath: false, val: txt.slice(lastIndex) });
  }

  // Now fix only the non-math segments
  for (let i = 0; i < segments.length; i++) {
    if (!segments[i].isMath) {
      segments[i].val = fixPlainText(segments[i].val);
    }
  }

  return segments.map(s => s.val).join('');
}

// 1. Process math_problem_texts.json
for (const key of Object.keys(data)) {
  if (!mathSangUnits.some(u => key.includes(u))) continue;
  
  let rawText = data[key];
  if (!rawText) continue;

  const fixedText = processAndFixString(rawText);
  if (fixedText !== rawText) {
    data[key] = fixedText;
    fixedProblemCount++;
  }
}
fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');

// 2. Process Hints JSONs
for (const key of Object.keys(data)) {
  if (!mathSangUnits.some(u => key.includes(u))) continue;
  
  const mInfo = key.match(/([^\/]+)\/([^\/]+)\.webp/);
  if (!mInfo) continue;
  
  const unitStage = mInfo[1];
  const num = mInfo[2];
  
  const hintPath = path.join('public/math_hints', unitStage, `${num}.json`);
  if (fs.existsSync(hintPath)) {
    try {
      let hintData = JSON.parse(fs.readFileSync(hintPath, 'utf8'));
      let changed = false;
      if (Array.isArray(hintData)) {
        hintData.forEach((step) => {
          if (step.text) {
            const f = processAndFixString(step.text);
            if (f !== step.text) { step.text = f; changed = true; }
          }
          if (step.explanation) {
            const f = processAndFixString(step.explanation);
            if (f !== step.explanation) { step.explanation = f; changed = true; }
          }
          if (step.math) {
            const f = processAndFixString(step.math);
            if (f !== step.math) { step.math = f; changed = true; }
          }
        });
      }
      if (changed) {
        fs.writeFileSync(hintPath, JSON.stringify(hintData, null, 2), 'utf8');
        fixedHintFileCount++;
      }
    } catch (e) {}
  }
}

console.log(`Fixed problems in DB: ${fixedProblemCount}`);
console.log(`Fixed Hint JSON files: ${fixedHintFileCount}`);
