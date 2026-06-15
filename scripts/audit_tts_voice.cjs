'use strict';

// TTS 음색 감사 — manifest(=3.1 SSOT 기록) 대비 math-tts 버킷 실제 클립을 비교해
// 재생성이 필요한 suspect(3.1로 확정되지 않은) 클립을 식별한다.
//
// 모드:
//   --diagnose : manifest/버킷/로컬 키 공간을 덤프(키 형식·매핑 규칙 확정용). 분류/worklist 미생성.
//   (기본)     : classifyClips로 confirmed/suspect 분류 → scripts/tts_regen_worklist.json 생성.
//
// provenance 규칙(스펙 §4): 2.5 vs 3.1은 바이트로 구분 불가 → manifest 존재 여부가 유일한 3.1 근거.

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TTS_BUCKET = 'math-tts';
const MANIFEST_PATH = path.join('scripts', 'tts_manifest.json');
const LOCAL_DIR = path.join('public', 'audio', 'math_hints');
const DIAGNOSE_OUT = path.join('scripts', 'tts_audit_diagnose.json');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('환경변수 누락: VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (.env)');
  process.exit(1);
}

async function listPrefix(bucket, prefix) {
  const out = [];
  let offset = 0;
  for (;;) {
    let res;
    for (let attempt = 1; ; attempt++) {
      try {
        res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${bucket}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ prefix, limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } }),
        });
        break;
      } catch (err) {
        if (attempt >= 3) throw err;
        await new Promise(r => setTimeout(r, 5000));
      }
    }
    if (!res.ok) throw new Error(`list ${bucket}/${prefix}: ${res.status}`);
    const files = await res.json().catch(() => []);
    out.push(...files);
    if (files.length < 1000) break;
    offset += 1000;
  }
  return out;
}

// math-tts 버킷의 모든 mp3 객체 키(`{folder}/{NNN}.mp3`)를 수집한다.
async function collectBucketMp3() {
  const root = await listPrefix(TTS_BUCKET, '');
  const folders = root.filter(it => it.id === null).map(it => it.name);
  const rootFiles = root.filter(it => it.id !== null && /\.mp3$/.test(it.name || '')).map(it => it.name);
  const bucketKeys = [];
  for (const f of folders) {
    const files = await listPrefix(TTS_BUCKET, `${f}/`);
    for (const it of files) {
      if (it.id !== null && /\.mp3$/.test(it.name || '')) bucketKeys.push(`${f}/${it.name}`);
    }
  }
  return { folders, rootFiles, bucketKeys };
}

async function diagnose() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const manifestKeys = Object.keys(manifest);
  const { folders, rootFiles, bucketKeys } = await collectBucketMp3();
  const localFiles = fs.existsSync(LOCAL_DIR) ? fs.readdirSync(LOCAL_DIR).filter(f => f.endsWith('.mp3')) : [];

  const manifestSet = new Set(manifestKeys);
  const bucketSet = new Set(bucketKeys);
  const bucketSuspect = bucketKeys.filter(k => !manifestSet.has(k));
  const manifestOnly = manifestKeys.filter(k => !bucketSet.has(k));

  console.log('=== manifest 키 ===', manifestKeys.length, '| sample', manifestKeys.slice(0, 3));
  console.log('=== math-tts 폴더 ===', folders.length, '| sample', folders.slice(0, 12));
  console.log('=== math-tts 루트 직속 mp3 ===', rootFiles.length, rootFiles.slice(0, 10));
  console.log('=== math-tts mp3 객체 총 ===', bucketKeys.length, '| sample', bucketKeys.slice(0, 5));
  console.log('=== 로컬 public mp3 ===', localFiles.length, '| sample', localFiles.slice(0, 5));
  console.log('=== bucket ∖ manifest (suspect 후보) ===', bucketSuspect.length, '| sample', bucketSuspect.slice(0, 30));
  console.log('=== manifest ∖ bucket (이상치) ===', manifestOnly.length, '| sample', manifestOnly.slice(0, 10));

  fs.writeFileSync(DIAGNOSE_OUT, JSON.stringify({
    counts: {
      manifest: manifestKeys.length, folders: folders.length, bucketMp3: bucketKeys.length,
      local: localFiles.length, bucketSuspect: bucketSuspect.length, manifestOnly: manifestOnly.length,
    },
    folders, bucketKeys, bucketSuspect, manifestOnly, localSample: localFiles.slice(0, 80),
  }, null, 2));
  console.log('\n→', DIAGNOSE_OUT, '작성');
}

(async () => {
  const mode = process.argv.slice(2);
  if (mode.includes('--diagnose')) {
    await diagnose();
    return;
  }
  console.log('분류 모드는 Task 9에서 구현됩니다. 지금은 --diagnose 만 지원합니다.');
})().catch(e => { console.error('ERROR', e.message); process.exit(1); });
