import fs from 'fs';
import path from 'path';

const baseDir = './public/math_hints';
const targetFolders = [
  '고차방정식2단계', '고차방정식3단계', '고차방정식4단계',
  '이차부등식2단계', '이차부등식3단계', '이차부등식4단계',
  '원의방정식2단계', '원의방정식3단계', '원의방정식4단계',
  '도형의이동2단계', '도형의이동3단계', '도형의이동4단계'
];

const forbiddenPhrases = ["생각해봅시다", "적용해봅시다", "확인해봅시다", "살펴봅시다"];

let totalProblems = 0;
let pcbsaComplete = 0;
let missingFinalAnswer = 0;
let endsInForbiddenPhrase = 0;
let missingPcbsaStructure = 0;
let missingAnswerType = 0;

const failList = [];

targetFolders.forEach(folder => {
  const folderPath = path.join(baseDir, folder);
  if (!fs.existsSync(folderPath)) {
    console.log(`Folder not found: ${folder}`);
    return;
  }

  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));
  files.forEach(file => {
    totalProblems++;
    const filePath = path.join(folderPath, file);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.log(`Broken JSON in ${filePath}: ${e.message}`);
      failList.push(`${folder}/${file}: Broken JSON`);
      return;
    }

    const steps = data.steps || data.overlay_steps || [];
    const lastStep = steps.length > 0 ? steps[steps.length - 1] : null;
    const lastStepText = lastStep ? (lastStep.latex || lastStep.text || "") : "";

    const hasPcbsaStructure = steps.some(s => s.label && s.label.includes('P:')) || 
                              steps.some(s => s.label && s.label.includes('A:'));
    
    const hasFinalAnswer = data.finalAnswer !== undefined || data.correctAnswer !== undefined || lastStepText.includes("정답은");
    const endsInForbidden = forbiddenPhrases.some(p => lastStepText.includes(p));
    const hasAnswerType = data.answerType !== undefined;

    let isFail = false;
    let reasons = [];

    if (!hasPcbsaStructure) {
      missingPcbsaStructure++;
      isFail = true;
      reasons.push("Missing PCBSA structure");
    }
    if (!hasFinalAnswer) {
      missingFinalAnswer++;
      isFail = true;
      reasons.push("Missing finalAnswer/correctAnswer");
    }
    if (endsInForbidden) {
      endsInForbiddenPhrase++;
      isFail = true;
      reasons.push("Ends in forbidden phrase");
    }
    if (!hasAnswerType) {
        missingAnswerType++;
        isFail = true;
        reasons.push("Missing answerType");
    }

    if (!isFail) {
      pcbsaComplete++;
    } else {
      failList.push(`${folder}/${file}: ${reasons.join(', ')}`);
    }
  });
});

console.log(`- 전체 문제 수: ${totalProblems}`);
console.log(`- PCBSA 완성 문제 수: ${pcbsaComplete}`);
console.log(`- 최종 정답 없는 문제 수: ${missingFinalAnswer}`);
console.log(`- finalAnswer 없는 문제 수: ${missingFinalAnswer}`);
console.log(`- “생각해봅시다”로 끝나는 문제 수: ${endsInForbiddenPhrase}`);
console.log(`- 수정 완료 문제 수: 0 (audit only)`);
console.log(`- 남은 실패 목록: ${failList.length}`);
// console.log(JSON.stringify(failList, null, 2));
