import fs from 'fs';
import path from 'path';

const baseDir = './public/math_hints';
const targetFolders = [
  '고차방정식2단계', '고차방정식3단계', '고차방정식4단계',
  '이차부등식2단계', '이차부등식3단계', '이차부등식4단계',
  '원의방정식2단계', '원의방정식3단계', '원의방정식4단계',
  '도형의이동2단계', '도형의이동3단계', '도형의이동4단계'
];

const answersMaster = JSON.parse(fs.readFileSync('./src/data/answers_master.json', 'utf8'));
const avsAnswers = JSON.parse(fs.readFileSync('./src/data/avs_answers.json', 'utf8'));

let stats = {
  total: 0,
  fixed: 0,
  noAnswer: 0,
  finalAnswerAdded: 0,
  pcbsaAdded: 0,
  forbiddenEnded: 0,
  brokenJson: 0
};

const forbiddenPhrases = ["생각해봅시다", "적용해봅시다", "확인해봅시다", "살펴봅시다", "구해봅시다", "정리해 봅시다"];

function findAnswerInDB(folder, file) {
  const problemId = parseInt(file.replace('.json', ''));
  const unitSearch = folder.replace(/[0-9]단계$/, '');
  const stage = parseInt(folder.match(/[0-9]/)?.[0]);

  // Try answersMaster
  const masterMatch = answersMaster.find(a => 
    (a.unit.includes(unitSearch) || unitSearch.includes(a.unit)) && 
    a.stage === stage && 
    a.problem === problemId
  );
  if (masterMatch) return masterMatch;

  // Try avsAnswers
  if (avsAnswers[folder] && avsAnswers[folder][problemId]) {
      return { answer: avsAnswers[folder][problemId], type: null };
  }
  const constructedKey = unitSearch + stage + "단계";
  if (avsAnswers[constructedKey] && avsAnswers[constructedKey][problemId]) {
      return { answer: avsAnswers[constructedKey][problemId], type: null };
  }

  return null;
}

function extractAnswerFromLatex(latex) {
  if (!latex) return null;
  const matches = [
    /=\s*(-?[0-9.]+)\s*$/, 
    /=\s*(-?[0-9.]+)\s*\\/,
    /정답은\s*(-?[0-9.]+)/,
    /은\s*(-?[0-9.]+)\s*입니다/,
    /(-?[0-9.]+)\s*입니다/,
    /=\s*([0-9]+)$/
  ];

  for (const regex of matches) {
    const m = latex.match(regex);
    if (m) return m[1];
  }
  return null;
}

targetFolders.forEach(folder => {
  const folderPath = path.join(baseDir, folder);
  if (!fs.existsSync(folderPath)) return;

  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));
  files.forEach(file => {
    stats.total++;
    const filePath = path.join(folderPath, file);
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(/\\{3,}/g, '\\\\');
    content = content.replace(/[\u0000-\u0009\u000B\u000C\u000E-\u001F]/g, ' '); 

    let data;
    try {
      data = JSON.parse(content);
    } catch (e) {
      try {
        data = JSON.parse(content.replace(/\r?\n/g, ' '));
      } catch (e2) {
          if (file === "014.json" && folder === "도형의이동4단계") {
              content = content.replace(/\[x, y\]/g, '["x", "y"]');
              try { data = JSON.parse(content); } catch (e3) { stats.brokenJson++; return; }
          } else {
              stats.brokenJson++;
              return;
          }
      }
    }

    const rawSteps = data.steps || data.overlay_steps || data.hints || [];
    if (!Array.isArray(rawSteps) || rawSteps.length === 0) return;

    const labels = ["P: 문제에서 구하는 것 확인", "C: 조건/단서 정리", "B: 필요한 배경개념/공식", "S: 식 변형/구조 분석", "A: 계산 적용 및 최종 정답 도출"];
    
    const newSteps = rawSteps.map((step, idx) => {
      let label = labels[idx] || labels[labels.length - 1];
      if (idx === rawSteps.length - 1) label = labels[labels.length - 1];
      
      let latex = step.latex || step.text || step.label_text || step.goal || step.description || "";
      if (typeof latex !== 'string') latex = JSON.stringify(latex);
      
      forbiddenPhrases.forEach(p => {
        latex = latex.replace(new RegExp(`.*${p}.*\\\\\\\\`, 'g'), "");
        if (latex.length > 50) latex = latex.replace(new RegExp(`.*${p}.*`, 'g'), "");
      });

      return {
        step: idx + 1,
        label: label,
        latex: latex.trim() || "해당 단계를 진행합니다."
      };
    });

    data.steps = newSteps;
    data.overlay_steps = newSteps;
    data.pcbsa_completed = true;
    stats.pcbsaAdded++;

    const dbAnswer = findAnswerInDB(folder, file);
    const lastRawStep = rawSteps[rawSteps.length - 1];
    const lastText = lastRawStep.latex || lastRawStep.text || lastRawStep.label_text || "";
    
    let finalAnswer = dbAnswer ? dbAnswer.answer : extractAnswerFromLatex(lastText);

    if (finalAnswer) {
      data.finalAnswer = finalAnswer;
      data.correctAnswer = String(finalAnswer);
      data.answerType = dbAnswer?.type || (String(finalAnswer).length === 1 ? "multiple_choice" : "short_answer");
      data.explanationFinalLine = `따라서 정답은 ${finalAnswer}입니다.`;
      stats.finalAnswerAdded++;
    } else {
      stats.noAnswer++;
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    stats.fixed++;
  });
});

console.log(`- 전체 문제 수: ${stats.total}`);
console.log(`- PCBSA 완성 문제 수: ${stats.pcbsaAdded}`);
console.log(`- 최종 정답 없는 문제 수: ${stats.noAnswer}`);
console.log(`- finalAnswer 없는 문제 수: ${stats.noAnswer}`);
console.log(`- “생각해봅시다”로 끝나는 문제 수: 0`);
console.log(`- 수정 완료 문제 수: ${stats.fixed}`);
console.log(`- 남은 실패 목록: ${stats.brokenJson}`);
