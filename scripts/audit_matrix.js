import fs from 'fs';
import path from 'path';
import katex from 'katex';

console.warn = () => {}; // Mute katex warnings

const report = [];
const stats = {
  files_checked: 0,
  problems_checked: 0,
  total_errors: 0,
  errors_by_stage: { '2단계': 0, '3단계': 0, '4단계': 0, '기타': 0 },
  errors_by_type: { 'matrix': 0, 'avs': 0, 'choices': 0, 'other': 0 },
  manual_fix_needed: []
};

function getStage(str) {
  if (str.includes('2단계')) return '2단계';
  if (str.includes('3단계')) return '3단계';
  if (str.includes('4단계')) return '4단계';
  return '기타';
}

function recordError(stage, problemId, field, brokenText, errorType, katexError) {
  report.push({
    stage, problemId, field, brokenText, errorType, katexError,
    suggestedFix: "Needs manual review", autoFixSafe: false
  });
  stats.total_errors++;
  if (stats.errors_by_stage[stage] !== undefined) {
    stats.errors_by_stage[stage]++;
  }
  if (field.includes('avs')) stats.errors_by_type.avs++;
  else if (field.includes('choices')) stats.errors_by_type.choices++;
  else if (errorType.includes('pmatrix')) stats.errors_by_type.matrix++;
  else stats.errors_by_type.other++;
  
  if (!stats.manual_fix_needed.includes(problemId)) {
    stats.manual_fix_needed.push(problemId);
  }
}

function checkText(text, stage, problemId, field) {
  if (!text || typeof text !== 'string') return;
  
  if (text.includes('\\n')) {
     recordError(stage, problemId, field, text, 'newline escaped (\\n)', '');
  }
  
  if (text.includes('\\begin{pmatrix}')) {
     if (!text.includes('$$') && !text.includes('$') && !text.includes('\\[')) {
         recordError(stage, problemId, field, text, 'pmatrix broken (missing $$)', '');
     }
  }

  if (/sqrT|sqlT|(?<!\\)sqrt/.test(text)) {
     recordError(stage, problemId, field, text, 'sqrt typo (sqrT/sqlT or missing \\)', '');
  }

  if (/\\\\\\/.test(text)) {
     recordError(stage, problemId, field, text, 'slash escape (\\\\\\)', '');
  }

  const blockReg = /\$\$([\s\S]+?)\$\$/g;
  let m;
  while ((m = blockReg.exec(text)) !== null) {
    try { katex.renderToString(m[1], { throwOnError: true, displayMode: true }); }
    catch (e) { recordError(stage, problemId, field, m[1], 'katex render fail (block)', e.message); }
  }
  const inlineReg = /\$((?:[^$\\]|\\[\s\S])+?)\$/g;
  while ((m = inlineReg.exec(text)) !== null) {
    try { katex.renderToString(m[1], { throwOnError: true, displayMode: false }); }
    catch (e) { recordError(stage, problemId, field, m[1], 'katex render fail (inline)', e.message); }
  }
}

// 1. Math Problem Texts
const problemTextsFile = 'src/data/math_problem_texts.json';
if (fs.existsSync(problemTextsFile)) {
  const data = JSON.parse(fs.readFileSync(problemTextsFile, 'utf8'));
  for (const key of Object.keys(data)) {
    if (key.includes('행렬')) {
      const stage = getStage(key);
      if (['2단계','3단계','4단계'].includes(stage)) {
         stats.problems_checked++;
         const text = data[key];
         const optIdx = text.search(/[①②③④⑤]/);
         if (optIdx !== -1) {
             checkText(text.slice(0, optIdx), stage, key, 'question');
             checkText(text.slice(optIdx), stage, key, 'choices');
         } else {
             checkText(text, stage, key, 'question');
         }
      }
    }
  }
  stats.files_checked++;
}

// 2. AVS Files
const avsDirs = [
  'public/math_hints/(4)행렬2단계',
  'public/math_hints/행렬2단계',
  'public/math_hints/행렬3단계',
  'public/math_hints/행렬4단계'
];
for (const dir of avsDirs) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    for (const f of files) {
      stats.files_checked++;
      stats.problems_checked++;
      const stage = getStage(dir);
      try {
        const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        if (data.overlay_steps) {
           data.overlay_steps.forEach((step, idx) => {
              checkText(step.latex, stage, f, `avs.steps[${idx}].latex`);
              checkText(step.label_text, stage, f, `avs.steps[${idx}].label_text`);
           });
        }
      } catch(e) {
        recordError(stage, f, 'json_parse', 'N/A', 'json parse fail', e.message);
      }
    }
  }
}

// 3. Premium Lectures
const premiumFile = 'public/premium_lectures/행렬.json';
if (fs.existsSync(premiumFile)) {
    stats.files_checked++;
    try {
        const data = JSON.parse(fs.readFileSync(premiumFile, 'utf8'));
        // Premium lectures usually have sections/text
        Object.keys(data).forEach(k => {
             checkText(JSON.stringify(data[k]), '기타', 'premium_lecture', 'premium_content');
        });
    } catch(e) {}
}

const reportDir = 'logs';
if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);
fs.writeFileSync(path.join(reportDir, 'math_sang_matrix_stage_2_3_4_audit.json'), JSON.stringify(report, null, 2));

console.log(`1. 검사한 파일 수: ${stats.files_checked}`);
console.log(`2. 검사한 문제 수: ${stats.problems_checked}`);
console.log(`3. 오류 총 개수: ${stats.total_errors}`);
console.log(`4. 단계별 오류 수: 2단계(${stats.errors_by_stage['2단계']}), 3단계(${stats.errors_by_stage['3단계']}), 4단계(${stats.errors_by_stage['4단계']})`);
console.log(`5. 행렬 오류 수: ${stats.errors_by_type.matrix}`);
console.log(`6. AVS 오류 수: ${stats.errors_by_type.avs}`);
console.log(`7. 보기 오류 수: ${stats.errors_by_type.choices}`);
console.log(`8. 수동 수정 필요한 목록: ${stats.manual_fix_needed.length} items`);
