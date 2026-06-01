/**
 * 수학1 정답 추출 스크립트
 * 정답및해설.html에서 unit-answer 태그를 파싱하여 avs_answers.json에 추가
 */
const fs = require('fs');
const path = require('path');

const BASE = 'c:\\mentos_os_clean\\public\\math_crops\\숙제\\대수 수학1';
const AVS_PATH = 'c:\\mentos_os_clean\\src\\data\\avs_answers.json';

// 원형 숫자를 숫자로 변환
const CIRCLE_MAP = { '①': '1', '②': '2', '③': '3', '④': '4', '⑤': '5' };

const UNITS = [
  { folders: ['01지수2단계', '01지수3.4단계'], key: '수학1_01지수_통합숙제', title: '지수' },
  { folders: ['02로그2단계', '02로그3.4단계'], key: '수학1_02로그_통합숙제', title: '로그' },
  { folders: ['03지수,로그함수2단계', '03지수,로그함수3.4단계단계'], key: '수학1_03지수로그함수_통합숙제', title: '지수로그함수' },
  { folders: ['04지수로그함수활용2단계', '04지수로그함수활용3.4단계'], key: '수학1_04지수로그함수활용_통합숙제', title: '지수로그함수활용' },
  { folders: ['05삼각함수성질및정의2단계', '05삼각함수성질및정의3.4단계'], key: '수학1_05삼각함수정의_통합숙제', title: '삼각함수정의' },
  { folders: ['06삼각함수그래프2단계', '06삼각함수그래프3.4단계'], key: '수학1_06삼각함수그래프_통합숙제', title: '삼각함수그래프' },
  { folders: ['07삼각함수활용2단계', '07삼각함수활용3.4단계'], key: '수학1_07삼각함수활용_통합숙제', title: '삼각함수활용' },
  { folders: ['08등차등비수열2단계', '09등차등비수열3.4단계'], key: '수학1_08등차등비수열_통합숙제', title: '등차등비수열' },
  { folders: ['10수열의합2단계', '11수열의합3.4단계'], key: '수학1_09수열의합_통합숙제', title: '수열의합' },
  { folders: ['12수학적귀납법2단계', '12수학적귀납법3.4단계'], key: '수학1_10수학적귀납법_통합숙제', title: '수학적귀납법' },
];

function extractAnswers(htmlPath) {
  if (!fs.existsSync(htmlPath)) return [];
  const html = fs.readFileSync(htmlPath, 'utf-8');
  
  // unit-answer 패턴으로 정답 추출
  const regex = /class="unit-answer">\s*<span>정답<\/span>\s*<span[^>]*>(.*?)<\/span>/gs;
  const answers = [];
  let m;
  while ((m = regex.exec(html)) !== null) {
    let ans = m[1].replace(/<[^>]+>/g, '').trim();
    // 원형 숫자 변환
    if (CIRCLE_MAP[ans]) ans = CIRCLE_MAP[ans];
    answers.push(ans || '');
  }
  return answers;
}

// 기존 avs_answers.json 로드
const avsData = JSON.parse(fs.readFileSync(AVS_PATH, 'utf-8'));
let addedCount = 0;

for (const unit of UNITS) {
  let globalIdx = 1;
  const answerMap = {};

  for (const folderName of unit.folders) {
    const htmlPath = path.join(BASE, folderName, '정답및해설.html');
    const answers = extractAnswers(htmlPath);
    
    // 문제.html에서 문제 수 확인
    const probHtml = path.join(BASE, folderName, '문제.html');
    let probCount = 0;
    if (fs.existsSync(probHtml)) {
      const html = fs.readFileSync(probHtml, 'utf-8');
      const imgs = html.match(/<img[^>]+src="[^"]+\.webp"/g) || [];
      // 중복 제거
      const seen = new Set();
      imgs.forEach(img => {
        const fname = img.match(/([^/"]+\.webp)/)?.[1];
        if (fname && !seen.has(fname)) { seen.add(fname); probCount++; }
      });
    }

    console.log(`📂 ${folderName}: 문제=${probCount}, 정답=${answers.length}`);

    // 정답 매핑 (문제 수 기준)
    for (let i = 0; i < probCount; i++) {
      const pid = String(globalIdx).padStart(3, '0');
      const ans = i < answers.length ? answers[i] : '';
      if (ans) {
        answerMap[pid] = ans;
      }
      globalIdx++;
    }
  }

  const totalProblems = globalIdx - 1;
  const answeredProblems = Object.keys(answerMap).length;
  
  // avs_answers.json에 추가
  avsData[unit.key] = answerMap;
  addedCount++;

  console.log(`  ✅ ${unit.key}: ${answeredProblems}/${totalProblems} 정답 추출`);
}

// 저장
fs.writeFileSync(AVS_PATH, JSON.stringify(avsData, null, 2), 'utf-8');
console.log(`\n📊 avs_answers.json 업데이트 완료: ${addedCount}개 단원 추가`);
