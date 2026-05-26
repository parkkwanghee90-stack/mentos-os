const fs = require('fs');
const path = require('path');

const BASE_MATH_CROPS = 'c:/mentos_os_clean/public/math_crops/(001)다항식';

// Normalize choice symbols to standard digits
const normalizeChoice = (text) => {
  const map = { '①': '1', '②': '2', '③': '3', '④': '4', '⑤': '5' };
  return map[text] || text;
};

// Clean KaTeX unicode minus signs and other representations
const cleanSubjective = (html) => {
  // Strip HTML tags
  let text = html.replace(/<[^>]+>/g, '').trim();
  // Replace unicode minus (U+2212) with standard hyphen minus
  text = text.replace(/−/g, '-');
  // Strip whitespace
  text = text.replace(/\s+/g, '');
  return text;
};

function parseStage(stageName) {
  const stageDir = path.join(BASE_MATH_CROPS, stageName);
  if (!fs.existsSync(stageDir)) {
    console.error(`[ERROR] Stage directory not found: ${stageDir}`);
    return null;
  }

  console.log(`\n=== Processing ${stageName} ===`);
  
  // 1. Resolve filenames
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

  // 2. Parse Problems HTML
  const probHtml = fs.readFileSync(probHtmlPath, 'utf8');
  // Extract all src matches of ./문제_files/xxxx.webp
  const probImgRegex = new RegExp(`<img[^>]+src="\\.\\/${probFilesDirName}\\/([a-f0-9]{32}\\.webp)"[^>]*>`, 'g');
  let match;
  const probImages = [];
  while ((match = probImgRegex.exec(probHtml))) {
    probImages.push(match[1]);
  }
  
  console.log(`Found ${probImages.length} problem webp references in 문제.html`);

  // 3. Parse Solutions HTML & Answers
  const solHtml = fs.readFileSync(solHtmlPath, 'utf8');
  const solImgRegex = new RegExp(`<img[^>]+src="\\.\\/${solFilesDirName}\\/([a-f0-9]{32}\\.webp)"[^>]*>`, 'g');
  const solImages = [];
  while ((match = solImgRegex.exec(solHtml))) {
    solImages.push(match[1]);
  }
  
  console.log(`Found ${solImages.length} solution webp references in 해설 HTML`);

  // Parse all individual unit-answer sections to extract answers
  // Each answer is in a block like class="unit-answer"><span>정답</span><span ...>ANSWER</span></span>
  const answerRegex = /class="unit-answer"><span>정답<\/span><span[^>]*>([\s\S]*?)<\/span><\/span>/g;
  const rawAnswers = [];
  while ((match = answerRegex.exec(solHtml))) {
    rawAnswers.push(match[1]);
  }
  console.log(`Found ${rawAnswers.length} raw answer tags`);

  // Determine unique question count
  const qCount = probImages.length;
  console.log(`Determined unique question count: ${qCount}`);

  // Map and copy problem files
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

    // Copy solution webp (the first qCount solutions are the unique ones)
    const originalSolFile = solImages[i];
    if (originalSolFile) {
      const srcPath = path.join(solFilesPath, originalSolFile);
      const destPath = path.join(stageDir, `${formattedIdx}a.webp`);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }

    // Process answer
    const rawAns = rawAnswers[i];
    if (rawAns) {
      let finalAns = '';
      if (rawAns.includes('<big>')) {
        // Multiple choice
        const bigMatch = rawAns.match(/<big>([^<]+)<\/big>/);
        if (bigMatch) {
          finalAns = normalizeChoice(bigMatch[1].trim());
        }
      } else {
        // Subjective (short answer) KaTeX
        finalAns = cleanSubjective(rawAns);
      }
      answers[probIdx] = finalAns;
    }
  }

  console.log(`Mapped and copied files for ${qCount} questions in ${stageName}.`);
  console.log('Sample extracted answers:', Object.entries(answers).slice(0, 5));
  
  return { qCount, answers };
}

function runAll() {
  const results = {};
  const stages = ['2단계', '3단계', '4단계'];
  
  stages.forEach(stage => {
    const res = parseStage(stage);
    if (res) {
      results[stage] = res;
    }
  });

  // Save answers to a local JSON manifest
  const manifestPath = path.join(BASE_MATH_CROPS, 'extracted_answers.json');
  fs.writeFileSync(manifestPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nSuccessfully saved extracted answers to ${manifestPath}`);
}

runAll();
