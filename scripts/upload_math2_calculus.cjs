const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'mentos-assets';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

// Path mapping (inline version of pathMapping.js for CJS)
const PATH_MAP = {
  '(7)수학2': 'math2',
  '수학2': 'math2',
  '미적분': 'calculus',
  '확통수능': 'stats_csat',
  '함수의 극한': 'func_limit',
  '함수의극한': 'func_limit',
  '함수의 연속': 'func_continuity',
  '함수의연속': 'func_continuity',
  '미분계수': 'derivative_coeff',
  '미분의활용': 'derivative_util',
  '도함수의 활용1': 'derivative_app1',
  '도함수의 활용': 'derivative_app',
  '도함수의활용1': 'derivative_app1',
  '도함수의활용2': 'derivative_app2',
  '도함수의활용': 'derivative_app',
  '부정적분과 정적분': 'indef_def_integral',
  '정적분의 활용': 'def_integral_app',
  '정적분': 'def_integral',
  '지수로그함수의극한': 'explog_limit',
  '지수로그삼각함수의 미분법': 'explog_trig_diff',
  '삼각함수합성과미분': 'trig_composite_diff',
  '여러가지 미분법': 'various_diff',
  '여러가지미분법': 'various_diff',
  '여러가지 함수의 적분': 'various_func_integral',
  '여러가지적분': 'various_integral',
  '극한': 'limit',
  '급수': 'series',
  '2단계': 'step2',
  '3단계': 'step3',
  '4단계': 'step4',
};

function sanitizePart(part) {
  if (!part) return part;
  if (PATH_MAP[part]) return PATH_MAP[part];
  
  let sanitized = part;
  // Sort by length descending to match longer keys first
  const entries = Object.entries(PATH_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [ko, en] of entries) {
    sanitized = sanitized.split(ko).join(en);
  }
  
  return sanitized
    .replace(/[가-힣]/g, '_')
    .replace(/[()[\]\s]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
}

function getSafePath(relPath) {
  if (!relPath) return relPath;
  return relPath.split('/').map(part => sanitizePart(part)).join('/');
}

async function uploadFile(localPath, rawRemotePath) {
  const remotePath = getSafePath(rawRemotePath);
  const buffer = fs.readFileSync(localPath);
  const contentType = localPath.endsWith('.json') ? 'application/json; charset=utf-8' : 'application/octet-stream';
  const encodedRemotePath = remotePath.split('/').map(encodeURIComponent).join('/');
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodedRemotePath}`;

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: buffer,
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`  ❌ FAIL ${remotePath} (raw: ${rawRemotePath}): ${res.status} ${errText}`);
    return false;
  }
  return true;
}

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

async function main() {
  console.log('====================================');
  console.log(' 수학2 + 미적분 Supabase 업로드 시작');
  console.log('====================================\n');

  // ─── STEP 1: 수학2 힌트 파일 업로드 ───
  const math2HintDir = 'DIAMOND_BOX_4/수학2_AVS_정답시스템_2026_05_19/math_hints/(7)수학2';
  console.log('📘 STEP 1: 수학2 힌트 파일 업로드');
  
  let math2Uploaded = 0, math2Failed = 0;
  
  if (fs.existsSync(math2HintDir)) {
    const unitDirs = fs.readdirSync(math2HintDir).filter(f => 
      fs.statSync(path.join(math2HintDir, f)).isDirectory()
    );
    console.log(`   ${unitDirs.length}개 단원 발견\n`);
    
    for (const unitDir of unitDirs) {
      const unitPath = path.join(math2HintDir, unitDir);
      const files = getAllFiles(unitPath).filter(f => f.endsWith('.json'));
      console.log(`   📂 ${unitDir} (${files.length} files)`);
      
      // Upload in batches of 5
      for (let i = 0; i < files.length; i += 5) {
        const batch = files.slice(i, i + 5);
        const results = await Promise.all(batch.map(async (localPath) => {
          const relPath = path.relative(unitPath, localPath).split(path.sep).join('/');
          const rawRemotePath = `math_hints/(7)수학2/${unitDir}/${relPath}`;
          return uploadFile(localPath, rawRemotePath);
        }));
        results.forEach(ok => ok ? math2Uploaded++ : math2Failed++);
      }
    }
    console.log(`\n   ✅ 수학2: ${math2Uploaded} 업로드, ${math2Failed} 실패\n`);
  } else {
    console.log('   ⚠️ 수학2 폴더 없음:', math2HintDir);
  }

  // ─── STEP 2: 미적분 힌트 파일 업로드 ───
  console.log('📗 STEP 2: 미적분 힌트 파일 업로드');
  
  const calcHintDir = 'DIAMOND_BOX_4/미적분_AVS_정답시스템_2026_05_20/math_hints';
  let calcUploaded = 0, calcFailed = 0;
  
  if (fs.existsSync(calcHintDir)) {
    const unitDirs = fs.readdirSync(calcHintDir).filter(f => 
      fs.statSync(path.join(calcHintDir, f)).isDirectory()
    );
    console.log(`   ${unitDirs.length}개 단원 발견\n`);
    
    for (const unitDir of unitDirs) {
      const unitPath = path.join(calcHintDir, unitDir);
      const files = getAllFiles(unitPath).filter(f => f.endsWith('.json'));
      if (files.length === 0) {
        console.log(`   ⏭️  ${unitDir} (빈 폴더, 건너뜀)`);
        continue;
      }
      console.log(`   📂 ${unitDir} (${files.length} files)`);
      
      for (let i = 0; i < files.length; i += 5) {
        const batch = files.slice(i, i + 5);
        const results = await Promise.all(batch.map(async (localPath) => {
          const relPath = path.relative(unitPath, localPath).split(path.sep).join('/');
          const rawRemotePath = `math_hints/${unitDir}/${relPath}`;
          return uploadFile(localPath, rawRemotePath);
        }));
        results.forEach(ok => ok ? calcUploaded++ : calcFailed++);
      }
    }
    console.log(`\n   ✅ 미적분: ${calcUploaded} 업로드, ${calcFailed} 실패\n`);
  } else {
    // Fallback: use DIAMOND_BOX_4/math_hints/ directly for calculus folders
    console.log('   미적분 AVS 폴더 없음, DIAMOND_BOX_4/math_hints/ 에서 미적분 단원 탐색...');
    const mainHintDir = 'DIAMOND_BOX_4/math_hints';
    const calcPrefixes = ['1)', '2)', '3)', '4)', '5)', '6)', '7)', '8)'];
    const unitDirs = fs.readdirSync(mainHintDir)
      .filter(f => calcPrefixes.some(p => f.startsWith(p)) && fs.statSync(path.join(mainHintDir, f)).isDirectory());
    
    console.log(`   ${unitDirs.length}개 미적분 단원 발견\n`);
    
    for (const unitDir of unitDirs) {
      const unitPath = path.join(mainHintDir, unitDir);
      const files = getAllFiles(unitPath).filter(f => f.endsWith('.json'));
      if (files.length === 0) continue;
      console.log(`   📂 ${unitDir} (${files.length} files)`);
      
      for (let i = 0; i < files.length; i += 5) {
        const batch = files.slice(i, i + 5);
        const results = await Promise.all(batch.map(async (localPath) => {
          const relPath = path.relative(unitPath, localPath).split(path.sep).join('/');
          const rawRemotePath = `math_hints/${unitDir}/${relPath}`;
          return uploadFile(localPath, rawRemotePath);
        }));
        results.forEach(ok => ok ? calcUploaded++ : calcFailed++);
      }
    }
    console.log(`\n   ✅ 미적분: ${calcUploaded} 업로드, ${calcFailed} 실패\n`);
  }

  // ─── STEP 3: 마스터 JSON 파일 업로드 ───
  console.log('📦 STEP 3: 마스터 JSON 파일 재업로드');
  
  const masterFiles = [
    { local: 'public/data/math_problem_texts.json', remote: 'data/math_problem_texts.json' },
    { local: 'public/data/avs_answers.json', remote: 'data/avs_answers.json' },
    { local: 'public/data/answers_master.json', remote: 'data/answers_master.json' },
  ];
  
  for (const { local, remote } of masterFiles) {
    if (fs.existsSync(local)) {
      const ok = await uploadFile(local, remote);
      console.log(`   ${ok ? '✅' : '❌'} ${remote}`);
    } else {
      console.log(`   ⚠️ 없음: ${local}`);
    }
  }

  // ─── 최종 리포트 ───
  console.log('\n====================================');
  console.log(' 업로드 완료 리포트');
  console.log('====================================');
  console.log(`수학2: ${math2Uploaded} 성공 / ${math2Failed} 실패`);
  console.log(`미적분: ${calcUploaded} 성공 / ${calcFailed} 실패`);
  console.log(`마스터 JSON: 3 파일 처리`);
  console.log(`총합: ${math2Uploaded + calcUploaded} 힌트 파일 업로드`);
}

main().catch(console.error);
