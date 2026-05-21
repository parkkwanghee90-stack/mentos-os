import fs from 'fs';
import path from 'path';

const baseDir = './public/math_hints';
const targetFolders = [
  '고차방정식2단계', '고차방정식3단계', '고차방정식4단계',
  '이차부등식2단계', '이차부등식3단계', '이차부등식4단계',
  '원의방정식2단계', '원의방정식3단계', '원의방정식4단계',
  '도형의이동2단계', '도형의이동3단계', '도형의이동4단계'
];

const missing = [];

targetFolders.forEach(folder => {
  const folderPath = path.join(baseDir, folder);
  if (!fs.existsSync(folderPath)) return;

  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));
  files.forEach(file => {
    const filePath = path.join(folderPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let data;
    let broken = false;
    try {
      data = JSON.parse(content);
    } catch (e) {
      broken = true;
    }

    if (broken || !data.finalAnswer) {
      const problemNumber = parseInt(file.replace('.json', ''));
      missing.push({
        unit: folder.replace(/[0-9]단계$/, ''),
        stage: parseInt(folder.match(/[0-9]/)?.[0]),
        problemNumber: problemNumber,
        sourceFile: path.join(folder, file),
        reason: broken ? 'Broken JSON' : 'Missing finalAnswer'
      });
    }
  });
});

fs.writeFileSync('./scripts/missing_final_answers.json', JSON.stringify(missing, null, 2));
console.log(`Total missing: ${missing.length}`);
console.log('List saved to ./scripts/missing_final_answers.json');
