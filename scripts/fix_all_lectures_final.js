import fs from 'fs';

const fixLecture = (path) => {
  const d = JSON.parse(fs.readFileSync(path, 'utf8'));
  // We need to fix the backslashes. 
  // If we have "\\" (double) in the app memory, KaTeX fails.
  // My previous scripts used "\\\\" in literals, which resulted in "\\" in memory.
  
  d.steps.forEach(step => {
    if (step.visuals && step.visuals.math) {
      // Replace double backslash with single backslash
      step.visuals.math = step.visuals.math.replace(/\\\\/g, '\\');
    }
  });
  fs.writeFileSync(path, JSON.stringify(d, null, 2));
};

fixLecture('./public/premium_lectures/지수함수.json');
fixLecture('./public/premium_lectures/로그함수.json');
fixLecture('./public/premium_lectures/삼각함수성질.json');

console.log('Fixed all lecture JSON files to use single backslashes in memory!');
