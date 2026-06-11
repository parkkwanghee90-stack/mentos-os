#!/usr/bin/env node
/**
 * 수학상 통합숙제(고차방정식 이후) AVS 전수 감사
 *  - 대상: hw_09 고차방정식 ~ hw_13 행렬 (139문제 — 단원 꼬리 유령 슬롯 10개 제거 반영)
 *  - 점검: 로컬 힌트 JSON 존재 / 템플릿 여부(문제별 풀이 미생성) / Supabase 해설·문제 이미지 가용성
 *  - 출력: 단원별 표 + SU_SANG_HW_GAPS=N (N=비전 생성이 필요한 문제 수)
 *
 * 사용: node scripts/audit_homework_avs_su_sang.cjs [--json /tmp/out.json]
 */
const fs = require('fs');
const path = require('path');
const { getSafePath } = require('../src/config/pathMapping');

const BASE = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co/storage/v1/object/public/mentos-assets';

const UNITS = [
  { hintKey: '수학상_09고차방정식_통합숙제', folderName: '09고차방정식', problemCount: 20 }, // 021·022는 유령 슬롯(원본 20문제)
  { hintKey: '수학상_10일차부등식_통합숙제', folderName: '10일차부등식', problemCount: 13 },
  { hintKey: '수학상_11이차부등식_통합숙제', folderName: '11이차부등식', problemCount: 30 },
  { hintKey: '수학상_12경우의수_통합숙제', folderName: '12경우의수', problemCount: 36 },
  { hintKey: '수학상_13행렬_통합숙제', folderName: '13행렬', problemCount: 40 },
];

const TEMPLATE_S = '아래 선생님의 정밀 판서';
const pad = n => String(n).padStart(3, '0');

// 원천 자산(크롭) 오류로 생성 제외된 문제 — scripts/homework_avs_asset_issues.json
function loadAssetIssues() {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(__dirname, 'homework_avs_asset_issues.json'), 'utf8'));
    const set = new Set();
    for (const it of j.issues || []) if (!it.resolved) set.add(`${it.unit}/${it.pid}`);
    return set;
  } catch {
    return new Set();
  }
}
const ASSET_ISSUES = loadAssetIssues();

async function headOk(url) {
  try {
    const r = await fetch(url, { method: 'HEAD' });
    return r.ok;
  } catch {
    return false;
  }
}

async function auditUnit(unit) {
  const localDir = path.join(__dirname, '..', 'src', 'data', 'homework_avs', unit.hintKey);
  const safeDir = getSafePath(`math_crops/homework/math_sang/${getSafePath(unit.folderName)}`);
  const rows = [];

  for (let n = 1; n <= unit.problemCount; n++) {
    const pid = pad(n);
    const localPath = path.join(localDir, `${pid}.json`);
    let localState = 'missing';
    if (fs.existsSync(localPath)) {
      try {
        const d = JSON.parse(fs.readFileSync(localPath, 'utf8'));
        if (d.vision_generated) localState = 'vision';
        else if (typeof d.S === 'string' && d.S.includes(TEMPLATE_S)) localState = 'template';
        else localState = 'other';
      } catch {
        localState = 'broken';
      }
    }
    const [solImg, probImg] = await Promise.all([
      headOk(`${BASE}/${safeDir}/${pid}a.webp`),
      headOk(`${BASE}/${safeDir}/${pid}.webp`),
    ]);
    rows.push({ pid, localState, solImg, probImg });
  }
  return rows;
}

(async () => {
  let totalGaps = 0;
  let totalNoImage = 0;
  const report = {};

  let totalAssetIssues = 0;
  for (const unit of UNITS) {
    const rows = await auditUnit(unit);
    const excluded = rows.filter(r => ASSET_ISSUES.has(`${unit.hintKey}/${r.pid}`));
    const active = rows.filter(r => !ASSET_ISSUES.has(`${unit.hintKey}/${r.pid}`));
    const needGen = active.filter(r => r.localState !== 'vision' && r.solImg);
    const noImage = active.filter(r => !r.solImg);
    const broken = active.filter(r => r.localState === 'broken' || r.localState === 'missing');
    totalGaps += needGen.length;
    totalNoImage += noImage.length;
    totalAssetIssues += excluded.length;
    report[unit.hintKey] = { rows, needGen: needGen.map(r => r.pid), noImage: noImage.map(r => r.pid), assetIssues: excluded.map(r => r.pid) };

    console.log(`\n[${unit.hintKey}] ${unit.problemCount}문제`);
    console.log(`  vision 완료: ${active.filter(r => r.localState === 'vision').length}`);
    console.log(`  템플릿(생성 필요): ${active.filter(r => r.localState === 'template').length}`);
    if (broken.length) console.log(`  로컬 JSON 누락/파손: ${broken.map(r => r.pid).join(',')}`);
    if (noImage.length) console.log(`  해설 이미지 없음: ${noImage.map(r => r.pid).join(',')}`);
    if (excluded.length) console.log(`  자산 오류 제외: ${excluded.map(r => r.pid).join(',')}`);
  }
  if (totalAssetIssues > 0) console.log(`\nSU_SANG_HW_ASSET_ISSUES=${totalAssetIssues}`);

  const jsonArg = process.argv.indexOf('--json');
  if (jsonArg !== -1 && process.argv[jsonArg + 1]) {
    fs.writeFileSync(process.argv[jsonArg + 1], JSON.stringify(report, null, 2));
  }

  console.log(`\nSU_SANG_HW_GAPS=${totalGaps}`);
  if (totalNoImage > 0) console.log(`SU_SANG_HW_NO_IMAGE=${totalNoImage}`);
  if (totalGaps === 0) console.log('SU_SANG_HW_COMPLETE');
})();
