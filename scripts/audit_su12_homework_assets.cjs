#!/usr/bin/env node
/**
 * 수1·수2 통합숙제 원천 자산 전수 감사 (비전 생성 사전 점검)
 *  - 대상: 수학1 10단원 + 수학2 7단원 (총 767 스켈레톤)
 *  - 점검: 스켈레톤 pid ↔ Supabase 문제/해설 이미지 존재, 버킷 잉여 슬롯(스켈레톤 범위 밖),
 *          eTag 완전중복(수학상 유령 슬롯 패턴 = 꼬리 슬롯이 앞 이미지의 복제), pid 구멍
 *  - quota 무소비 (storage list API만 사용)
 *
 * 사용: node scripts/audit_su12_homework_assets.cjs [--json scripts/su12_hw_audit.json]
 */
const fs = require('fs');
const path = require('path');
try { require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); } catch {}
const { getSafePath } = require('../src/config/pathMapping');

const SUPABASE_URL = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co';
const BUCKET = 'mentos-assets';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_KEY) { console.error('SUPABASE_SERVICE_ROLE_KEY 미설정'); process.exit(1); }

const args = process.argv.slice(2);
const jsonIdx = args.indexOf('--json');
const JSON_OUT = jsonIdx !== -1 ? args[jsonIdx + 1] : path.join(__dirname, 'su12_hw_audit.json');

const HW_ROOT = path.join(__dirname, '..', 'src', 'data', 'homework_avs');

// 단원 폴더명은 스켈레톤 S_objects src(/math_crops/숙제/{과목}/{폴더}/{pid}a.webp)에서 도출
function deriveUnit(hintKey) {
  const dir = path.join(HW_ROOT, hintKey);
  const pids = fs.readdirSync(dir).filter(f => /^\d{3}\.json$/.test(f)).map(f => f.slice(0, 3)).sort();
  const sample = JSON.parse(fs.readFileSync(path.join(dir, `${pids[0]}.json`), 'utf8'));
  const src = sample.S_objects?.[0]?.src || '';
  const m = src.match(/^\/math_crops\/숙제\/(수학[12])\/([^/]+)\//);
  if (!m) throw new Error(`${hintKey}: S_objects src에서 폴더 도출 실패 (${src})`);
  return { subject: m[1], folderName: m[2], pids };
}

async function listAll(prefix) {
  const out = [];
  for (let offset = 0; ; offset += 1000) {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix, limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } }),
    });
    if (!res.ok) throw new Error(`list ${res.status}: ${prefix}`);
    const items = await res.json();
    out.push(...items);
    if (items.length < 1000) return out;
  }
}

(async () => {
  const hintKeys = fs.readdirSync(HW_ROOT).filter(d => /^수학[12]_.+_통합숙제$/.test(d)).sort();
  const report = { generatedAt: new Date().toISOString(), units: {} };
  let flags = 0;

  for (const hintKey of hintKeys) {
    const { subject, folderName, pids } = deriveUnit(hintKey);
    const safeSubject = getSafePath(subject); // math1 | math2
    const safeFolder = getSafePath(folderName);
    const prefix = `math_crops/homework/${safeSubject}/${safeFolder}`;
    const files = await listAll(prefix);
    const byName = new Map(files.map(f => [f.name, f.metadata?.eTag || null]));

    // 1) 스켈레톤 pid별 이미지 존재
    const missingProb = pids.filter(p => !byName.has(`${p}.webp`));
    const missingSol = pids.filter(p => !byName.has(`${p}a.webp`));

    // 2) 버킷 잉여 슬롯 (스켈레톤 범위 밖 NNN[a].webp)
    const pidSet = new Set(pids);
    const bucketPids = [...new Set([...byName.keys()].map(n => (n.match(/^(\d{3})a?\.webp$/) || [])[1]).filter(Boolean))].sort();
    const extraSlots = bucketPids.filter(p => !pidSet.has(p));

    // 3) eTag 완전중복 그룹 (유령 슬롯 패턴)
    const byTag = new Map();
    for (const [name, tag] of byName) {
      if (!tag || !name.endsWith('.webp')) continue;
      if (!byTag.has(tag)) byTag.set(tag, []);
      byTag.get(tag).push(name);
    }
    const dupGroups = [...byTag.values()].filter(g => g.length > 1).map(g => g.sort());

    // 4) pid 시퀀스 구멍
    const nums = pids.map(Number);
    const holes = [];
    for (let n = nums[0]; n <= nums[nums.length - 1]; n++) {
      if (!pidSet.has(String(n).padStart(3, '0'))) holes.push(String(n).padStart(3, '0'));
    }

    // 5) html 원본 존재 여부 (정답 시퀀스 교차검증용)
    const htmls = [...byName.keys()].filter(n => n.endsWith('.html'));

    const unitFlags = missingProb.length + missingSol.length + extraSlots.length + dupGroups.length;
    flags += unitFlags;
    report.units[hintKey] = {
      subject, folderName, prefix, skeletonCount: pids.length,
      pidRange: `${pids[0]}~${pids[pids.length - 1]}`,
      missingProb, missingSol, extraSlots, dupGroups, holes, htmls,
    };
    const mark = unitFlags ? '🚩' : '✅';
    console.log(`${mark} ${hintKey} skel:${pids.length} (${pids[0]}~${pids[pids.length - 1]})` +
      (holes.length ? ` 구멍:${holes.join(',')}` : '') +
      (missingProb.length ? ` 문제이미지누락:${missingProb.join(',')}` : '') +
      (missingSol.length ? ` 해설이미지누락:${missingSol.join(',')}` : '') +
      (extraSlots.length ? ` 잉여슬롯:${extraSlots.join(',')}` : '') +
      (dupGroups.length ? ` eTag중복:${dupGroups.map(g => g.join('=')).join(' | ')}` : '') +
      (htmls.length ? ` html:${htmls.length}` : ''));
  }

  fs.writeFileSync(JSON_OUT, JSON.stringify(report, null, 2));
  console.log(`\n플래그 합계: ${flags} — 상세: ${JSON_OUT}`);
  console.log(`SU12_HW_AUDIT_FLAGS=${flags}`);
})();
