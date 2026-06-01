/**
 * 수학2 01~03 정답 재추출 + 이미지 크롭
 * 사용자가 복원한 HTML에서 정답 + 해설 이미지 추출
 */
const fs = require('fs');
const path = require('path');

const BASE = 'c:\\mentos_os_clean\\public\\math_crops\\숙제\\수학2';
const AVS_PATH = 'c:\\mentos_os_clean\\src\\data\\avs_answers.json';
const CIRCLE_MAP = { '①': '1', '②': '2', '③': '3', '④': '4', '⑤': '5' };

const UNITS = [
  {
    folder: '01함수의극한',
    key: '수학2_01함수의극한_통합숙제',
    stage2Html: '2단계정답및해설.html',
    stage2Files: '2단계정답및해설_files',
    stage34Html: '3단계정답및해설.html', // 3.4단계
    stage34Files: '3.4단계정답및해설_files',
  },
  {
    folder: '02함수의연속',
    key: '수학2_02함수의연속_통합숙제',
    stage2Html: null,
    stage34Html: null,
  },
  {
    folder: '03미분계수',
    key: '수학2_03미분계수_통합숙제',
    stage2Html: null,
    stage34Html: null,
  },
];

// 먼저 02, 03의 파일명 확인
for (const unit of UNITS) {
  if (unit.stage2Html) continue; // 이미 설정됨
  const dir = path.join(BASE, unit.folder);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  console.log(`📂 ${unit.folder} HTML files: ${files.join(', ')}`);
  
  // 2단계 / 3단계 HTML 파일 찾기
  for (const f of files) {
    if (f.includes('2단계')) unit.stage2Html = f;
    if (f.includes('3') && !f.includes('2단계')) unit.stage34Html = f;
  }
  
  // _files 폴더 찾기
  const dirs = fs.readdirSync(dir).filter(d => {
    return fs.statSync(path.join(dir, d)).isDirectory() && d.includes('정답');
  });
  for (const d of dirs) {
    if (d.includes('2단계')) unit.stage2Files = d;
    if (d.includes('3')) unit.stage34Files = d;
  }
  
  console.log(`  stage2: ${unit.stage2Html} / ${unit.stage2Files}`);
  console.log(`  stage34: ${unit.stage34Html} / ${unit.stage34Files}`);
}

function extractAnswersImproved(htmlPath) {
  if (!fs.existsSync(htmlPath)) { console.log(`  ❌ Not found: ${htmlPath}`); return []; }
  const html = fs.readFileSync(htmlPath, 'utf-8');
  
  const blockRegex = /class="unit-answer">\s*<span>정답<\/span>\s*<span[^>]*>([\s\S]*?)<\/span>\s*<\/span>/g;
  const answers = [];
  let m;
  while ((m = blockRegex.exec(html)) !== null) {
    let content = m[1];
    
    const circleMatch = content.match(/<big>([①②③④⑤])<\/big>/);
    if (circleMatch) {
      answers.push(CIRCLE_MAP[circleMatch[1]] || circleMatch[1]);
      continue;
    }
    
    if (content.includes('mfrac')) {
      const fracMatch = content.match(/class="mord">(\d+)<\/span>[\s\S]*?class="mord">(\d+)<\/span>/);
      if (fracMatch) { answers.push(`${fracMatch[1]}/${fracMatch[2]}`); continue; }
    }
    
    const hasNeg = content.includes('−') || content.includes('mbin');
    const mordMatches = content.match(/class="mord">([\d.]+)<\/span>/g);
    if (mordMatches && mordMatches.length > 0) {
      const nums = mordMatches.map(s => s.match(/>([\d.]+)</)[1]);
      let val = nums.join('');
      if (hasNeg) val = '-' + val;
      answers.push(val);
      continue;
    }
    
    const plainText = content.replace(/<[^>]+>/g, '').trim();
    if (CIRCLE_MAP[plainText]) answers.push(CIRCLE_MAP[plainText]);
    else answers.push(plainText);
  }
  return answers;
}

function extractWebpFromHtml(htmlPath, filesDir) {
  if (!fs.existsSync(htmlPath) || !fs.existsSync(filesDir)) return [];
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

function padNum(n) { return String(n).padStart(3, '0'); }

const avsData = JSON.parse(fs.readFileSync(AVS_PATH, 'utf-8'));

// 기존 크롭 데이터의 문제 수 (이미 크롭됨)
const problemCounts = {
  '01함수의극한': { stage2: 20, stage34: 26 },
  '02함수의연속': { stage2: 16, stage34: 18 },
  '03미분계수': { stage2: 16, stage34: 21 },
};

for (const unit of UNITS) {
  const unitDir = path.join(BASE, unit.folder);
  const answerMap = {};
  let globalIdx = 1;
  
  // Stage 2
  if (unit.stage2Html) {
    const htmlPath = path.join(unitDir, unit.stage2Html);
    const answers = extractAnswersImproved(htmlPath);
    const probCount = problemCounts[unit.folder].stage2;
    console.log(`\n📂 ${unit.folder}/2단계: ${answers.length}정답, ${probCount}문제`);
    
    // 해설 이미지도 추출 (없던 것 보충)
    if (unit.stage2Files) {
      const filesDir = path.join(unitDir, unit.stage2Files);
      const ansImages = extractWebpFromHtml(htmlPath, filesDir);
      console.log(`  해설 이미지: ${ansImages.length}개`);
      
      // 해설 이미지가 없었던 것 보충
      for (let i = 0; i < probCount; i++) {
        const pid = padNum(globalIdx + i);
        const destPath = path.join(unitDir, `${pid}a.webp`);
        if (!fs.existsSync(destPath) && i < ansImages.length) {
          fs.copyFileSync(ansImages[i], destPath);
        }
      }
    }
    
    for (let i = 0; i < probCount; i++) {
      const pid = padNum(globalIdx);
      const ans = i < answers.length ? answers[i] : '';
      if (ans) answerMap[pid] = ans;
      globalIdx++;
    }
  }
  
  // Stage 3.4
  if (unit.stage34Html) {
    const htmlPath = path.join(unitDir, unit.stage34Html);
    const answers = extractAnswersImproved(htmlPath);
    const probCount = problemCounts[unit.folder].stage34;
    console.log(`📂 ${unit.folder}/3.4단계: ${answers.length}정답, ${probCount}문제`);
    
    if (unit.stage34Files) {
      const filesDir = path.join(unitDir, unit.stage34Files);
      const ansImages = extractWebpFromHtml(htmlPath, filesDir);
      console.log(`  해설 이미지: ${ansImages.length}개`);
      
      for (let i = 0; i < probCount; i++) {
        const pid = padNum(globalIdx + i);
        const destPath = path.join(unitDir, `${pid}a.webp`);
        if (!fs.existsSync(destPath) && i < ansImages.length) {
          fs.copyFileSync(ansImages[i], destPath);
        }
      }
    }
    
    for (let i = 0; i < probCount; i++) {
      const pid = padNum(globalIdx);
      const ans = i < answers.length ? answers[i] : '';
      if (ans) answerMap[pid] = ans;
      globalIdx++;
    }
  }
  
  const total = globalIdx - 1;
  const filled = Object.keys(answerMap).length;
  avsData[unit.key] = answerMap;
  console.log(`  ✅ ${unit.key}: ${filled}/${total} 정답 추출`);
}

fs.writeFileSync(AVS_PATH, JSON.stringify(avsData, null, 2), 'utf-8');
console.log('\n✅ avs_answers.json 업데이트 완료');
