const fs = require('fs');
const path = require('path');

const ROOT_DIR = 'c:/mentos_os_clean';
const HINT_DIRS = {
  'cases_step2': path.join(ROOT_DIR, 'public/math_hints/cases_step2'),
  'cases_step3': path.join(ROOT_DIR, 'public/math_hints/cases_step3'),
  'cases_step4': path.join(ROOT_DIR, 'public/math_hints/cases_step4'),
};

// ── 2차 수동 정밀 정답 수치 고정 매핑 ──
const FINAL_ANSWERS_MAP = {
  // cases_step2
  'cases_step2/004.json': '9',
  'cases_step2/009.json': '27',
  'cases_step2/012.json': '480',
  'cases_step2/014.json': '6!\\times 4!',
  'cases_step2/019.json': '576',
  'cases_step2/027.json': '6',
  'cases_step2/037.json': '7',
  'cases_step2/040.json': '22',
  'cases_step2/041.json': '96',
  
  // cases_step3
  'cases_step3/001.json': '22',
  'cases_step3/002.json': '14',
  'cases_step3/007.json': '50400',
  'cases_step3/009.json': '144',
  'cases_step3/012.json': '220',
  'cases_step3/016.json': '204',
  'cases_step3/025.json': '16',
  'cases_step3/033.json': '40',
  'cases_step3/034.json': '78',
  
  // cases_step4
  'cases_step4/003.json': '36',
  'cases_step4/021.json': '20',
  'cases_step4/022.json': '287',
};

function purifyAnswers() {
  console.log('✨ 경우의 수 정답 데이터 2차 정밀 정화 작업 시작...\n');

  let purifiedCount = 0;

  for (const [stepKey, dirPath] of Object.entries(HINT_DIRS)) {
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json')).sort();

    files.forEach(filename => {
      const filePath = path.join(dirPath, filename);
      let hintData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const key = `${stepKey}/${filename}`;

      let isModified = false;
      let ans = hintData.correctAnswer || hintData.answer || '';

      // 1. 수동 고정 매핑이 있는 경우 즉각 덮어씀
      if (FINAL_ANSWERS_MAP[key]) {
        hintData.correctAnswer = FINAL_ANSWERS_MAP[key];
        isModified = true;
        purifiedCount++;
        console.log(`💎 [정밀 덮어쓰기] ${key} ➔ "${FINAL_ANSWERS_MAP[key]}"`);
      } else if (ans) {
        // 2. 일반 이스케이프 찌꺼기 제거 및 트림
        let cleanAns = String(ans)
          .replace(/[\\'"“”‘’\$]/g, '')  // 특수문자 제거
          .replace(/\s+/g, '')          // 모든 공백 제거
          .trim();

        if (cleanAns !== String(ans)) {
          hintData.correctAnswer = cleanAns;
          isModified = true;
          purifiedCount++;
          console.log(`🧹 [이스케이프 소거] ${key}: "${ans}" ➔ "${cleanAns}"`);
        }
      }

      if (isModified) {
        fs.writeFileSync(filePath, JSON.stringify(hintData, null, 2), 'utf-8');
      }
    });
  }

  console.log('\n==================================================');
  console.log('✅ 2차 정밀 정화 작업 완벽하게 완료!');
  console.log(`- 완벽 정제 완료된 정답 데이터 개수: ${purifiedCount}건`);
  console.log('==================================================\n');
}

purifyAnswers();
