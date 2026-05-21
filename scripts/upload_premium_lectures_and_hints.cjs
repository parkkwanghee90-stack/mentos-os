/**
 * scripts/upload_premium_lectures_and_hints.cjs
 * 
 * 프리미엄 AI 강의 JSON(영어명 변환) 및 AVS 힌트 JSON(한글 구조 그대로)을
 * Supabase Storage의 `mentos-assets` 버킷에 일괄 업로드합니다.
 * 
 * 사용법: node scripts/upload_premium_lectures_and_hints.cjs
 */
const fs = require('fs');
const path = require('path');

// .env 파싱
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  const vars = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        vars[key] = val;
      }
    }
  }
  return vars;
}

const env = loadEnv();
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || 'https://trvqgqvwhqvlgqzlsxbu.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'mentos-assets';

if (!SERVICE_KEY) {
  console.error('❌ 에러: SUPABASE_SERVICE_ROLE_KEY가 .env 파일에 없습니다. 업로드 권한을 얻을 수 없습니다.');
  process.exit(1);
}

// pathMapping에서 getSafePath 가져오기
let getSafePath;
try {
  const pathMapping = require('../src/config/pathMapping.js');
  getSafePath = pathMapping.getSafePath;
  console.log('✅ pathMapping.js에서 getSafePath 로드 성공');
} catch (e) {
  console.warn('⚠️ pathMapping.js 로드 실패, 자체 헬퍼를 사용합니다:', e.message);
  // 폴백 매핑 헬퍼
  getSafePath = (relPath) => relPath;
}

// 재귀적으로 디렉토리 내의 모든 파일 목록 탐색
function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const absPath = path.join(dirPath, file);
    if (fs.statSync(absPath).isDirectory()) {
      arrayOfFiles = getAllFiles(absPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(absPath);
    }
  });

  return arrayOfFiles;
}

// Supabase PUT API를 사용해 단일 파일 업로드
async function uploadFile(localAbsPath, remoteRelativePath) {
  const fileBuffer = fs.readFileSync(localAbsPath);
  
  // URL 인코딩: 한글 디렉토리 및 파일명이 깨지지 않도록 각 세그먼트별 encodeURIComponent 처리
  const encodedPath = remoteRelativePath
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
    
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodedPath}`;

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'x-upsert': 'true',
      },
      body: fileBuffer,
    });

    if (res.ok) {
      return { status: 'success', path: remoteRelativePath };
    } else {
      const errText = await res.text();
      return { status: 'error', path: remoteRelativePath, error: `${res.status} - ${errText.substring(0, 150)}` };
    }
  } catch (err) {
    return { status: 'error', path: remoteRelativePath, error: err.message };
  }
}

async function main() {
  console.log('==================================================');
  console.log('       Supabase Storage Premium Lectures & AVS Hints Upload');
  console.log('==================================================');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Bucket: ${BUCKET}`);
  
  const publicDir = path.join(__dirname, '..', 'public');
  const premiumLecturesDir = path.join(publicDir, 'premium_lectures');
  const mathHintsDir = path.join(publicDir, 'math_hints');
  
  console.log(`\n📂 Scan premium lectures in: ${premiumLecturesDir}`);
  const premiumFiles = getAllFiles(premiumLecturesDir).filter(f => f.endsWith('.json'));
  console.log(`👉 Found ${premiumFiles.length} premium lectures.`);
  
  console.log(`📂 Scan AVS math hints in: ${mathHintsDir}`);
  const hintFiles = getAllFiles(mathHintsDir).filter(f => f.endsWith('.json'));
  console.log(`👉 Found ${hintFiles.length} math hints.`);

  // 1. 프리미엄 강의 업로드 리스트 만들기 (resolveAsset 매핑 반영)
  console.log('\n📝 Preparing Premium Lectures upload list...');
  const premiumUploadTasks = premiumFiles.map(localPath => {
    const baseName = path.basename(localPath); // 예: 고차방정식.json
    
    // getSafePath는 'premium_lectures/고차방정식.json' 형태로 인자를 받아 'premium_lectures/higher_order_eq.json' 형태로 리턴합니다.
    const relToPublic = `premium_lectures/${baseName}`;
    const safeRelPath = getSafePath(relToPublic);
    
    return {
      localPath,
      remotePath: safeRelPath
    };
  });

  // 2. AVS 힌트 업로드 리스트 만들기 (영어명 변환 적용)
  console.log('📝 Preparing AVS Math Hints upload list...');
  const hintUploadTasks = hintFiles.map(localPath => {
    // public/math_hints/ 뒤의 상대 경로를 가져와 getSafePath를 통해 매핑합니다.
    const relToMathHints = path.relative(mathHintsDir, localPath); // 예: 도형의이동2단계/001.json
    const relToPublic = `math_hints/${relToMathHints.replace(/\\/g, '/')}`;
    const safeRelPath = getSafePath(relToPublic);
    
    return {
      localPath,
      remotePath: safeRelPath
    };
  });

  const allTasks = [...premiumUploadTasks, ...hintUploadTasks];
  console.log(`\n🚀 Total Tasks to Upload: ${allTasks.length} JSON files.`);
  
  const CONCURRENCY = 10;
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < allTasks.length; i += CONCURRENCY) {
    const batch = allTasks.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(t => uploadFile(t.localPath, t.remotePath))
    );
    
    results.forEach(r => {
      if (r.status === 'success') {
        successCount++;
        // 50개 단위로 진행상황 출력
        if (successCount % 50 === 0) {
          console.log(`  [Progress] Uploaded ${successCount}/${allTasks.length} files successfully...`);
        }
      } else {
        failCount++;
        console.error(`  ❌ Failed to upload ${r.path} -> ${r.error}`);
      }
    });
  }
  
  console.log('\n==================================================');
  console.log('                   UPLOAD REPORT                  ');
  console.log('==================================================');
  console.log(`Total attempted: ${allTasks.length}`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Fail: ${failCount}`);
  console.log('==================================================');
  
  if (failCount === 0) {
    console.log('\n🎉 All assets uploaded successfully to Supabase Storage!');
  } else {
    console.warn(`\n⚠️ Finished with ${failCount} failures. Please check the log above.`);
  }
}

main().catch(err => {
  console.error('Fatal error during upload:', err);
  process.exit(1);
});
