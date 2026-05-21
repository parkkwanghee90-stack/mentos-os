import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DICT = path.join(__dirname, '../src/data/math_problem_texts.json');
const dict = JSON.parse(fs.readFileSync(DICT, 'utf-8'));

// Convert literal \\n in stored strings to real newlines
// Also convert \\( \\) to $ $
function normalizeText(text) {
  if (!text) return text;
  let t = text;
  // Replace literal \n (two chars: backslash + n) with real newline
  t = t.replace(/\\n/g, '\n');
  // Replace \( and \) (literal backslash-paren) with $ (if not already $)
  t = t.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
  // Replace \[ and \] with $$
  t = t.replace(/\\\[/g, '$$').replace(/\\\]/g, '$$');
  return t;
}

function hasLiteralBackslashN(text) {
  // Check if text contains the 2-char sequence \n (not an actual newline)
  return text.includes('\\n');
}

function hasLongLine(text) {
  return text.split('\n').some(l => l.length > 120);
}

// Process all problem texts in dict
let fixedCount = 0;
for (const [key, text] of Object.entries(dict)) {
  if (!text || key.includes('a.webp')) continue;
  
  if (hasLiteralBackslashN(text)) {
    const fixed = normalizeText(text);
    dict[key] = fixed;
    fixedCount++;
    if (fixedCount <= 5) {
      console.log('Fixed:', key, '(maxLine:', Math.max(...fixed.split('\n').map(l=>l.length)), ')');
    }
  }
}

console.log(`\n총 ${fixedCount}개 literal \\n → real newline 변환`);

// Now check remaining long lines
const problematic = [];
for (const [key, text] of Object.entries(dict)) {
  if (!text || key.includes('a.webp')) continue;
  if (hasLongLine(text)) {
    const max = Math.max(...text.split('\n').map(l => l.length));
    problematic.push({ key, max });
  }
}

problematic.sort((a,b) => b.max - a.max);
console.log('\n남은 긴 줄 파일들:');
problematic.forEach(({key, max}) => console.log(`  ${key}: ${max}자`));

fs.writeFileSync(DICT, JSON.stringify(dict, null, 2), 'utf-8');
console.log('\n저장 완료');
