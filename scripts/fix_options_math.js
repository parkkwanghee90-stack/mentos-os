/**
 * fix_options_math.js
 * 점과좌표 2단계 전수검수: 보기 수식 $$ 래핑 + 문제 줄바꿈 자동 정규화
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DICT_JSON = path.join(__dirname, '../src/data/math_problem_texts.json');
const LESSON_JSON = path.join(__dirname, '../src/data/lessons/math/h_math1/week_1/lesson_01.json');
const FOLDER_KEY_PREFIX = '(5)점과좌표 개념2단계(44)p17 1+1(쌍둥이)';

// Wrap a single option value in $ if it contains LaTeX but isn't already wrapped
function wrapOptionMath(val) {
  val = val.trim();
  if (!val) return val;
  // Already fully wrapped in $ — leave alone
  if (val.startsWith('$') && val.endsWith('$')) return val;
  
  // Contains LaTeX commands or math symbols not wrapped
  const hasMath = /\\\\[a-zA-Z{(]|[_^]|\{|\}/.test(val) || /\d+\\\\/.test(val);
  if (hasMath) {
    // It might be mixed: "2\\sqrt{2}" -> "$2\\sqrt{2}$"
    // Or pure text "4" -> "4" (leave as is, no dollar signs needed)
    // But if it's like "D(1, 5)" or "(-3, 4)" it's coordinate — wrap in $
    const hasCoordinate = /^\s*[A-Z]?\s*[\(\-]/.test(val) && /,/.test(val);
    if (hasCoordinate) return `$${val}$`;
    return `$${val}$`;
  }
  
  // Has coordinate-style content like "(-3, 4)" or "D(1, 5)"
  if (/[A-Za-z]?\s*\([-\d\., ]+\)/.test(val)) {
    return `$${val}$`;
  }
  
  // Pure number or simple text
  return val;
}

// Process option block: wrap each option's math content in $
function fixOptions(optBlock) {
  // Match each option line - handle both newline-separated and inline options
  // Preserve space between circle and value
  return optBlock.replace(/(①|②|③|④|⑤)\s*([^\n①②③④⑤]+)/g, (full, circle, val) => {
    const fixed = wrapOptionMath(val.trim());
    return `${circle} ${fixed}`;
  });
}

// Smart line-break for long problem bodies
function addLineBreaks(body) {
  // Add \n after sentence-ending patterns in Korean math problems
  // After "이다." / "하자." / "이므로" / "있다." when followed by more text
  let result = body;
  
  // After sentence endings followed by more Korean content (but not if already has newline)
  result = result.replace(/([이하]다\.)(\s+)(?=[가-힣A-Z])/g, '$1\n');
  result = result.replace(/(하자\.)(\s+)(?=[가-힣A-Z])/g, '$1\n');
  result = result.replace(/(있다\.)(\s+)(?=[가-힣A-Z])/g, '$1\n');
  result = result.replace(/(구하시오\.)(\s+)/g, '$1\n');
  
  // After long parenthetical conditions — break after closing ) when followed by Korean
  // e.g. "점이다) 이때" -> "점이다)\n이때"
  result = result.replace(/(\))\s+(이때|이 때|단,|여기서|다음)/g, '$1\n$2');
  
  return result;
}

// Main fix function
function fixProblemText(text) {
  if (!text) return text;
  
  const optIdx = text.search(/[①②③④⑤]/);
  
  if (optIdx === -1) {
    // No options — just apply line breaks to body
    return addLineBreaks(text);
  }
  
  let body = text.substring(0, optIdx);
  const optBlock = text.substring(optIdx);
  
  body = addLineBreaks(body);
  const fixedOpts = fixOptions(optBlock);
  
  return body.trimEnd() + '\n\n' + fixedOpts;
}

async function main() {
  console.log('=== 보기 수식 래핑 + 줄바꿈 정규화 전수 검수 ===\n');

  const dict = JSON.parse(fs.readFileSync(DICT_JSON, 'utf-8'));
  const lesson = JSON.parse(fs.readFileSync(LESSON_JSON, 'utf-8'));
  const problems = lesson.core.problems;

  let fixedCount = 0;
  let issues = [];

  for (let n = 1; n <= 44; n++) {
    const key = `${FOLDER_KEY_PREFIX}/${String(n).padStart(3, '0')}.webp`;
    const original = dict[key];
    if (!original) {
      issues.push(`${n}번: 텍스트 없음`);
      continue;
    }

    const fixed = fixProblemText(original);
    
    if (fixed !== original) {
      dict[key] = fixed;
      const prob = problems.find(p => p.number === n);
      if (prob) prob.questionText = fixed;
      fixedCount++;
      console.log(`✓ ${n}번 수정됨`);
      // Show what changed in options
      const origOpts = original.substring(original.search(/[①②③④⑤]/));
      const fixedOpts = fixed.substring(fixed.search(/[①②③④⑤]/));
      if (origOpts !== fixedOpts && origOpts.length > 0) {
        console.log(`  이전: ${JSON.stringify(origOpts.substring(0, 80))}`);
        console.log(`  이후: ${JSON.stringify(fixedOpts.substring(0, 80))}`);
      }
    } else {
      console.log(`  ${n}번: 변경 없음`);
    }
  }

  // Save
  fs.writeFileSync(DICT_JSON, JSON.stringify(dict, null, 2), 'utf-8');
  fs.writeFileSync(LESSON_JSON, JSON.stringify(lesson, null, 2), 'utf-8');

  console.log(`\n총 ${fixedCount}개 수정`);
  if (issues.length > 0) console.log('문제:', issues.join('\n'));

  // Final check: show any remaining broken options
  console.log('\n=== 최종 보기 검수 ===');
  let allPass = true;
  for (let n = 1; n <= 44; n++) {
    const key = `${FOLDER_KEY_PREFIX}/${String(n).padStart(3, '0')}.webp`;
    const text = dict[key];
    if (!text) continue;
    
    const optIdx = text.search(/[①②③④⑤]/);
    if (optIdx === -1) continue;
    const opts = text.substring(optIdx);
    
    // Check for naked LaTeX in options (not inside $)
    // Look for: ① \\ (without dollar sign prefix)
    const lines = opts.split('\n');
    for (const line of lines) {
      if (!/^[①②③④⑤]/.test(line)) continue;
      const optVal = line.replace(/^[①②③④⑤]\s*/, '');
      if (optVal.includes('\\\\') && !optVal.startsWith('$')) {
        console.log(`  ✗ ${n}번 보기: ${JSON.stringify(line)}`);
        allPass = false;
      }
    }
  }
  if (allPass) console.log('🎉 모든 보기 수식 정상!');
}

main().catch(console.error);
