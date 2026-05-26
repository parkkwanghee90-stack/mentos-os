const fs = require('fs');
const path = require('path');

const manifestPath = 'c:/mentos_os_clean/public/math_crops/(001)다항식/extracted_answers.json';
if (!fs.existsSync(manifestPath)) {
  console.error('[ERROR] Manifest not found:', manifestPath);
  process.exit(1);
}

const extracted = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const targetPaths = [
  'c:/mentos_os_clean/public/data/avs_answers.json',
  'c:/mentos_os_clean/src/data/avs_answers.json'
];

targetPaths.forEach(targetPath => {
  if (!fs.existsSync(targetPath)) {
    console.log(`Target not found: ${targetPath}, skipping.`);
    return;
  }
  
  const avsAnswers = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  
  // Merge each stage
  const stages = {
    '2단계': '(001)다항식2단계',
    '3단계': '(001)다항식3단계',
    '4단계': '(001)다항식4단계'
  };
  
  Object.entries(stages).forEach(([stageName, dbKey]) => {
    if (extracted[stageName]) {
      const stageAnswers = extracted[stageName].answers;
      avsAnswers[dbKey] = {};
      
      Object.entries(stageAnswers).forEach(([qNum, ans]) => {
        const paddedNum = String(qNum).padStart(3, '0');
        avsAnswers[dbKey][paddedNum] = String(ans);
      });
      
      console.log(`Merged ${Object.keys(avsAnswers[dbKey]).length} answers under key "${dbKey}" in ${targetPath}`);
    }
  });
  
  fs.writeFileSync(targetPath, JSON.stringify(avsAnswers, null, 2), 'utf8');
});

console.log('\nAnswers merging completed successfully.');
