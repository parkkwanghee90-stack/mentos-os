#!/usr/bin/env node
// 미적분 mega-wave 결과 → 단원별로 슬라이스해 assemble_manual_hints.cjs 호출
// 사용: node scripts/assemble_mega.cjs <mega_output.json>
// 전제: 결과 배열 순서 == scripts/jobs_cal_rest.json 순서 (parallel 인덱스 정합)
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = '/Users/mac/mathmentos';
const megaPath = process.argv[2];
if (!megaPath) { console.error('usage: node assemble_mega.cjs <mega_output.json>'); process.exit(1); }

const raw = JSON.parse(fs.readFileSync(megaPath, 'utf8'));
const results = Array.isArray(raw) ? raw : (raw.result || raw);
const jobs = JSON.parse(fs.readFileSync(`${ROOT}/scripts/jobs_cal_rest.json`, 'utf8'));

if (results.length !== jobs.length) {
  console.error(`⚠️ 길이 불일치: results=${results.length} jobs=${jobs.length} — 인덱스 정합 깨짐, 중단`);
  process.exit(1);
}

// hk → 해당 단원 jobs 파일 경로 매핑 (jobs_cal*.json 중 [0].hk 일치)
const jobFiles = fs.readdirSync(`${ROOT}/scripts`).filter(f => /^jobs_cal\d+\.json$/.test(f));
const hkToFile = {};
for (const f of jobFiles) {
  const arr = JSON.parse(fs.readFileSync(`${ROOT}/scripts/${f}`, 'utf8'));
  if (arr[0]) hkToFile[arr[0].hk] = f;
}

// 단원별로 결과 그룹화 (순서 보존)
const groups = {};
for (let i = 0; i < jobs.length; i++) {
  const hk = jobs[i].hk;
  (groups[hk] = groups[hk] || []).push(results[i]);
}

// 시프트 리포트: best_off!==0 단원은 채점키 정정이 필요하므로 stored 기반 조립에서 제외(별도 처리)
let shiftRep = {};
try { shiftRep = JSON.parse(fs.readFileSync(`${ROOT}/scripts/shift_report.json`, 'utf8')); } catch {}
const onlyAligned = process.argv[3] === '--aligned-only';

const summary = [];
for (const [hk, rs] of Object.entries(groups)) {
  const jf = hkToFile[hk];
  if (!jf) { console.error(`🚩 ${hk}: jobs 파일 미발견 — 건너뜀`); continue; }
  const off = (shiftRep[hk] || {}).best;
  if (onlyAligned && off !== 0) {
    console.log(`⏭️  ${hk.split('_')[1]}: best_off=${off} (시프트/미완) — stored 조립 보류`);
    summary.push({ unit: hk.split('_')[1], deferred: `off=${off}` });
    continue;
  }
  const clean = rs.filter(Boolean);
  if (!clean.length) { console.log(`⏭️  ${hk.split('_')[1]}: 결과 0 (실패/미완) — 건너뜀`); continue; }
  const outFile = `${ROOT}/scripts/out_${jf.replace('jobs_', '').replace('.json', '')}.json`;
  fs.writeFileSync(outFile, JSON.stringify(clean));
  console.log(`\n=== ${hk.split('_')[1]} (${clean.length}/${rs.length} non-null) → ${path.basename(outFile)} ===`);
  try {
    const out = execSync(`node ${ROOT}/scripts/assemble_manual_hints.cjs ${outFile} ${ROOT}/scripts/${jf}`, { encoding: 'utf8', stdio: 'pipe' });
    const up = (out.match(/✅ 업로드·등록 (\d+)/) || [])[1] || '?';
    const fail = (out.match(/❌ 실패 (\d+)/) || [])[1] || '0';
    const flag = (out.match(/🚩 mismatch\/unclear (\d+)/) || [])[1] || '0';
    console.log(out.split('\n').filter(l => /업로드·등록|실패|mismatch/.test(l)).join('\n'));
    summary.push({ unit: hk.split('_')[1], uploaded: up, failed: fail, flagged: flag });
  } catch (e) {
    console.error(`assemble 실패 ${hk}:`, (e.stdout || e.message || '').slice(0, 300));
    summary.push({ unit: hk.split('_')[1], error: true });
  }
}

console.log('\n========== MEGA ASSEMBLE 요약 ==========');
console.table(summary);
