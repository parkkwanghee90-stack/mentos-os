// Audits premium-lecture audio coverage on Supabase using the slug SSOT.
// For each lecture: read voiced-step count from its source JSON, check whether each
// audio/premium_lectures/{slug}/step_N.mp3 exists. Reports COMPLETE/GAP/NO_SOURCE,
// plus orphan files and junk folders at the prefix root.
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const LECTURES = require('../src/lib/premiumLectures.json');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PUBLIC_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/mentos-assets`;
const BUCKET = 'mentos-assets';

async function listFolder(prefix) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix, limit: 1000, sortBy: { column: 'name', order: 'asc' } }),
  });
  if (!res.ok) throw new Error(`list ${prefix} -> ${res.status}`);
  return res.json();
}

async function fetchSourceJSON(sourceJson) {
  const res = await fetch(`${PUBLIC_PREFIX}/premium_lectures/${sourceJson}`);
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

async function audioExists(slug, step) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/info/public/${BUCKET}/audio/premium_lectures/${slug}/step_${step}.mp3`);
  if (!res.ok) return false;
  const info = await res.json().catch(() => null);
  return !!(info && info.size > 10240);
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) { console.error('Missing SUPABASE env'); process.exit(1); }

  const root = await listFolder('audio/premium_lectures/');
  const orphanFiles = root.filter((x) => x.name && x.name.endsWith('.mp3')).map((x) => x.name);
  const validSlugs = new Set(Object.values(LECTURES).map((l) => l.slug));
  const folders = root.filter((x) => x.name && !x.name.endsWith('.mp3')).map((x) => x.name);
  const junkFolders = folders.filter((f) => !validSlugs.has(f));

  const report = [];
  for (const [lectureId, { slug, sourceJson }] of Object.entries(LECTURES)) {
    const json = await fetchSourceJSON(sourceJson);
    if (!json || !Array.isArray(json.steps)) {
      report.push({ lectureId, slug, sourceJson, status: 'NO_SOURCE', missing: [], total: 0 });
      continue;
    }
    const voiced = json.steps.filter((s) => s.narration);
    const missing = [];
    for (const step of voiced) {
      if (!(await audioExists(slug, step.step))) missing.push(step.step);
    }
    report.push({
      lectureId, slug, sourceJson,
      status: missing.length === 0 ? 'COMPLETE' : 'GAP',
      missing, total: voiced.length,
    });
  }

  console.log('\n=== Premium TTS Audit (slug SSOT) ===');
  console.log('Orphan root .mp3 files:', orphanFiles.length, orphanFiles.slice(0, 20));
  console.log('Junk/non-SSOT folders:', junkFolders);
  let complete = 0, gap = 0, noSrc = 0;
  for (const r of report) {
    if (r.status === 'COMPLETE') complete++;
    else if (r.status === 'GAP') gap++;
    else noSrc++;
    console.log(`[${r.status}] ${r.lectureId} -> ${r.slug}  ${r.total - r.missing.length}/${r.total}`,
      r.missing.length ? `missing(${r.missing.join(',')})` : '');
  }
  console.log(`\nTotals: COMPLETE ${complete}, GAP ${gap}, NO_SOURCE ${noSrc} (of ${report.length})`);
  const out = path.join('scripts', 'premium_tts_audit_report.json');
  fs.writeFileSync(out, JSON.stringify({ orphanFiles, junkFolders, report }, null, 2));
  console.log(`Saved ${out}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
