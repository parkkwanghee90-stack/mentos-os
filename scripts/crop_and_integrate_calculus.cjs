/**
 * crop_and_integrate_calculus.cjs
 * 
 * 1. 미적분심화 HTML에서 이미지 순서 파싱 → 순번 파일로 복사
 * 2. 정답 추출 → avs_answers.json에 통합
 * 3. 크롭 보고서 생성
 */
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public', 'math_crops', '숙제', '미적분심화');
const DST_BASE = path.join(__dirname, '..', 'public', 'math_crops', '숙제', '미적분');
const AVS_PATH = path.join(__dirname, '..', 'src', 'data', 'avs_answers.json');

// 원형숫자 변환
const CIRCLE_MAP = {'①':'1','②':'2','③':'3','④':'4','⑤':'5','⑥':'6','⑦':'7','⑧':'8','⑨':'9','⑩':'10'};

function convertCircle(str) {
  let r = str;
  for (const [c,n] of Object.entries(CIRCLE_MAP)) r = r.split(c).join(n);
  return r.trim();
}

function extractAnswers(htmlPath) {
  if (!fs.existsSync(htmlPath)) return [];
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const regex = /정답<\/span>(.*?)<\/div>/gs;
  const answers = [];
  let m;
  while ((m = regex.exec(html)) !== null) {
    let c = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (c) answers.push(convertCircle(c));
  }
  // 중복 반복 제거
  if (answers.length > 0 && answers.length % 2 === 0) {
    const half = answers.length / 2;
    if (answers.slice(0, half).every((v,i) => v === answers[half+i])) return answers.slice(0, half);
  }
  return answers;
}

function extractImageOrder(htmlPath, filesDir) {
  if (!fs.existsSync(htmlPath)) return [];
  const html = fs.readFileSync(htmlPath, 'utf-8');
  // 문제 이미지 순서 (해시 webp만)
  const regex = /src="\.\/[^"]*_files\/([a-f0-9]{20,}\.webp)"/g;
  const images = [];
  const seen = new Set();
  let m;
  while ((m = regex.exec(html)) !== null) {
    if (!seen.has(m[1])) { seen.add(m[1]); images.push(m[1]); }
  }
  return images;
}

// 단원 정의
const UNITS = [
  { stages: ['01수열의극한2단계','01수열의극한3단계','01수열의극한4단계'], dst: '01수열의극한', key: '미적분_01수열의극한_통합숙제', title: '수열의 극한' },
  { stages: ['02급수2단계','02급수3단계','02급수4단계'], dst: '02급수', key: '미적분_02급수_통합숙제', title: '급수' },
  { stages: ['03지수로그함수의미분2단계','03지수로그함수의미분3.4단계'], dst: '03지수로그함수미분', key: '미적분_03지수로그함수미분_통합숙제', title: '지수로그함수의 미분' },
  { stages: ['04삼각함수의미분2단계','04삼각함수의미분3단계','04삼각함수의미분4단계'], dst: '04삼각함수미분', key: '미적분_04삼각함수미분_통합숙제', title: '삼각함수의 미분' },
  { stages: ['05여러가지미분법2단계','05여러가지미분법3.4단계'], dst: '05여러가지미분법', key: '미적분_05여러가지미분법_통합숙제', title: '여러가지 미분법' },
  { stages: ['06도함수의활용1/2단계','06도함수의활용1/3.4단계'], dst: '06도함수활용1', key: '미적분_06도함수활용1_통합숙제', title: '도함수의 활용 1' },
  { stages: ['07도함수의활용2/2단계','07도함수의활용2/3.4단계'], dst: '07도함수활용2', key: '미적분_07도함수활용2_통합숙제', title: '도함수의 활용 2' },
  { stages: ['08여러가지적분법/2단계','08여러가지적분법/3.4단계'], dst: '08여러가지적분법', key: '미적분_08여러가지적분법_통합숙제', title: '여러가지 적분법' },
  { stages: ['09정적분/2단계','09정적분/3.4단계'], dst: '09정적분', key: '미적분_09정적분_통합숙제', title: '정적분' },
];

// ═══ 실행 ═══
console.log('═══ 미적분심화 크롭 & 통합 시작 ═══\n');

const allAnswers = {};
const cropReport = [];

for (const unit of UNITS) {
  const dstDir = path.join(DST_BASE, unit.dst);
  if (!fs.existsSync(dstDir)) fs.mkdirSync(dstDir, { recursive: true });
  
  let globalNum = 1;
  const unitAnswers = {};
  const stageRanges = {};
  
  console.log(`\n── ${unit.title} (${unit.dst}) ──`);
  
  for (const stagePath of unit.stages) {
    const fullDir = path.join(BASE, stagePath);
    const stageLabel = stagePath.includes('2단계') ? '2단계' : 
                       stagePath.includes('3단계') ? '3단계' :
                       stagePath.includes('3.4단계') ? '3·4단계' : '4단계';
    
    // 문제 이미지 추출
    const problemHtml = path.join(fullDir, '문제.html');
    const solutionHtml = path.join(fullDir, '정답및해설.html');
    const problemImages = extractImageOrder(problemHtml, path.join(fullDir, '문제_files'));
    const solutionImages = extractImageOrder(solutionHtml, path.join(fullDir, '정답및해설_files'));
    const answers = extractAnswers(solutionHtml);
    
    // 첫 번째 이미지가 제목/헤더인 경우 스킵 (정답 수보다 이미지가 1개 많은 경우)
    let startIdx = 0;
    if (problemImages.length === answers.length + 1) {
      startIdx = 1; // 첫 번째 이미지(제목)를 건너뜀
    }
    
    const stageStart = globalNum;
    const problemCount = answers.length;
    
    for (let i = 0; i < problemCount; i++) {
      const padded = String(globalNum).padStart(3, '0');
      
      // 문제 이미지 복사
      const srcImgIdx = startIdx + i;
      if (srcImgIdx < problemImages.length) {
        const srcImg = path.join(fullDir, '문제_files', problemImages[srcImgIdx]);
        if (fs.existsSync(srcImg)) {
          fs.copyFileSync(srcImg, path.join(dstDir, `${padded}.webp`));
        }
      }
      
      // 해설 이미지 복사
      if (i < solutionImages.length) {
        // 해설도 헤더 스킵
        const solIdx = solutionImages.length === answers.length + 1 ? i + 1 : i;
        if (solIdx < solutionImages.length) {
          const srcSol = path.join(fullDir, '정답및해설_files', solutionImages[solIdx]);
          if (fs.existsSync(srcSol)) {
            fs.copyFileSync(srcSol, path.join(dstDir, `${padded}a.webp`));
          }
        }
      }
      
      // 정답 저장
      unitAnswers[padded] = answers[i];
      globalNum++;
    }
    
    const stageEnd = globalNum - 1;
    stageRanges[stageLabel] = { start: stageStart, end: stageEnd };
    console.log(`  ${stageLabel}: ${problemCount}문제 (${String(stageStart).padStart(3,'0')}~${String(stageEnd).padStart(3,'0')})`);
  }
  
  const totalProblems = globalNum - 1;
  allAnswers[unit.key] = unitAnswers;
  
  cropReport.push({
    id: unit.dst,
    title: unit.title,
    key: unit.key,
    totalProblems,
    stageRanges,
    imagePath: `/math_crops/숙제/미적분/${unit.dst}/`
  });
  
  console.log(`  → 총 ${totalProblems}문제 크롭 완료`);
}

// avs_answers.json에 통합
console.log('\n═══ avs_answers.json 통합 ═══');
const avsData = JSON.parse(fs.readFileSync(AVS_PATH, 'utf-8'));
let addedCount = 0;
for (const [key, answers] of Object.entries(allAnswers)) {
  avsData[key] = answers;
  addedCount++;
  console.log(`  추가: ${key} (${Object.keys(answers).length}개 정답)`);
}
fs.writeFileSync(AVS_PATH, JSON.stringify(avsData, null, 2), 'utf-8');
console.log(`\n✅ avs_answers.json에 ${addedCount}개 키 추가 완료`);

// 크롭 보고서 저장
const reportPath = path.join(DST_BASE, '_crop_report.json');
fs.writeFileSync(reportPath, JSON.stringify(cropReport, null, 2), 'utf-8');
console.log(`✅ 크롭 보고서: ${reportPath}`);

// SSOT 가이드 출력
console.log('\n═══ homeworkSSOT.js 추가 가이드 ═══');
for (const r of cropReport) {
  const stages = Object.entries(r.stageRanges).map(([k,v]) => `'${k}': { start: ${v.start}, end: ${v.end} }`).join(', ');
  console.log(`{
  id: 'hw_cal_${r.id.slice(0,2)}',
  title: '${r.title}',
  subject: '미적분',
  folderName: '${r.id}',
  hintKey: null,
  answerKey: '${r.key}',
  problemCount: ${r.totalProblems},
  imagePath: '${r.imagePath}',
  relatedUnit: '${r.title}',
  stages: { ${stages} },
},`);
}
