// scripts/parse_quad_eq_func_crops.cjs
const fs = require('fs');
const path = require('path');

const srcAnswersPath = 'public/data/avs_answers.json';
const srcAnswersPathSrc = 'src/data/avs_answers.json';

const normalizeChoice = (text) => {
  const map = { '①': '1', '②': '2', '③': '3', '④': '4', '⑤': '5' };
  return map[text] || text;
};

const cleanSubjective = (html) => {
  let text = html.replace(/<[^>]+>/g, '').trim();
  text = text.replace(/−/g, '-');
  text = text.replace(/\s+/g, '');
  return text;
};

function parseStage(baseCropsPath, stageName, unitKeyPrefix) {
  const stageDir = path.join(baseCropsPath, stageName);
  if (!fs.existsSync(stageDir)) {
    console.error(`[ERROR] Stage directory not found: ${stageDir}`);
    return null;
  }

  console.log(`\n=== Processing ${unitKeyPrefix} ${stageName} ===`);
  
  const probHtmlPath = path.join(stageDir, '문제.html');
  const probFilesDirName = '문제_files';
  const probFilesPath = path.join(stageDir, probFilesDirName);
  
  let solHtmlPath = path.join(stageDir, '정답및해설.html');
  let solFilesDirName = '정답및해설_files';
  if (!fs.existsSync(solHtmlPath)) {
    solHtmlPath = path.join(stageDir, '정답과해설.html');
    solFilesDirName = '정답과해설_files';
  }
  if (!fs.existsSync(solHtmlPath)) {
    solHtmlPath = path.join(stageDir, '해설.html');
    solFilesDirName = '해설_files';
  }
  const solFilesPath = path.join(stageDir, solFilesDirName);

  if (!fs.existsSync(probHtmlPath) || !fs.existsSync(solHtmlPath)) {
    console.error(`[ERROR] HTML files missing in ${stageDir}`);
    return null;
  }

  // Parse Problems
  const probHtml = fs.readFileSync(probHtmlPath, 'utf8');
  const probImgRegex = new RegExp(`<img[^>]+src="\\.\\/${probFilesDirName}\\/([a-f0-9]{32}\\.webp)"[^>]*>`, 'g');
  let match;
  const probImages = [];
  while ((match = probImgRegex.exec(probHtml))) {
    probImages.push(match[1]);
  }
  
  console.log(`Found ${probImages.length} problem webp references in 문제.html`);

  // Parse Solutions
  const solHtml = fs.readFileSync(solHtmlPath, 'utf8');
  const solImgRegex = new RegExp(`<img[^>]+src="\\.\\/${solFilesDirName}\\/([a-f0-9]{32}\\.webp)"[^>]*>`, 'g');
  const solImages = [];
  while ((match = solImgRegex.exec(solHtml))) {
    solImages.push(match[1]);
  }
  
  console.log(`Found ${solImages.length} solution webp references in 해설 HTML`);

  // Parse Answers
  const answerRegex = /class="unit-answer"><span>정답<\/span><span[^>]*>([\s\S]*?)<\/span><\/span>/g;
  const rawAnswers = [];
  while ((match = answerRegex.exec(solHtml))) {
    rawAnswers.push(match[1]);
  }
  console.log(`Found ${rawAnswers.length} raw answer tags`);

  const qCount = probImages.length;
  console.log(`Determined unique question count: ${qCount}`);

  // Copy and Map
  const answers = {};
  for (let i = 0; i < qCount; i++) {
    const probIdx = i + 1;
    const formattedIdx = String(probIdx).padStart(3, '0');
    
    // Copy problem webp
    const originalProbFile = probImages[i];
    if (originalProbFile) {
      const srcPath = path.join(probFilesPath, originalProbFile);
      const destPath = path.join(stageDir, `${formattedIdx}.webp`);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }

    // Copy solution webp
    const originalSolFile = solImages[i];
    if (originalSolFile) {
      const srcPath = path.join(solFilesPath, originalSolFile);
      const destPath = path.join(stageDir, `${formattedIdx}a.webp`);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }

    // Process Answer Grading Key
    const rawAns = rawAnswers[i] || '';
    let processedAns = '';
    let isChoice = false;

    if (rawAns.includes('<big>①</big>') || rawAns.includes('<big>②</big>') || rawAns.includes('<big>③</big>') || rawAns.includes('<big>④</big>') || rawAns.includes('<big>⑤</big>')) {
      const choiceMatch = rawAns.match(/<big>([①-⑤])<\/big>/);
      if (choiceMatch) {
        processedAns = normalizeChoice(choiceMatch[1]);
        isChoice = true;
      }
    } else {
      processedAns = cleanSubjective(rawAns);
    }

    answers[probIdx] = {
      correctAnswer: processedAns,
      answerType: isChoice ? 'choice' : 'subjective'
    };
  }

  return {
    qCount,
    answers
  };
}

function mergeIntoAVSAnswers(allResults) {
  const avsAnswers = JSON.parse(fs.readFileSync(srcAnswersPath, 'utf8'));

  Object.entries(allResults).forEach(([unitKey, data]) => {
    avsAnswers[unitKey] = {};
    Object.entries(data.answers).forEach(([qId, ansObj]) => {
      avsAnswers[unitKey][qId] = ansObj.correctAnswer;
    });
  });

  // Write to both public and src data paths to maintain SSOT
  fs.writeFileSync(srcAnswersPath, JSON.stringify(avsAnswers, null, 2), 'utf8');
  if (fs.existsSync(srcAnswersPathSrc)) {
    fs.writeFileSync(srcAnswersPathSrc, JSON.stringify(avsAnswers, null, 2), 'utf8');
  }
  console.log('\n🎉 Successfully merged and updated all unit answers into avs_answers.json!');
}

function main() {
  const targets = [
    {
      basePath: 'c:/mentos_os_clean/public/math_crops/(005)이차방정식',
      unitPrefix: '이차방정식'
    },
    {
      basePath: 'c:/mentos_os_clean/public/math_crops/(006)이차방정식과이차함수',
      unitPrefix: '이차방정식과이차함수'
    }
  ];

  const stages = ['2단계', '3단계', '4단계'];
  const allResults = {};

  targets.forEach(t => {
    const masterAnswers = {};
    stages.forEach(stage => {
      const result = parseStage(t.basePath, stage, t.unitPrefix);
      if (result) {
        const unitKey = `${t.unitPrefix}${stage}`;
        allResults[unitKey] = result;
        masterAnswers[unitKey] = result.answers;
      }
    });

    // Save the local extracted_answers.json
    fs.writeFileSync(path.join(t.basePath, 'extracted_answers.json'), JSON.stringify(masterAnswers, null, 2), 'utf8');
    console.log(`\n- Generated local extracted_answers.json inside: ${t.basePath}`);
  });

  // Merge into main avs answers
  mergeIntoAVSAnswers(allResults);
}

main();
