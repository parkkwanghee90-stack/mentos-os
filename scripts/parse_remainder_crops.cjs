const fs = require('fs');
const path = require('path');

const BASE_MATH_CROPS = 'c:/mentos_os_clean/public/math_crops/(002)항등식과나머지정리';
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

function parseStage(stageName) {
  const stageDir = path.join(BASE_MATH_CROPS, stageName);
  if (!fs.existsSync(stageDir)) {
    console.error(`[ERROR] Stage directory not found: ${stageDir}`);
    return null;
  }

  console.log(`\n=== Processing Remainder Theorem ${stageName} ===`);
  
  const probHtmlPath = path.join(stageDir, '문제.html');
  const probFilesDirName = '문제_files';
  const probFilesPath = path.join(stageDir, probFilesDirName);
  
  let solHtmlPath = path.join(stageDir, '정답및해설.html');
  let solFilesDirName = '정답및해설_files';
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

    // Parse answer text
    const rawAns = rawAnswers[i];
    if (rawAns) {
      let finalAns = '';
      if (rawAns.includes('<big>')) {
        const bigMatch = rawAns.match(/<big>([^<]+)<\/big>/);
        if (bigMatch) {
          finalAns = normalizeChoice(bigMatch[1].trim());
        }
      } else {
        finalAns = cleanSubjective(rawAns);
      }
      answers[probIdx] = finalAns;
    }
  }

  console.log(`Mapped and copied files for ${qCount} questions in ${stageName}.`);
  return { qCount, answers };
}

function runAll() {
  const stages = ['2단계', '3단계', '4단계'];
  const extracted = {};
  const manifest = {};
  
  stages.forEach(stage => {
    const res = parseStage(stage);
    if (res) {
      extracted[stage] = res.answers;
      manifest[stage] = {
        qCount: res.qCount,
        answers: res.answers
      };
    }
  });

  // Save answers to a local JSON manifest
  const manifestPath = path.join(BASE_MATH_CROPS, 'extracted_answers.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Saved answers manifest to ${manifestPath}`);

  // Now, merge answers into global avs_answers.json
  if (fs.existsSync(srcAnswersPath)) {
    const avsAnswers = JSON.parse(fs.readFileSync(srcAnswersPath, 'utf8'));
    stages.forEach(stage => {
      const key = `항등식과나머지정리${stage}`;
      avsAnswers[key] = extracted[stage];
      console.log(`Merged answers for ${key} into public avs_answers.json`);
    });
    fs.writeFileSync(srcAnswersPath, JSON.stringify(avsAnswers, null, 2), 'utf8');
  }

  if (fs.existsSync(srcAnswersPathSrc)) {
    const avsAnswersSrc = JSON.parse(fs.readFileSync(srcAnswersPathSrc, 'utf8'));
    stages.forEach(stage => {
      const key = `항등식과나머지정리${stage}`;
      avsAnswersSrc[key] = extracted[stage];
      console.log(`Merged answers for ${key} into src avs_answers.json`);
    });
    fs.writeFileSync(srcAnswersPathSrc, JSON.stringify(avsAnswersSrc, null, 2), 'utf8');
  }

  console.log('\n🎉 SUCCESS: Mapped crops & merged remainder theorem answers successfully!');
}

runAll();
