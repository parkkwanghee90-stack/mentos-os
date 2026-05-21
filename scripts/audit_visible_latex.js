import fs from 'fs';
import path from 'path';
import katex from 'katex';

console.warn = () => {};

const report = [];
const failPatterns = [
  { name: "\\\\begin", regex: /\\begin/g },
  { name: "\\\\end", regex: /\\end/g },
  { name: "\\\\frac", regex: /\\frac/g },
  { name: "\\\\sqrt", regex: /\\sqrt/g },
  { name: "\\\\pm", regex: /\\pm/g },
  { name: "\\\\therefore", regex: /\\therefore/g },
  { name: "\\\\quad", regex: /\\quad/g },
  { name: "\\\\text", regex: /\\text/g },
  { name: "\\\\left", regex: /\\left/g },
  { name: "\\\\right", regex: /\\right/g },
  { name: "\\\\n", regex: /\\n/g },
  { name: "$$", regex: /\$\$/g },
  { name: "\\\\{", regex: /\\\{/g },
  { name: "\\\\}", regex: /\\\}/g }
];

const mathSangUnits = [
  '고차방정식', '일차부등식', '이차부등식', '경우의수', '경우의 수',
  '점과좌표', '직선의방정식', '직선의 방정식', '원의방정식', '원의 방정식', '도형의이동', '도형의 이동', '행렬'
];

function getUnitAndStage(key) {
  let unit = 'Unknown';
  let stage = 'Unknown';
  
  for (const u of mathSangUnits) {
    if (key.includes(u)) {
      unit = u;
      break;
    }
  }
  
  const stageMatch = key.match(/([1-4]단계)/);
  if (stageMatch) stage = stageMatch[1];
  
  const idMatch = key.match(/\/([0-9a-zA-Z_]+)\.webp/);
  const problemId = idMatch ? idMatch[1] : key;

  return { unit, stage, problemId };
}

function normalizeMathText(raw) {
  if (!raw) return '';
  let txt = String(raw);
  txt = txt.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n');
  txt = txt.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$');
  txt = txt.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
  return txt;
}

function checkText(rawText, meta, field) {
  if (!rawText) return;
  const text = normalizeMathText(rawText);
  
  const { unit, stage, problemId } = meta;
  
  // 1. Check for KaTeX render failures (which result in raw text bleeding)
  const mathBlocks = [];
  const blockReg = /\$\$([\s\S]+?)\$\$/g;
  let m;
  while ((m = blockReg.exec(text)) !== null) {
    mathBlocks.push(m[1]);
    try { katex.renderToString(m[1], { throwOnError: true, displayMode: true }); }
    catch (e) {
      report.push({
        unit, stage, problemId, field,
        matchedPattern: "KaTeX Error",
        brokenText: m[1],
        reason: `KaTeX 렌더링 실패로 인해 수식이 화면에 노출됨: ${e.message}`
      });
    }
  }

  const inlineReg = /\$((?:[^$\\]|\\[\s\S])+?)\$/g;
  while ((m = inlineReg.exec(text)) !== null) {
    mathBlocks.push(m[1]);
    try { katex.renderToString(m[1], { throwOnError: true, displayMode: false }); }
    catch (e) {
      report.push({
        unit, stage, problemId, field,
        matchedPattern: "KaTeX Error",
        brokenText: m[1],
        reason: `KaTeX 렌더링 실패로 인해 수식이 화면에 노출됨: ${e.message}`
      });
    }
  }

  // 2. Strip valid math blocks to find naked LaTeX commands
  let plainText = text;
  plainText = plainText.replace(/\$\$([\s\S]+?)\$\$/g, '');
  plainText = plainText.replace(/\$((?:[^$\\]|\\[\s\S])+?)\$/g, '');
  plainText = plainText.replace(/\\\[([\s\S]*?)\\\]/g, '');
  plainText = plainText.replace(/\\\(([\s\S]*?)\\\)/g, '');

  // Check against fail patterns
  for (const { name, regex } of failPatterns) {
    regex.lastIndex = 0; // reset regex state
    if (regex.test(plainText)) {
      // Find a snippet of the broken text for context
      const matchIdx = plainText.search(regex);
      const snippet = plainText.substring(Math.max(0, matchIdx - 15), Math.min(plainText.length, matchIdx + 30));
      
      report.push({
        unit, stage, problemId, field,
        matchedPattern: name,
        brokenText: snippet.trim(),
        reason: `수식 기호($) 없이 일반 텍스트 영역에 LaTeX 명령어 노출됨`
      });
    }
  }
}

function runAudit() {
  const dbPath = 'src/data/math_problem_texts.json';
  if (!fs.existsSync(dbPath)) {
    console.error("math_problem_texts.json not found!");
    return;
  }

  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  let checkedCount = 0;

  for (const [key, text] of Object.entries(data)) {
    // Only check "수학상" keys
    if (!mathSangUnits.some(u => key.includes(u))) continue;
    
    // Only check stage 2, 3, 4 (or 1)
    if (!key.includes('단계')) continue;
    
    checkedCount++;
    const meta = getUnitAndStage(key);

    const optIdx = text.search(/[①②③④⑤]/);
    if (optIdx !== -1) {
      checkText(text.slice(0, optIdx), meta, 'question');
      
      // Parse options
      const optBlock = text.slice(optIdx);
      const reg = /(①|②|③|④|⑤)\s*([^\n①②③④⑤]*)/g;
      let m;
      let optNum = 1;
      while ((m = reg.exec(optBlock)) !== null) {
        checkText(m[2], meta, `choices[${optNum}]`);
        optNum++;
      }
    } else {
      checkText(text, meta, 'question');
    }
  }

  const outPath = 'logs/math_upper_question_choices_visible_latex_errors.json';
  if (!fs.existsSync('logs')) fs.mkdirSync('logs');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`Audit complete. Checked ${checkedCount} problems.`);
  console.log(`Found ${report.length} errors.`);
  console.log(`Report saved to ${outPath}`);
}

runAudit();
