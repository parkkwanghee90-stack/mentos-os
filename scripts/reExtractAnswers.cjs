/**
 * 수학1 + 수학2 정답 재추출 (KaTeX mord 포함)
 * 객관식: <big>⑤</big> → "5"
 * 서술형: <span class="mord">11</span> → "11"
 * 분수: <span class="mord">3</span>...<span class="mord">2</span> → "3/2"  
 */
const fs = require('fs');
const path = require('path');

const AVS_PATH = 'c:\\mentos_os_clean\\src\\data\\avs_answers.json';
const CIRCLE_MAP = { '①': '1', '②': '2', '③': '3', '④': '4', '⑤': '5' };

function extractAnswersImproved(htmlPath) {
  if (!fs.existsSync(htmlPath)) return [];
  const html = fs.readFileSync(htmlPath, 'utf-8');
  
  // unit-answer 블록 전체를 추출 (더 넓은 범위)
  const blockRegex = /class="unit-answer">\s*<span>정답<\/span>\s*<span[^>]*>([\s\S]*?)<\/span>\s*<\/span>/g;
  const answers = [];
  let m;
  while ((m = blockRegex.exec(html)) !== null) {
    let content = m[1];
    
    // 1) 객관식: <big>①②③④⑤</big>
    const circleMatch = content.match(/<big>([①②③④⑤])<\/big>/);
    if (circleMatch) {
      answers.push(CIRCLE_MAP[circleMatch[1]] || circleMatch[1]);
      continue;
    }
    
    // 2) KaTeX 서술형: mord 클래스에서 숫자 추출
    // 분수 체크: mfrac이 있으면 분수
    if (content.includes('mfrac')) {
      // 분자/분모 추출
      const fracMatch = content.match(/class="mord">(\d+)<\/span>[\s\S]*?class="mord">(\d+)<\/span>/);
      if (fracMatch) {
        answers.push(`${fracMatch[1]}/${fracMatch[2]}`);
        continue;
      }
    }
    
    // 음수 체크
    const hasNeg = content.includes('−') || content.includes('mbin');
    
    // mord에서 숫자들 추출
    const mordMatches = content.match(/class="mord">([\d.]+)<\/span>/g);
    if (mordMatches && mordMatches.length > 0) {
      const nums = mordMatches.map(s => s.match(/>([\d.]+)</)[1]);
      let val = nums.join('');
      if (hasNeg) val = '-' + val;
      answers.push(val);
      continue;
    }
    
    // 3) 일반 텍스트
    const plainText = content.replace(/<[^>]+>/g, '').trim();
    if (CIRCLE_MAP[plainText]) {
      answers.push(CIRCLE_MAP[plainText]);
    } else {
      answers.push(plainText);
    }
  }
  return answers;
}

// ─── 수학1 재추출 ───
const MATH1_BASE = 'c:\\mentos_os_clean\\public\\math_crops\\숙제\\대수 수학1';
const MATH1_UNITS = [
  { folders: ['01지수2단계', '01지수3.4단계'], key: '수학1_01지수_통합숙제' },
  { folders: ['02로그2단계', '02로그3.4단계'], key: '수학1_02로그_통합숙제' },
  { folders: ['03지수,로그함수2단계', '03지수,로그함수3.4단계단계'], key: '수학1_03지수로그함수_통합숙제' },
  { folders: ['04지수로그함수활용2단계', '04지수로그함수활용3.4단계'], key: '수학1_04지수로그함수활용_통합숙제' },
  { folders: ['05삼각함수성질및정의2단계', '05삼각함수성질및정의3.4단계'], key: '수학1_05삼각함수정의_통합숙제' },
  { folders: ['06삼각함수그래프2단계', '06삼각함수그래프3.4단계'], key: '수학1_06삼각함수그래프_통합숙제' },
  { folders: ['07삼각함수활용2단계', '07삼각함수활용3.4단계'], key: '수학1_07삼각함수활용_통합숙제' },
  { folders: ['08등차등비수열2단계', '09등차등비수열3.4단계'], key: '수학1_08등차등비수열_통합숙제' },
  { folders: ['10수열의합2단계', '11수열의합3.4단계'], key: '수학1_09수열의합_통합숙제' },
  { folders: ['12수학적귀납법2단계', '12수학적귀납법3.4단계'], key: '수학1_10수학적귀납법_통합숙제' },
];

// ─── 수학2 재추출 ───
const MATH2_BASE = 'c:\\mentos_os_clean\\public\\math_crops\\숙제\\수학2';
// 원본 HTML은 하위 폴더에 아직 있을 수 있음
const MATH2_UNITS = [
  { folder: '01함수의극한', stages: ['2단계', '3.4단계'], key: '수학2_01함수의극한_통합숙제' },
  { folder: '02함수의연속', stages: ['2단계', '3.4단계'], key: '수학2_02함수의연속_통합숙제' },
  { folder: '03미분계수', stages: ['2단계', '3.4단계'], key: '수학2_03미분계수_통합숙제' },
  { folder: '04도함수의활용1.2', stages: ['2단계', '3.4단계'], key: '수학2_04도함수활용12_통합숙제' },
  { folder: '05도함수의활용3', stages: ['2단계', '3.4단계'], key: '수학2_05도함수활용3_통합숙제' },
  { folder: '06부정적분과정적분', stages: ['2단계', '3.4단계'], key: '수학2_06부정적분정적분_통합숙제' },
  { folder: '07정적분의활용', stages: ['2단계', '3.4단계'], key: '수학2_07정적분활용_통합숙제' },
];

const avsData = JSON.parse(fs.readFileSync(AVS_PATH, 'utf-8'));

function countProblems(htmlPath) {
  if (!fs.existsSync(htmlPath)) return 0;
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const imgs = html.match(/<img[^>]+src="[^"]+\.webp"/g) || [];
  const seen = new Set();
  imgs.forEach(img => {
    const fname = img.match(/([^/"]+\.webp)/)?.[1];
    if (fname) seen.add(fname);
  });
  return seen.size;
}

console.log('═══ 수학1 정답 재추출 ═══');
for (const unit of MATH1_UNITS) {
  let globalIdx = 1;
  const answerMap = {};
  
  for (const folderName of unit.folders) {
    const ansHtml = path.join(MATH1_BASE, folderName, '정답및해설.html');
    const probHtml = path.join(MATH1_BASE, folderName, '문제.html');
    const probCount = countProblems(probHtml);
    const answers = extractAnswersImproved(ansHtml);
    
    for (let i = 0; i < probCount; i++) {
      const pid = String(globalIdx).padStart(3, '0');
      const ans = i < answers.length ? answers[i] : '';
      if (ans) answerMap[pid] = ans;
      globalIdx++;
    }
  }
  
  const total = globalIdx - 1;
  const filled = Object.keys(answerMap).length;
  const prev = Object.keys(avsData[unit.key] || {}).length;
  avsData[unit.key] = answerMap;
  console.log(`  ${unit.key}: ${prev} → ${filled}/${total}`);
}

console.log('\n═══ 수학2 정답 재추출 ═══');
for (const unit of MATH2_UNITS) {
  let globalIdx = 1;
  const answerMap = {};
  
  for (const stageName of unit.stages) {
    const stageDir = path.join(MATH2_BASE, unit.folder, stageName);
    // 원본 HTML이 여전히 stageDir에 있는 경우
    let ansHtml = path.join(stageDir, '정답및해설.html');
    if (!fs.existsSync(ansHtml)) {
      ansHtml = path.join(stageDir, '정답과해설.html');
    }
    const probHtml = path.join(stageDir, '문제.html');
    
    if (!fs.existsSync(probHtml)) {
      // 원본이 크롭으로 덮어씌워진 경우 - 수학2_out에서 리포트로 문제 수 확인
      console.log(`  ⚠️ ${unit.folder}/${stageName}: 원본 HTML 없음`);
      continue;
    }
    
    const probCount = countProblems(probHtml);
    const answers = extractAnswersImproved(ansHtml);
    
    for (let i = 0; i < probCount; i++) {
      const pid = String(globalIdx).padStart(3, '0');
      const ans = i < answers.length ? answers[i] : '';
      if (ans) answerMap[pid] = ans;
      globalIdx++;
    }
  }
  
  const total = globalIdx - 1;
  const filled = Object.keys(answerMap).length;
  const prev = Object.keys(avsData[unit.key] || {}).length;
  avsData[unit.key] = answerMap;
  console.log(`  ${unit.key}: ${prev} → ${filled}/${total}`);
}

fs.writeFileSync(AVS_PATH, JSON.stringify(avsData, null, 2), 'utf-8');
console.log('\n✅ avs_answers.json 업데이트 완료');
