/**
 * upload_to_supabase.cjs
 * upload_manifest.json 기준으로만 Supabase Storage에 업로드
 * 
 * 사용법: node scripts/upload_to_supabase.cjs
 * 
 * 환경변수:
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY (서비스 롤 키 필요)
 *   또는 .env에서 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 사용
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
        // Remove surrounding quotes
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
const SUPABASE_URL = process.env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || env.VITE_SUPABASE_ANON_KEY;
const BUCKET = 'mentos-assets';
const ASSETS_ROOT = path.join(__dirname, '..', 'assets_backup');
const MANIFEST_PATH = path.join(__dirname, '..', 'upload_manifest.json');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ SUPABASE_URL 또는 SUPABASE_KEY가 설정되지 않았습니다.');
  process.exit(1);
}

// MIME type 추정
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.json': 'application/json',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
  };
  return map[ext] || 'application/octet-stream';
}

// 단일 파일 업로드 (upsert)
async function uploadFile(relativePath) {
  const absPath = path.join(ASSETS_ROOT, relativePath);
  if (!fs.existsSync(absPath)) {
    return { path: relativePath, status: 'missing', error: 'File not found locally' };
  }

  const fileBuffer = fs.readFileSync(absPath);
  const contentType = getMimeType(relativePath);
  
  // Supabase Storage REST API: POST to upload, with x-upsert header
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(relativePath).replace(/%2F/g, '/')}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Content-Type': contentType,
        'x-upsert': 'true',
        'Cache-Control': 'public, max-age=31536000',
      },
      body: fileBuffer,
    });
    
    if (response.ok) {
      return { path: relativePath, status: 'ok' };
    } else {
      const errText = await response.text();
      return { path: relativePath, status: 'error', error: `${response.status}: ${errText.slice(0, 200)}` };
    }
  } catch (e) {
    return { path: relativePath, status: 'error', error: e.message };
  }
}

// 메인 업로드 루프 (동시 요청 제한)
async function main() {
  console.log('========================================');
  console.log('  Supabase Storage Upload (Manifest)');
  console.log('========================================');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Bucket: ${BUCKET}`);
  console.log(`Assets root: ${ASSETS_ROOT}\n`);

  // 먼저 버킷 생성 시도
  console.log('🪣 Creating bucket if not exists...');
  try {
    const createResp = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: BUCKET,
        name: BUCKET,
        public: true,
        file_size_limit: 52428800, // 50MB
        allowed_mime_types: ['image/webp', 'image/png', 'image/jpeg', 'image/svg+xml', 'application/json', 'audio/mpeg']
      })
    });
    const createBody = await createResp.text();
    if (createResp.ok) {
      console.log('  ✅ Bucket created successfully');
    } else if (createBody.includes('already exists')) {
      console.log('  ℹ️  Bucket already exists');
    } else {
      console.log(`  ⚠️  Bucket creation response: ${createResp.status} - ${createBody.slice(0, 200)}`);
    }
  } catch (e) {
    console.log(`  ⚠️  Bucket creation error: ${e.message}`);
  }

  // manifest 로드
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ upload_manifest.json이 없습니다. extract_asset_paths.cjs를 먼저 실행하세요.');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  console.log(`\n📋 Manifest: ${manifest.length} files to upload\n`);

  const CONCURRENCY = 5;
  const results = { ok: 0, error: 0, missing: 0 };
  const failedFiles = [];
  let processed = 0;

  // 배치 처리
  for (let i = 0; i < manifest.length; i += CONCURRENCY) {
    const batch = manifest.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(entry => uploadFile(entry.relativePath))
    );
    
    for (const r of batchResults) {
      processed++;
      if (r.status === 'ok') {
        results.ok++;
      } else if (r.status === 'missing') {
        results.missing++;
        failedFiles.push(r);
      } else {
        results.error++;
        failedFiles.push(r);
      }
      
      // 진행 상황 표시 (100건마다)
      if (processed % 100 === 0 || processed === manifest.length) {
        const pct = ((processed / manifest.length) * 100).toFixed(1);
        console.log(`  [${pct}%] ${processed}/${manifest.length} — ✅ ${results.ok} | ❌ ${results.error} | ⚠️ ${results.missing}`);
      }
    }
  }

  // 최종 보고
  console.log('\n========================================');
  console.log('         UPLOAD COMPLETE REPORT');
  console.log('========================================');
  console.log(`전체 manifest 파일 수: ${manifest.length}`);
  console.log(`업로드 성공: ${results.ok}`);
  console.log(`업로드 실패: ${results.error}`);
  console.log(`로컬 누락: ${results.missing}`);
  console.log('========================================');

  // 실패 파일 기록
  if (failedFiles.length > 0) {
    const failedReport = failedFiles.map(f => `${f.status.toUpperCase()}: ${f.path} — ${f.error}`).join('\n');
    fs.writeFileSync(path.join(__dirname, '..', 'upload_failures.txt'), failedReport, 'utf-8');
    console.log(`\n⚠️ upload_failures.txt 저장 완료 (${failedFiles.length} entries)`);
    console.log('\n[실패 파일 (처음 10개)]');
    failedFiles.slice(0, 10).forEach(f => console.log(`  ${f.status}: ${f.path} — ${f.error}`));
  } else {
    console.log('\n✅ 전체 업로드 성공! 실패 없음.');
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
