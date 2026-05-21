const fs = require('fs');
const path = require('path');
const base = 'C:/mentos_os_clean/public/math_hints';

// 수학1 중간 단원 (삼각함수~수열) 힌트 폴더 목록
const folders = [
  '삼각함수활용2단계', '삼각함수활용3단계',
  '삼각함수성질2단계', '삼각함수3단계',
  '삼각함수그래프2단계', '삼각함수그래프3단계', '삼각함수그래프',
  '등차등비2단계', '등차등비3단계', '등차등비수열4단계',
  '시그마용법2단계', '여러가지수열3단계', '수열의합4단계',
  '귀납적정의2단계', '수학적귀납법3단계', '수학적귀납법4단계'
];

// 이미지 소스 매핑
const imgMap = {
  '삼각함수활용2단계': '/math_crops/(5)수학1 중간/2단계/삼각함수활용2단계',
  '삼각함수활용3단계': '/math_crops/(5)수학1 중간/3단계/삼각함수활용3단계',
  '삼각함수성질2단계': '/math_crops/(5)수학1 중간/2단계/삼각함수성질2단계',
  '삼각함수3단계': '/math_crops/(5)수학1 중간/3단계/삼각함수3단계',
  '삼각함수그래프2단계': '/math_crops/(5)수학1 중간/2단계/삼각함수그래프2단계',
  '삼각함수그래프3단계': '/math_crops/(5)수학1 중간/3단계/삼각함수그래프3단계',
  '삼각함수그래프': '/math_crops/(5)수학1 중간/4단계/삼각함수그래프',
  '등차등비2단계': '/math_crops/(5)수학1 중간/2단계/등차등비2단계',
  '등차등비3단계': '/math_crops/(5)수학1 중간/3단계/등차등비3단계',
  '등차등비수열4단계': '/math_crops/(5)수학1 중간/4단계/등차등비수열4단계',
  '시그마용법2단계': '/math_crops/(5)수학1 중간/2단계/시그마용법2단계',
  '여러가지수열3단계': '/math_crops/(5)수학1 중간/3단계/여러가지수열3단계',
  '수열의합4단계': '/math_crops/(5)수학1 중간/4단계/수열의합4단계',
  '귀납적정의2단계': '/math_crops/(5)수학1 중간/2단계/귀납적정의2단계',
  '수학적귀납법3단계': '/math_crops/(5)수학1 중간/3단계/수학적귀납법3단계',
  '수학적귀납법4단계': '/math_crops/(5)수학1 중간/4단계/수학적귀납법4단계'
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
      
      // 이미 problem_render가 있으면 스킵
      if (json.problem_render) {
        skipped++;
        return;
      }

      // problem_render 추가: body는 기존 title이나 문제 텍스트 활용
      const pid = fn.replace('.json', '');
      const imgPath = imgMap[folder] || `/math_crops/${folder}`;

      json.problem_render = {
        body: json.title || `${folder} - 문제 ${pid}`,
        choices: null, // 이미지에 보기가 포함되어 있으므로 null
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
  console.log(`[OK] ${folder}: ${files.length}개 (패치:${patched}, 기존칠판:${skipped})`);
});

console.log(`\n========================================`);
console.log(`총 패치: ${totalPatched}개`);
console.log(`기존 칠판: ${totalSkipped}개`);
console.log(`없는 폴더: ${totalMissing}개`);
console.log(`========================================`);
