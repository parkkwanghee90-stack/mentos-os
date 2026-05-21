import fs from 'fs';
import path from 'path';

const dbPath = 'src/data/math_problem_texts.json';
const hintsDir = 'public/math_hints';
const masterOut = 'reports/answers_master.json';
const queueOut = 'reports/answers_review_queue.json';

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const master = [];
const queue = [];

function isMultipleChoice(unit, problemId) {
  const key = Object.keys(db).find(k => k.includes(`${unit}/${problemId}`));
  if (key && db[key]) {
    return db[key].includes('①') || db[key].includes('1)') || db[key].includes('(1)') || db[key].includes('정답 ①');
  }
  return false;
}

function processUnit(unitPath, unitName) {
  const files = fs.readdirSync(unitPath);
  
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    
    const problemId = file.replace('.json', '');
    const jsonPath = path.join(unitPath, file);
    
    let hintData;
    try {
      hintData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } catch (e) {
      continue;
    }
    
    if (!hintData.steps || hintData.steps.length === 0) continue;
    
    const lastStep = hintData.steps[hintData.steps.length - 1];
    let lastText = lastStep.latex || lastStep.text || '';
    if (typeof lastText !== 'string') lastText = JSON.stringify(lastText);
    
    // stage 추출
    let stage = 0;
    const stageMatch = unitName.match(/([0-9])단계/);
    if (stageMatch) {
      stage = parseInt(stageMatch[1], 10);
    }
    
    let baseUnit = unitName.replace(/[0-9]단계/, '');
    
    let isMC = isMultipleChoice(unitName, problemId);
    let type = isMC ? 'multiple_choice' : 'subjective';
    
    // 정답 추출
    let answer = null;
    let ambiguous = false;
    
    // "정답 ①" 또는 "따라서 3" 또는 "\therefore 5" 등 찾기
    const ansMatch = lastText.match(/(정답|답|따라서|\\therefore)[\s]*[:=]?[\s]*([①-⑤]|[0-9]+|\\[a-zA-Z]+[{[\]}0-9a-zA-Z가-힣\s\-+/*^.]+)/);
    
    if (ansMatch) {
      answer = ansMatch[2].trim();
      // 동그라미 숫자를 일반 숫자로 변환 (multiple choice)
      const circleMap = {'①':'1','②':'2','③':'3','④':'4','⑤':'5'};
      if (circleMap[answer]) {
        answer = circleMap[answer];
        type = 'multiple_choice';
      }
    } else {
      // 마지막 줄의 마지막 수식이나 숫자
      const lines = lastText.split('\\\\');
      let lastLine = lines[lines.length - 1].trim();
      
      const matchFallback = lastLine.match(/([①-⑤]|[0-9]+)$/);
      if (matchFallback) {
        answer = matchFallback[1];
        const circleMap = {'①':'1','②':'2','③':'3','④':'4','⑤':'5'};
        if (circleMap[answer]) {
          answer = circleMap[answer];
          type = 'multiple_choice';
        }
      } else {
        ambiguous = true;
        answer = lastText.substring(lastText.length - 30); // 끝부분만 잘라서 리뷰용으로 제공
      }
    }
    
    const record = {
      unit: baseUnit,
      stage: stage,
      problem: parseInt(problemId.replace(/\D/g, ''), 10) || problemId,
      answer: answer,
      type: type,
      raw_last_step: ambiguous ? lastText : undefined
    };
    
    if (ambiguous || !answer) {
      queue.push(record);
    } else {
      master.push(record);
    }
  }
}

function run() {
  if (!fs.existsSync(hintsDir)) {
    console.log(`Directory ${hintsDir} not found.`);
    return;
  }
  
  const units = fs.readdirSync(hintsDir);
  for (const unit of units) {
    const unitPath = path.join(hintsDir, unit);
    if (fs.statSync(unitPath).isDirectory()) {
      processUnit(unitPath, unit);
    }
  }
  
  fs.writeFileSync(masterOut, JSON.stringify(master, null, 2), 'utf8');
  fs.writeFileSync(queueOut, JSON.stringify(queue, null, 2), 'utf8');
  
  console.log(`Extraction Complete.`);
  console.log(`Master DB: ${master.length} items -> ${masterOut}`);
  console.log(`Review Queue: ${queue.length} items -> ${queueOut}`);
}

run();
