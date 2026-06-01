/**
 * 수학2 숙제 크롭 + 정답 추출 통합 스크립트
 */
const fs = require('fs');
const path = require('path');

const BASE = 'c:\\mentos_os_clean\\public\\math_crops\\숙제\\수학2';
const OUT = 'c:\\mentos_os_clean\\public\\math_crops\\숙제\\수학2_out';
const AVS_PATH = 'c:\\mentos_os_clean\\src\\data\\avs_answers.json';

const CIRCLE_MAP = { '①': '1', '②': '2', '③': '3', '④': '4', '⑤': '5' };

const UNITS = [
  { folder: '01함수의극한', outName: '01함수의극한', title: '함수의 극한', key: '수학2_01함수의극한_통합숙제' },
  { folder: '02함수의연속', outName: '02함수의연속', title: '함수의 연속', key: '수학2_02함수의연속_통합숙제' },
  { folder: '03미분계수', outName: '03미분계수', title: '미분계수', key: '수학2_03미분계수_통합숙제' },
  { folder: '04도함수의활용1.2', outName: '04도함수활용12', title: '도함수의 활용 1·2', key: '수학2_04도함수활용12_통합숙제' },
  { folder: '05도함수의활용3', outName: '05도함수활용3', title: '도함수의 활용 3', key: '수학2_05도함수활용3_통합숙제' },
  { folder: '06부정적분과정적분', outName: '06부정적분정적분', title: '부정적분과 정적분', key: '수학2_06부정적분정적분_통합숙제' },
  { folder: '07정적분의활용', outName: '07정적분활용', title: '정적분의 활용', key: '수학2_07정적분활용_통합숙제' },
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
    if (!seen.has(fname)) {
      seen.add(fname);
      const fullPath = path.join(filesDir, fname);
      if (fs.existsSync(fullPath)) images.push(fullPath);
    }
  }
  return images;
}

function extractAnswers(htmlPath) {
  if (!fs.existsSync(htmlPath)) return [];
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const regex = /class="unit-answer">\s*<span>정답<\/span>\s*<span[^>]*>(.*?)<\/span>/gs;
  const answers = [];
  let m;
  while ((m = regex.exec(html)) !== null) {
    let ans = m[1].replace(/<[^>]+>/g, '').trim();
    if (CIRCLE_MAP[ans]) ans = CIRCLE_MAP[ans];
    answers.push(ans || '');
  }
  return answers;
}

function padNum(n) { return String(n).padStart(3, '0'); }

// 기존 avs_answers.json 로드
const avsData = JSON.parse(fs.readFileSync(AVS_PATH, 'utf-8'));
const report = {};

for (const unit of UNITS) {
  const outDir = path.join(OUT, unit.outName);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  let globalIdx = 1;
  const stage2End = { start: 1, end: 0 };
  const stage34End = { start: 0, end: 0 };
  const answerMap = {};

  const stages = ['2단계', '3.4단계'];
  for (let si = 0; si < stages.length; si++) {
    const stageName = stages[si];
    const stageDir = path.join(BASE, unit.folder, stageName);
    if (!fs.existsSync(stageDir)) {
      console.log(`  ⚠️ SKIP: ${unit.folder}/${stageName} (not found)`);
      continue;
    }

    const stageStart = globalIdx;

    // 문제 이미지
    const probHtml = path.join(stageDir, '문제.html');
    const probFiles = path.join(stageDir, '문제_files');
    const probImages = extractWebpFromHtml(probHtml, probFiles);

    // 해설 이미지 (정답및해설 또는 정답과해설)
    let ansHtml = path.join(stageDir, '정답및해설.html');
    let ansFiles = path.join(stageDir, '정답및해설_files');
    if (!fs.existsSync(ansHtml)) {
      ansHtml = path.join(stageDir, '정답과해설.html');
      ansFiles = path.join(stageDir, '정답과해설_files');
    }
    const ansImages = extractWebpFromHtml(ansHtml, ansFiles);
    const answers = extractAnswers(ansHtml);

    console.log(`📂 ${unit.folder}/${stageName}: 문제=${probImages.length}, 해설=${ansImages.length}, 정답=${answers.length}`);

    for (let i = 0; i < probImages.length; i++) {
      const pid = padNum(globalIdx);
      fs.copyFileSync(probImages[i], path.join(outDir, `${pid}.webp`));
      if (i < ansImages.length) {
        fs.copyFileSync(ansImages[i], path.join(outDir, `${pid}a.webp`));
      }
      const ans = i < answers.length ? answers[i] : '';
      if (ans) answerMap[pid] = ans;
      globalIdx++;
    }

    if (si === 0) {
      stage2End.end = globalIdx - 1;
      stage34End.start = globalIdx;
    } else {
      stage34End.end = globalIdx - 1;
    }
  }

  const totalProblems = globalIdx - 1;
  if (stage34End.end === 0) { stage34End.start = 1; stage34End.end = totalProblems; }

  // AVS 정답 저장
  avsData[unit.key] = answerMap;

  report[unit.outName] = {
    title: unit.title,
    key: unit.key,
    totalProblems,
    stage2: stage2End,
    stage34: stage34End,
    answersExtracted: Object.keys(answerMap).length,
  };

  console.log(`  ✅ ${unit.outName}: ${totalProblems}문제, ${Object.keys(answerMap).length}정답 → ${outDir}`);
  console.log(`     2단계: ${stage2End.start}~${stage2End.end}, 3.4단계: ${stage34End.start}~${stage34End.end}`);
}

// avs_answers.json 저장
fs.writeFileSync(AVS_PATH, JSON.stringify(avsData, null, 2), 'utf-8');

// 리포트 저장
const reportPath = path.join(OUT, '_crop_report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
console.log(`\n📊 Report: ${reportPath}`);
console.log(JSON.stringify(report, null, 2));
