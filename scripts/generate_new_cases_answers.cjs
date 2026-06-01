const fs = require('fs');
const path = require('path');

const ROOT_DIR = 'c:/mentos_os_clean';
const OUTPUT_PATH = path.join(ROOT_DIR, 'src/data/cases_healed_avs_answers.json');

const HINT_DIRS = {
  '경우의수2단계': path.join(ROOT_DIR, 'public/math_hints/cases_step2'),
  '경우의수3단계': path.join(ROOT_DIR, 'public/math_hints/cases_step3'),
  '경우의수4단계': path.join(ROOT_DIR, 'public/math_hints/cases_step4')
};

function generateNewCasesAnswers() {
  console.log('⚡ Generating NEW cases_healed_avs_answers.json file...');

  let newDb = {
    '경우의수2단계': {},
    '경우의수3단계': {},
    '경우의수4단계': {}
  };

  let totalCount = 0;

  for (const [unitName, dirPath] of Object.entries(HINT_DIRS)) {
    if (!fs.existsSync(dirPath)) {
      console.warn(`⚠️ Hint directory not found: ${dirPath}`);
      continue;
    }

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json')).sort();
    files.forEach(filename => {
      const filePath = path.join(dirPath, filename);
      const probNum = filename.replace('.json', '');
      const paddedKey = probNum.padStart(3, '0');

      try {
        const hintData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let ans = hintData.correctAnswer || hintData.answer || null;
        
        if (ans !== null && ans !== undefined) {
          ans = String(ans).trim();
          newDb[unitName][paddedKey] = ans;
          totalCount++;
        }
      } catch (e) {
        console.error(`❌ Failed parsing ${filename} in ${unitName}:`, e.message);
      }
    });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(newDb, null, 2), 'utf8');
  console.log(`🎉 Successfully created NEW file at ${OUTPUT_PATH} with ${totalCount} correct answers!`);
}

generateNewCasesAnswers();
