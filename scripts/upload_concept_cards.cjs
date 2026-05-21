/**
 * Supabase Storage 업로드 스크립트
 * assets_backup/concept_cards/*.json → mentos-assets/concept_cards/
 * assets_backup/math_hints/도형의이동2단계/*.json → mentos-assets/math_hints/도형의이동2단계/
 */
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydnFncXZ3aHF2bGdxemxzeGJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY1NzA1MywiZXhwIjoyMDk0MjMzMDUzfQ.a76V1LYSItB48fXQN2in-rXfy8oD4o7KJteAMCyX9so';
const BUCKET = 'mentos-assets';

const uploadTargets = [
  { local: 'assets_backup/concept_cards/global_metadata.json',        remote: 'concept_cards/global_metadata.json' },
  { local: 'assets_backup/concept_cards/dynamic_concepts.json',       remote: 'concept_cards/dynamic_concepts.json' },
  { local: 'assets_backup/concept_cards/precomputed_animations.json', remote: 'concept_cards/precomputed_animations.json' },
  { local: 'assets_backup/concept_cards/premium_lectures.json',       remote: 'concept_cards/premium_lectures.json' },
];

// Add all hint files from 도형의이동2단계
const hintDir = path.join(__dirname, '..', 'assets_backup', 'math_hints', '도형의이동2단계');
if (fs.existsSync(hintDir)) {
  const files = fs.readdirSync(hintDir).filter(f => f.endsWith('.json'));
  for (const f of files) {
    uploadTargets.push({
      local: `assets_backup/math_hints/도형의이동2단계/${f}`,
      remote: `math_hints/도형의이동2단계/${f}`
    });
  }
}

async function uploadFile(localPath, remotePath) {
  const absPath = path.join(__dirname, '..', localPath);
  if (!fs.existsSync(absPath)) {
    console.log(`  ❌ SKIP (not found): ${localPath}`);
    return false;
  }

  const fileBuffer = fs.readFileSync(absPath);
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${remotePath}`;

  // Try upsert (PUT to overwrite if exists)
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
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${remotePath}`;
    console.log(`  ✅ UPLOADED: ${remotePath} (${fileBuffer.length} bytes)`);
    console.log(`     Public URL: ${publicUrl}`);
    return true;
  } else {
    const errText = await res.text();
    console.log(`  ❌ FAILED (${res.status}): ${remotePath} → ${errText.substring(0, 200)}`);
    return false;
  }
}

async function main() {
  console.log(`\n📦 Supabase Storage Upload`);
  console.log(`   Bucket: ${BUCKET}`);
  console.log(`   Targets: ${uploadTargets.length} files\n`);

  let success = 0, fail = 0;
  for (const t of uploadTargets) {
    console.log(`[${success + fail + 1}/${uploadTargets.length}] ${t.remote}`);
    const ok = await uploadFile(t.local, t.remote);
    if (ok) success++; else fail++;
  }

  console.log(`\n📊 Results: ${success} uploaded, ${fail} failed`);
}

main().catch(console.error);
