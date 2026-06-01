/**
 * 수학1 숙제 크롭 스크립트
 * HTML에서 문제/해설 이미지를 추출하여 001.webp, 001a.webp 형태로 복사
 */
const fs = require('fs');
const path = require('path');

const BASE = 'c:\\mentos_os_clean\\public\\math_crops\\숙제\\대수 수학1';
const OUT = 'c:\\mentos_os_clean\\public\\math_crops\\숙제\\수학1';

// 단원 매핑: 폴더명 → 통합 단원명 + 출력 폴더
const UNITS = [
  { folders: ['01지수2단계', '01지수3.4단계'], outName: '01지수', title: '지수' },
  { folders: ['02로그2단계', '02로그3.4단계'], outName: '02로그', title: '로그' },
  { folders: ['03지수,로그함수2단계', '03지수,로그함수3.4단계단계'], outName: '03지수로그함수', title: '지수·로그함수' },
  { folders: ['04지수로그함수활용2단계', '04지수로그함수활용3.4단계'], outName: '04지수로그함수활용', title: '지수로그함수 활용' },
  { folders: ['05삼각함수성질및정의2단계', '05삼각함수성질및정의3.4단계'], outName: '05삼각함수정의', title: '삼각함수 성질·정의' },
  { folders: ['06삼각함수그래프2단계', '06삼각함수그래프3.4단계'], outName: '06삼각함수그래프', title: '삼각함수 그래프' },
  { folders: ['07삼각함수활용2단계', '07삼각함수활용3.4단계'], outName: '07삼각함수활용', title: '삼각함수 활용' },
  { folders: ['08등차등비수열2단계', '09등차등비수열3.4단계'], outName: '08등차등비수열', title: '등차·등비수열' },
  { folders: ['10수열의합2단계', '11수열의합3.4단계'], outName: '09수열의합', title: '수열의 합' },
  { folders: ['12수학적귀납법2단계', '12수학적귀납법3.4단계'], outName: '10수학적귀납법', title: '수학적 귀납법' },
];

function extractWebpFromHtml(htmlPath, filesDir) {
  if (!fs.existsSync(htmlPath)) return [];
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const regex = /<img[^>]+src="([^"]+\.webp)"/gi;
  const images = [];
  const seen = new Set();
  let m;
  while ((m = regex.exec(html)) !== null) {
    const fname = path.basename(m[1]);
    // 중복 제거 (같은 이미지가 반복될 수 있음)
    if (!seen.has(fname)) {
      seen.add(fname);
      const fullPath = path.join(filesDir, fname);
      if (fs.existsSync(fullPath)) {
        images.push(fullPath);
      }
    }
  }
  return images;
}

function padNum(n) {
  return String(n).padStart(3, '0');
}

const report = {};

for (const unit of UNITS) {
  const outDir = path.join(OUT, unit.outName);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  let globalIdx = 1;
  const stage2End = { start: 1, end: 0 };
  const stage34End = { start: 0, end: 0 };

  for (let si = 0; si < unit.folders.length; si++) {
    const folderName = unit.folders[si];
    const folderPath = path.join(BASE, folderName);
    if (!fs.existsSync(folderPath)) {
      console.log(`  ⚠️ SKIP: ${folderName} (not found)`);
      continue;
    }

    const isStage2 = si === 0;
    const stageStart = globalIdx;

    // 문제 이미지
    const probHtml = path.join(folderPath, '문제.html');
    const probFiles = path.join(folderPath, '문제_files');
    const probImages = extractWebpFromHtml(probHtml, probFiles);

    // 해설 이미지
    const ansHtml = path.join(folderPath, '정답및해설.html');
    const ansFiles = path.join(folderPath, '정답및해설_files');
    const ansImages = extractWebpFromHtml(ansHtml, ansFiles);

    console.log(`📂 ${folderName}: 문제=${probImages.length}, 해설=${ansImages.length}`);

    for (let i = 0; i < probImages.length; i++) {
      const pid = padNum(globalIdx);
      // 문제 복사
      fs.copyFileSync(probImages[i], path.join(outDir, `${pid}.webp`));
      // 해설 복사 (있으면)
      if (i < ansImages.length) {
        fs.copyFileSync(ansImages[i], path.join(outDir, `${pid}a.webp`));
      }
      globalIdx++;
    }

    if (isStage2) {
      stage2End.end = globalIdx - 1;
      stage34End.start = globalIdx;
    } else {
      stage34End.end = globalIdx - 1;
    }
  }

  const totalProblems = globalIdx - 1;
  // 3.4단계가 없으면 2단계와 동일하게
  if (stage34End.end === 0) {
    stage34End.start = 1;
    stage34End.end = totalProblems;
  }

  report[unit.outName] = {
    title: unit.title,
    totalProblems,
    stage2: stage2End,
    stage34: stage34End,
  };

  console.log(`  ✅ ${unit.outName}: ${totalProblems} problems → ${outDir}`);
  console.log(`     2단계: ${stage2End.start}~${stage2End.end}, 3.4단계: ${stage34End.start}~${stage34End.end}`);
}

// JSON으로 리포트 저장
const reportPath = path.join(OUT, '_crop_report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
console.log(`\n📊 Report saved: ${reportPath}`);
console.log(JSON.stringify(report, null, 2));
