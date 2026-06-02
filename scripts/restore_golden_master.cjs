// INSTANT SWAP: restore the sealed Golden Master to public/data AND Supabase Storage.
// Use when the deployed math data goes wrong and must be reverted immediately.
//   node scripts/restore_golden_master.cjs           (restore local + Supabase)
//   node scripts/restore_golden_master.cjs --local   (local only, no upload)
// After running, redeploy:  npm run build && node scripts/build_vercel_prebuilt.cjs && vercel --prebuilt --prod --yes
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const DIR = 'GOLDEN_MASTER_2026_06_02';
const LOCAL_ONLY = process.argv.includes('--local');
const manifest = JSON.parse(fs.readFileSync(path.join(DIR, 'manifest.json'), 'utf8'));
const md5 = b => crypto.createHash('md5').update(b).digest('hex');

// 1. Integrity check the sealed master
console.log('--- Verifying Golden Master integrity ---');
for (const [f, meta] of Object.entries(manifest.files)) {
  const buf = fs.readFileSync(path.join(DIR, f));
  const h = md5(buf);
  if (h !== meta.md5) { console.error(`✗ TAMPERED: ${f} md5 ${h} != ${meta.md5}`); process.exit(1); }
  console.log(`✓ ${f} (${meta.keys} keys, ${meta.bytes}B, md5 ${h})`);
}

// 2. Copy to public/data
console.log('--- Restoring to public/data ---');
for (const f of Object.keys(manifest.files)) {
  fs.copyFileSync(path.join(DIR, f), path.join('public/data', f));
  console.log(`  copied ${f} -> public/data/`);
}

// 3. Upload to Supabase
if (!LOCAL_ONLY) {
  console.log('--- Uploading to Supabase Storage ---');
  execSync(`node scripts/supabase_upload_data.cjs ${DIR}`, { stdio: 'inherit' });
} else {
  console.log('(--local: skipped Supabase upload)');
}
console.log('\n✅ Golden Master restored. Next: redeploy with');
console.log('   npm run build && node scripts/build_vercel_prebuilt.cjs && vercel --prebuilt --prod --yes');
