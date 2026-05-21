/**
 * scripts/upload_csat_mock_and_grading.cjs
 * 
 * 고3 모의고사 6회분 문제 이미지 자산, AVS 힌트 JSON 자산, TTS 오디오 자산
 * 및 정답시스템 마스터 JSON 3종을 Supabase Storage의 `mentos-assets` 버킷에 업로드합니다.
 * 
 * 사용법: node scripts/upload_csat_mock_and_grading.cjs
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
  
  // URL 인코딩: 각 세그먼트별 encodeURIComponent 처리
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
        'Content-Type': remoteRelativePath.endsWith('.json') ? 'application/json' : 
                       remoteRelativePath.endsWith('.mp3') ? 'audio/mpeg' : 
                       remoteRelativePath.endsWith('.webp') ? 'image/webp' : 'application/octet-stream',
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
  console.log('       Supabase CSAT Mock & Grading System Upload  ');
  console.log('==================================================');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Bucket: ${BUCKET}`);
  
  const publicDir = path.join(__dirname, '..', 'public');
  
  const uploadTasks = [];

  // 1. 정답시스템 마스터 JSON 파일들 수집
  const dataDir = path.join(publicDir, 'data');
  const masterFiles = ['math_problem_texts.json', 'answers_master.json', 'avs_answers.json'];
  masterFiles.forEach(file => {
    const absPath = path.join(dataDir, file);
    if (fs.existsSync(absPath)) {
      uploadTasks.push({
        localPath: absPath,
        remotePath: `data/${file}`
      });
      console.log(`➕ Added Master JSON: data/${file}`);
    } else {
      console.warn(`⚠️ Warning: Master JSON not found at ${absPath}`);
    }
  });

  // 2. 고3 모의고사 문제 이미지 자산 수집 (고3수능및모의고사, 확통수능)
  const mathCropsDir = path.join(publicDir, 'math_crops');
  const imageFolders = ['고3수능및모의고사', '확통수능'];
  
  imageFolders.forEach(folder => {
    const folderPath = path.join(mathCropsDir, folder);
    if (fs.existsSync(folderPath)) {
      const files = getAllFiles(folderPath).filter(f => f.endsWith('.webp') || f.endsWith('.png'));
      console.log(`📂 Scanned crop folder [${folder}]: Found ${files.length} images.`);
      
      files.forEach(localPath => {
        const relToPublic = path.relative(publicDir, localPath).replace(/\\/g, '/');
        const safePath = getSafePath(relToPublic);
        uploadTasks.push({ localPath, remotePath: safePath });
      });
    }
  });

  // 3. 모의고사 및 수능 힌트 JSON 자산 수집
  const mathHintsDir = path.join(publicDir, 'math_hints');
  if (fs.existsSync(mathHintsDir)) {
    const allHints = getAllFiles(mathHintsDir).filter(f => f.endsWith('.json'));
    console.log(`📂 Scanned hint folder: Found ${allHints.length} total json files.`);
    
    // CSAT_ 관련 또는 모의고사 관련 폴더만 필터링
    const targetHints = allHints.filter(localPath => {
      const relToHints = path.relative(mathHintsDir, localPath).replace(/\\/g, '/');
      const isTarget = relToHints.startsWith('CSAT_') || 
                       relToHints.includes('모의고사') || 
                       /^\d{4,}/.test(relToHints) || // 숫자로 시작하는 폴더 (예: 202605...)
                       relToHints.startsWith('확통수능');
      return isTarget;
    });
    
    console.log(`👉 Filtered CSAT/Mock hint files: ${targetHints.length} files.`);
    
    targetHints.forEach(localPath => {
      const relToPublic = path.relative(publicDir, localPath).replace(/\\/g, '/');
      const safePath = getSafePath(relToPublic);
      uploadTasks.push({ localPath, remotePath: safePath });
    });
  }

  // 4. TTS 오디오 자산 수집 (suneung_tts)
  const audioDir = path.join(publicDir, 'audio', 'suneung_tts');
  if (fs.existsSync(audioDir)) {
    const audioFiles = getAllFiles(audioDir).filter(f => f.endsWith('.mp3'));
    console.log(`📂 Scanned suneung_tts folder: Found ${audioFiles.length} audio files.`);
    
    audioFiles.forEach(localPath => {
      const relToPublic = path.relative(publicDir, localPath).replace(/\\/g, '/');
      const safePath = getSafePath(relToPublic);
      uploadTasks.push({ localPath, remotePath: safePath });
    });
  }

  console.log(`\n🚀 Total Tasks to Upload: ${uploadTasks.length} assets.`);
  
  if (uploadTasks.length === 0) {
    console.log('ℹ️ No assets to upload.');
    return;
  }

  const CONCURRENCY = 15;
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < uploadTasks.length; i += CONCURRENCY) {
    const batch = uploadTasks.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(t => uploadFile(t.localPath, t.remotePath))
    );
    
    results.forEach(r => {
      if (r.status === 'success') {
        successCount++;
        if (successCount % 50 === 0) {
          console.log(`  [Progress] Uploaded ${successCount}/${uploadTasks.length} assets successfully...`);
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
  console.log(`Total attempted: ${uploadTasks.length}`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Fail: ${failCount}`);
  console.log('==================================================');
  
  if (failCount === 0) {
    console.log('\n🎉 All CSAT Mock & Grading assets uploaded successfully to Supabase Storage!');
  } else {
    console.warn(`\n⚠️ Finished with ${failCount} failures. Please check the log above.`);
  }
}

main().catch(err => {
  console.error('Fatal error during upload:', err);
  process.exit(1);
});
