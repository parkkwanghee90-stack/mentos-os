// Audits premium-lecture audio coverage on Supabase against lecture JSON step counts.
// Reports: per-lecture missing steps, orphan files at the prefix root, name mismatches.
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const { getSafePath } = require('../src/config/pathMapping.js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PUBLIC_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/mentos-assets`;
const BUCKET = 'mentos-assets';

// Canonical lecture id list (mirrors LECTURE_INDEX in PremiumLectureModal.jsx).
const LECTURE_IDS = [
  '고차방정식','일차부등식','이차부등식','경우의수','행렬','점과좌표','직선의방정식','원의방정식','도형의이동',
  '지수','로그','지수함수','로그함수','삼각함수성질','삼각함수그래프','삼각함수의 활용','등차등비','시그마용법','수학적귀납법',
  '함수의극한','함수의연속','미분계수','도함수의활용','부정적분과정적분','정적분의활용',
  '미적분_수열의극한','미적분_급수','미적분_삼각함수극한','미적분_삼각함수공식','미적분_미분법','미적분_도함수활용','미적분_적분법','미적분_정적분','미적분_정적분활용',
  '순열','조합','이항정리','확률의 뜻','조건부확률','정규분포','통계적 추정',
];

async function listFolder(prefix) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix, limit: 1000, sortBy: { column: 'name', order: 'asc' } }),
  });
  if (!res.ok) throw new Error(`list ${prefix} -> ${res.status}`);
  return res.json();
}

async function fetchLectureJSON(baseId) {
  const safe = getSafePath(`premium_lectures/${baseId}.json`);
  const res = await fetch(`${PUBLIC_PREFIX}/${safe}`);
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

async function fileExists(safeAudioPath) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/info/public/${BUCKET}/${safeAudioPath}`);
  if (!res.ok) return false;
  const info = await res.json().catch(() => null);
  return !!(info && info.size > 10240);
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) { console.error('Missing SUPABASE_URL or SERVICE key'); process.exit(1); }

  // 1. Orphan files at the prefix root (uploaded without a lecture folder).
  const root = await listFolder('audio/premium_lectures/');
  const orphans = root.filter((x) => x.name && x.name.endsWith('.mp3')).map((x) => x.name);

  // 2. Per-lecture coverage.
  const report = [];
  for (const baseId of LECTURE_IDS) {
    const json = await fetchLectureJSON(baseId);
    if (!json || !Array.isArray(json.steps)) {
      report.push({ baseId, status: 'NO_JSON', missing: [], total: 0 });
      continue;
    }
    const safeFolder = getSafePath(`audio/premium_lectures/${baseId}`);
    const missing = [];
    for (const step of json.steps) {
      if (!step.narration) continue;
      const ok = await fileExists(`${safeFolder}/step_${step.step}.mp3`);
      if (!ok) missing.push(step.step);
    }
    report.push({
      baseId, safeFolder,
      status: missing.length === 0 ? 'COMPLETE' : 'GAP',
      missing, total: json.steps.filter((s) => s.narration).length,
    });
  }

  // 3. Print + save.
  console.log('\n=== Premium TTS Audit ===');
  console.log('Orphan root files:', orphans.length, orphans.slice(0, 20));
  for (const r of report) {
    console.log(`[${r.status}] ${r.baseId} -> ${r.safeFolder || '-'}  missing ${r.missing.length}/${r.total}`,
      r.missing.length ? `(${r.missing.join(',')})` : '');
  }
  const out = path.join('scripts', 'premium_tts_audit_report.json');
  fs.writeFileSync(out, JSON.stringify({ generatedFor: 'premium_lectures', orphans, report }, null, 2));
  console.log(`\nSaved ${out}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
