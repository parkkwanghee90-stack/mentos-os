const fs = require('fs');
const path = require('path');

const avsPath = 'c:/mentos_os_clean/public/data/avs_answers.json';
let avs = JSON.parse(fs.readFileSync(avsPath, 'utf8'));
const dir = 'c:/mentos_os_clean/public/math_hints';

const units = [
  '등차등비2단계', '등차등비3단계', '시그마용법2단계', '귀납적정의2단계',
  '경우의수4단계', '도형의이동4단계', '이차부등식4단계', '원의방정식4단계',
  '직선의방정식4단계', '점과좌표2단계', '점과좌표4단계',
  '삼각함수그래프4단계', '등차등비수열4단계', '수열의합4단계', '여러가지수열3단계'
];

let totalMerged = 0;

units.forEach(u => {
  const up = path.join(dir, u);
  if (!fs.existsSync(up)) {
    console.log(u + ': FOLDER NOT FOUND');
    return;
  }
  const fls = fs.readdirSync(up).filter(f => f.endsWith('.json') && !f.includes('_v2'));
  fls.forEach(f => {
    try {
      const d = JSON.parse(fs.readFileSync(path.join(up, f), 'utf8'));
      const n = f.replace('.json', '');
      const ca = d.correctAnswer || d.A;
      if (ca !== undefined && ca !== null) {
        const s = String(ca);
        if (s !== '.' && s.length < 20 
            && !s.includes('참조') 
            && !s.includes('계산')
            && !s.includes('따라서')
            && !s.includes('정답은')
            && s.indexOf('$') === -1) {
          if (!avs[u]) avs[u] = {};
          avs[u][n] = s;
          totalMerged++;
        }
      }
    } catch (e) {}
  });
  console.log(u + ': ' + Object.keys(avs[u] || {}).length);
});

fs.writeFileSync(avsPath, JSON.stringify(avs, null, 2));
console.log('Merged total:', totalMerged);
