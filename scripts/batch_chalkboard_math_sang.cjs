const fs = require('fs');
const path = require('path');
const base = 'C:/mentos_os_clean/public/math_hints';

// 수학(상) 다항식, 나머지정리, 인수분해, 복소수, 이차방정식, 이차방정식과이차함수 단원 힌트 폴더 및 이미지 경로 매핑
const folders = [
  '다항식2단계', '다항식3단계', '다항식4단계',
  '항등식과나머지정리2단계', '항등식과나머지정리3단계', '항등식과나머지정리4단계',
  '인수분해2단계', '인수분해3단계', '인수분해4단계',
  '복소수2단계', '복소수3단계', '복소수4단계',
  '이차방정식2단계', '이차방정식3단계', '이차방정식4단계',
  '이차방정식과이차함수2단계', '이차방정식과이차함수3단계', '이차방정식과이차함수4단계'
];

const imgMap = {
  '다항식2단계': '/math_crops/(001)다항식/2단계',
  '다항식3단계': '/math_crops/(001)다항식/3단계',
  '다항식4단계': '/math_crops/(001)다항식/4단계',
  '항등식과나머지정리2단계': '/math_crops/(002)항등식과나머지정리/2단계',
  '항등식과나머지정리3단계': '/math_crops/(002)항등식과나머지정리/3단계',
  '항등식과나머지정리4단계': '/math_crops/(002)항등식과나머지정리/4단계',
  '인수분해2단계': '/math_crops/(003)인수분해/2단계',
  '인수분해3단계': '/math_crops/(003)인수분해/3단계',
  '인수분해4단계': '/math_crops/(003)인수분해/4단계',
  '복소수2단계': '/math_crops/(004)복소수/2단계',
  '복소수3단계': '/math_crops/(004)복소수/3단계',
  '복소수4단계': '/math_crops/(004)복소수/4단계',
  '이차방정식2단계': '/math_crops/(005)이차방정식/2단계',
  '이차방정식3단계': '/math_crops/(005)이차방정식/3단계',
  '이차방정식4단계': '/math_crops/(005)이차방정식/4단계',
  '이차방정식과이차함수2단계': '/math_crops/(006)이차방정식과이차함수/2단계',
  '이차방정식과이차함수3단계': '/math_crops/(006)이차방정식과이차함수/3단계',
  '이차방정식과이차함수4단계': '/math_crops/(006)이차방정식과이차함수/4단계'
};

let totalPatched = 0;
let totalSkipped = 0;
let totalMissing = 0;

folders.forEach(folder => {
  const dir = path.join(base, folder);
  if (!fs.existsSync(dir)) {
    console.log(`[SKIP] ${folder} - 폴더 없음`);
    totalMissing++;
    return;
  }

  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.json') && !f.includes('_v2') && !f.includes('backup'));

  let patched = 0, skipped = 0;

  files.forEach(fn => {
    const fp = path.join(dir, fn);
    try {
      const json = JSON.parse(fs.readFileSync(fp, 'utf8'));
      
      // 이미 problem_render가 있어도 갱신이 필요할 수 있으므로 덮어쓰거나 추가합니다.
      const pid = fn.replace('.json', '');
      const imgPath = imgMap[folder];

      // AVS 녹색 칠판 활성화를 위한 필수 객체 주입
      json.problem_render = {
        body: json.title || `${folder} - 문제 ${pid}`,
        choices: null, // 이미지에 보기가 포함되어 있으므로 null로 하여 칠판 이미지에 집중
        source_image: `${imgPath}/${pid}.webp`
      };

      fs.writeFileSync(fp, JSON.stringify(json, null, 2), 'utf8');
      patched++;
    } catch (e) {
      console.log(`  [ERR] ${fn}: ${e.message}`);
    }
  });

  totalPatched += patched;
  totalSkipped += skipped;
  console.log(`[OK] ${folder}: ${files.length}개 (칠판 렌더러 패치 완료: ${patched})`);
});

console.log(`\n========================================`);
console.log(`총 패치: ${totalPatched}개 폴더`);
console.log(`없는 폴더: ${totalMissing}개`);
console.log(`========================================`);
