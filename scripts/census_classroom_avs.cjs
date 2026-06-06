#!/usr/bin/env node
/**
 * 수학 교실 AVS 전수조사: math_crops(문제) vs math_hints(AVS 해설 JSON) 단원별 커버리지.
 * 출력: docs/CLASSROOM_AVS_CENSUS.md
 */
const fs = require('fs'); const path = require('path');
try { require('dotenv').config(); } catch {}
const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY;
const URL = (process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
if (!SRK || !URL) { console.error('SUPABASE env 필요'); process.exit(1); }

async function list(prefix) {
  const res = await fetch(`${URL}/storage/v1/object/list/mentos-assets`, {
    method: 'POST',
    headers: { apikey: SRK, Authorization: `Bearer ${SRK}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix, limit: 1000, sortBy: { column: 'name', order: 'asc' } }),
  });
  if (!res.ok) return [];
  return res.json();
}
const isFolder = o => o.id === null || o.id === undefined;

(async () => {
  console.log('crops 폴더 조회...');
  const cropFolders = (await list('math_crops/')).filter(isFolder).map(o => o.name);
  console.log('hints 폴더 조회...');
  const hintFolders = (await list('math_hints/')).filter(isFolder).map(o => o.name);

  // 각 crops 폴더: 문제 이미지(NNN.webp, 'a' 해설 제외) 수
  const cropCount = {};
  for (const f of cropFolders) {
    const items = await list(`math_crops/${f}/`);
    const probs = items.filter(o => /^\d{3}\.webp$/.test(o.name)).length;
    if (probs > 0) cropCount[f] = probs;
  }
  // 각 hints 폴더: AVS JSON(NNN.json) 수
  const hintCount = {};
  for (const f of hintFolders) {
    const items = await list(`math_hints/${f}/`);
    const js = items.filter(o => /^\d{3}(_v\d)?\.json$/.test(o.name)).length;
    hintCount[f] = js;
  }

  // 매칭: 같은 폴더명 우선
  const allUnits = [...new Set([...Object.keys(cropCount), ...Object.keys(hintCount)])].sort();
  let md = `# 📊 수학 교실 AVS 전수조사\n\n`;
  md += `crops(문제) 폴더 ${Object.keys(cropCount).length} · hints(AVS) 폴더 ${Object.keys(hintCount).filter(k=>hintCount[k]>0).length}\n\n`;
  md += `| 단원 폴더 | 문제(크롭) | AVS 힌트 | 커버리지 | 상태 |\n|---|---|---|---|---|\n`;
  let totProb = 0, totHint = 0, full = 0, partial = 0, none = 0;
  for (const u of allUnits) {
    const p = cropCount[u] || 0, h = hintCount[u] || 0;
    totProb += p; totHint += Math.min(h, p || h);
    let st;
    if (p === 0 && h > 0) st = 'ℹ️ 힌트만(크롭없음)';
    else if (h === 0) { st = '❌ 없음'; none++; }
    else if (h >= p) { st = '✅ 완비'; full++; }
    else { st = '⚠️ 부분'; partial++; }
    const cov = p ? Math.round(h / p * 100) + '%' : (h ? '-' : '0%');
    md += `| ${u} | ${p} | ${h} | ${cov} | ${st} |\n`;
  }
  md += `\n**요약**: 완비 ${full} · 부분 ${partial} · 없음 ${none} 단원 / 문제 총 ${totProb} · AVS 힌트 총 ${totHint}\n`;
  md += `\n_없음/부분 단원이 AVS 해설 생성 대상_\n`;

  const out = path.join(__dirname, '..', 'docs', 'CLASSROOM_AVS_CENSUS.md');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, md);
  console.log('완료:', out, `(완비 ${full}/부분 ${partial}/없음 ${none})`);
})();
