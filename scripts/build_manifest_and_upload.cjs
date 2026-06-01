#!/usr/bin/env node
/**
 * Mentos OS — Surgical Asset Upload to Supabase Storage
 * 
 * Phase 1: Build manifest from verified sources
 * Phase 2: Upload manifest entries to mentos-assets bucket
 * Phase 3: Report results
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ─── CONFIG ───
const ROOT = path.resolve(__dirname, '..');
const BUCKET = 'mentos-assets';

// Load config from .env / .env.local
function loadConfig() {
  const config = {
    url: 'https://trvqgqvwhqvlgqzlsxbu.supabase.co', // Fallback to confirmed project
    key: ''
  };
  const envFiles = ['.env.local', '.env'];
  for (const envFile of envFiles) {
    const envPath = path.join(ROOT, envFile);
    console.log(`Checking ${envPath}...`);
    try {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        const urlMatch = content.match(/VITE_SUPABASE_URL\s*=\s*(.+)/);
        if (urlMatch) config.url = urlMatch[1].trim();
        const keyMatch = content.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.+)/);
        if (keyMatch) config.key = keyMatch[1].trim();
        
        if (config.url && config.key) {
          console.log(`Loaded from ${envFile}`);
          return config;
        }
      }
    } catch (e) {
      console.log(`Error reading ${envFile}: ${e.message}`);
    }
  }
  return config;
}

const config = loadConfig();
const SUPABASE_URL = config.url;
const SERVICE_KEY = config.key;

const { getSafePath } = require('../src/config/pathMapping');

if (!SERVICE_KEY) {
  console.log('Current config:', JSON.stringify({ ...config, key: config.key ? '[HIDDEN]' : 'MISSING' }));
  throw new Error('SUPABASE_SERVICE_ROLE_KEY not found in .env or .env.local');
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const CONCURRENCY = 5;
const MANIFEST_PATH = path.join(ROOT, 'upload_manifest.json');

// ─── PHASE 1: BUILD MANIFEST ───
function buildManifest() {
  console.log('\n========================================');
  console.log('  Phase 1: Building Upload Manifest');
  console.log('========================================\n');

  const manifest = [];
  const oversized = [];

  function addDir(localRoot, storagePrefixRoot, subDirs) {
    for (const sub of subDirs) {
      const localDir = path.join(localRoot, sub);
      if (!fs.existsSync(localDir)) {
        console.log(`  ⚠️  SKIP (not found): ${sub}`);
        continue;
      }
      const files = walkDir(localDir);
      let count = 0;
      for (const f of files) {
        const rel = path.relative(localDir, f).replace(/\\/g, '/');
        const storageKey = getSafePath(`${storagePrefixRoot}/${sub}/${rel}`.replace(/\\/g, '/'));
        const size = fs.statSync(f).size;
        if (size > MAX_FILE_SIZE) {
          oversized.push({ file: f, size, storageKey });
          continue;
        }
        manifest.push({ localPath: f, storageKey, size });
        count++;
      }
      console.log(`  ✅ ${sub}: ${count} files`);
    }
  }

  function addFiles(localRoot, storagePrefix, fileNames) {
    for (const fn of fileNames) {
      const fp = path.join(localRoot, fn);
      if (!fs.existsSync(fp)) {
        console.log(`  ⚠️  SKIP (not found): ${fn}`);
        continue;
      }
      const size = fs.statSync(fp).size;
      const storageKey = getSafePath(`${storagePrefix}/${fn}`.replace(/\\/g, '/'));
      if (size > MAX_FILE_SIZE) {
        oversized.push({ file: fp, size, storageKey });
        continue;
      }
      manifest.push({ localPath: fp, storageKey, size });
      console.log(`  ✅ ${fn}: ${(size/1024).toFixed(1)}KB`);
    }
  }

  // ── 1. Core JSON data (DIAMOND_BOX_4 = latest) ──
  console.log('── Core Data JSON ──');
  addFiles(path.join(ROOT, 'DIAMOND_BOX_4'), 'data', ['math_problem_texts.json', 'avs_answers.json']);
  addFiles(path.join(ROOT, 'assets_backup', 'data'), 'data', ['answers_master.json']);

  // ── 2. Math hints — 수학(상) from DIAMOND_BOX_4 (5/11 latest) ──
  console.log('\n── Math Hints: 수학(상) from DIAMOND_BOX_4 ──');
  const db4hints = path.join(ROOT, 'DIAMOND_BOX_4', 'math_hints');
  if (fs.existsSync(db4hints)) {
    const db4units = fs.readdirSync(db4hints).filter(d => fs.statSync(path.join(db4hints, d)).isDirectory());
    addDir(db4hints, 'math_hints', db4units);
  }

  // ── 3. Math hints — 수학(상) 나머지 from assets_backup/math_hints ──
  console.log('\n── Math Hints: 수학(상) 나머지 from assets_backup ──');
  const abHints = path.join(ROOT, 'assets_backup', 'math_hints');
  if (fs.existsSync(abHints)) {
    const db4unitNames = fs.existsSync(db4hints) ? fs.readdirSync(db4hints) : [];
    const abUnits = fs.readdirSync(abHints)
      .filter(d => fs.statSync(path.join(abHints, d)).isDirectory())
      .filter(d => !db4unitNames.includes(d)); // skip already added from DB4
    addDir(abHints, 'math_hints', abUnits);
  }

  // ── 4. Math hints — 수학1/미적분/확통/모의고사 from math_hints_backup_su1 ──
  console.log('\n── Math Hints: 수학1+미적+확통+모의 from su1 backup ──');
  const su1Hints = path.join(ROOT, 'assets_backup', 'math_hints_backup_su1');
  if (fs.existsSync(su1Hints)) {
    const su1Units = fs.readdirSync(su1Hints)
      .filter(d => fs.statSync(path.join(su1Hints, d)).isDirectory())
      .filter(d => !d.includes('_백업') && !d.includes('_완료'));
    // Exclude units already covered by DB4 or assets_backup/math_hints
    const alreadyCovered = new Set();
    if (fs.existsSync(db4hints)) fs.readdirSync(db4hints).forEach(d => alreadyCovered.add(d));
    if (fs.existsSync(abHints)) fs.readdirSync(abHints).forEach(d => alreadyCovered.add(d));
    const uniqueSu1 = su1Units.filter(d => !alreadyCovered.has(d));
    addDir(su1Hints, 'math_hints', uniqueSu1);
  }

  // ── 5. Math crops (images) from 20260505 backup ──
  console.log('\n── Math Crops: images from 20260505 backup ──');
  const cropsRoot = path.join(ROOT, 'backups', '20260505_full_math_curriculum', 'public', 'math_crops');
  if (fs.existsSync(cropsRoot)) {
    const activeExamDirs = [
      '(1)수학(상)중간', '(2)수학(상)기말', '(3)수학(하)중간',
      '(5)수학1 중간', '(6)수학1 기말', '(7)수학2',
      '미적분', '확통수능', '고3수능및모의고사',
      '01.다항식의 연산', '02.항등식과 나머지정리', '03.인수분해',
      '04.복소수', '05.이차방정식', '06.이차방정식과이차함수',
      '07.여러가지 방정식', '08.여러가지 부등식'
    ];
  }

  // ── 5a. Math crops (images) from active project public/math_crops/숙제 ──
  console.log('\n── Math Crops: Homework images from active public/math_crops/숙제 ──');
  const hwCropsRoot = path.join(ROOT, 'public', 'math_crops', '숙제');
  if (fs.existsSync(hwCropsRoot)) {
    const hwSubdirs = fs.readdirSync(hwCropsRoot).filter(d => fs.statSync(path.join(hwCropsRoot, d)).isDirectory());
    addDir(path.join(ROOT, 'public', 'math_crops'), 'math_crops', hwSubdirs.map(sub => `숙제/${sub}`));
  }


  // ── 6. Teacher images ──
  console.log('\n── Teacher Images ──');
  const hteachers = path.join(ROOT, 'assets_backup', 'hteachers');
  if (fs.existsSync(hteachers)) {
    const files = fs.readdirSync(hteachers).filter(f => /\.(webp|png|jpg)$/i.test(f));
    for (const f of files) {
      const fp = path.join(hteachers, f);
      manifest.push({ localPath: fp, storageKey: getSafePath(`hteachers/${f}`), size: fs.statSync(fp).size });
    }
    console.log(`  ✅ hteachers: ${files.length} files`);
  }

  // ── 7. Concept cards ──
  console.log('\n── Concept Cards ──');
  const concepts = path.join(ROOT, 'assets_backup', 'concept_cards');
  if (fs.existsSync(concepts)) {
    const cDirs = fs.readdirSync(concepts).filter(d => {
      try { return fs.statSync(path.join(concepts, d)).isDirectory(); } catch { return false; }
    });
    addDir(concepts, 'concept_cards', cDirs);
  }

  // ── SUMMARY ──
  const totalSize = manifest.reduce((a, e) => a + e.size, 0);
  console.log('\n========================================');
  console.log(`  Manifest: ${manifest.length} files`);
  console.log(`  Total size: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
  if (oversized.length > 0) {
    console.log(`  ⚠️  Oversized (>50MB): ${oversized.length} files`);
    oversized.forEach(o => console.log(`     ${o.storageKey}: ${(o.size/1024/1024).toFixed(1)}MB`));
  }
  console.log('========================================\n');

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`📋 Manifest saved: ${MANIFEST_PATH}`);

  return { manifest, oversized };
}

// ─── PHASE 2: UPLOAD ───
async function uploadManifest(manifest) {
  console.log('\n========================================');
  console.log('  Phase 2: Uploading to Supabase Storage');
  console.log('========================================\n');

  let success = 0, failed = 0, skipped = 0;
  const failures = [];

  // Process in batches
  for (let i = 0; i < manifest.length; i += CONCURRENCY) {
    const batch = manifest.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(entry => uploadFile(entry)));
    
    for (const r of results) {
      if (r.status === 'success') success++;
      else if (r.status === 'skipped') skipped++;
      else { failed++; failures.push(r); }
    }

    if ((i + CONCURRENCY) % 100 < CONCURRENCY || i + CONCURRENCY >= manifest.length) {
      const pct = ((i + CONCURRENCY) / manifest.length * 100).toFixed(1);
      console.log(`  [${pct}%] ${Math.min(i + CONCURRENCY, manifest.length)}/${manifest.length} — ✅ ${success} | ❌ ${failed} | ⏭️ ${skipped}`);
    }
  }

  console.log('\n========================================');
  console.log(`  Upload Complete`);
  console.log(`  ✅ Success: ${success}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  ⏭️ Skipped: ${skipped}`);
  console.log('========================================\n');

  if (failures.length > 0) {
    const failLog = failures.map(f => `${f.storageKey}: ${f.error}`).join('\n');
    fs.writeFileSync(path.join(ROOT, 'upload_failures.txt'), failLog);
    console.log(`📄 Failures logged: upload_failures.txt`);
    // Show first 10
    console.log('\nFirst 10 failures:');
    failures.slice(0, 10).forEach(f => console.log(`  ❌ ${f.storageKey}: ${f.error}`));
  }

  return { success, failed, skipped, failures };
}

function uploadFile(entry) {
  return new Promise((resolve) => {
    const { localPath, storageKey } = entry;
    
    if (!fs.existsSync(localPath)) {
      return resolve({ status: 'failed', storageKey, error: 'File not found' });
    }

    const fileBuffer = fs.readFileSync(localPath);
    const ext = path.extname(localPath).toLowerCase();
    const mimeMap = {
      '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png',
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
      '.txt': 'text/plain', '.js': 'application/javascript'
    };
    const contentType = mimeMap[ext] || 'application/octet-stream';
    const encodedKey = storageKey.split('/').map(s => {
      return encodeURIComponent(s)
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\[/g, '%5B')
        .replace(/\]/g, '%5D');
    }).join('/');

    const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodedKey}`;
    const parsed = new URL(url);

    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length,
        'x-upsert': 'true',
        'Cache-Control': 'public, max-age=31536000'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: 'success', storageKey });
        } else {
          console.error(`  ❌ Failed ${storageKey}: ${res.statusCode} ${body}`);
          resolve({ status: 'failed', storageKey, error: `${res.statusCode}: ${body.slice(0, 200)}` });
        }
      });
    });
    req.on('error', (e) => resolve({ status: 'failed', storageKey, error: e.message }));
    req.setTimeout(30000, () => { req.destroy(); resolve({ status: 'failed', storageKey, error: 'timeout' }); });
    req.write(fileBuffer);
    req.end();
  });
}

// ─── UTILS ───
function walkDir(dir) {
  const results = [];
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const full = path.join(dir, item);
      try {
        const stat = fs.statSync(full);
        if (stat.isDirectory()) results.push(...walkDir(full));
        else results.push(full);
      } catch { /* skip inaccessible */ }
    }
  } catch { /* skip inaccessible */ }
  return results;
}

// ─── MAIN ───
async function main() {
  const mode = process.argv[2] || 'full'; // test, full, dry-run, manifest-only
  
  if (mode === 'manifest-only') {
    buildManifest();
    return;
  }

  const { manifest, oversized } = buildManifest();
  
  if (manifest.length === 0) {
    console.log('❌ No files in manifest. Aborting.');
    return;
  }

  if (mode === 'dry-run') {
    console.log('\n========================================');
    console.log('  🔍 DRY-RUN REPORT');
    console.log('========================================');
    console.log(`- Total files to upload: ${manifest.length}`);
    const totalSize = manifest.reduce((a, e) => a + e.size, 0);
    console.log(`- Total size: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
    console.log(`- 50MB+ oversized files: ${oversized.length}`);
    
    const stats = {};
    manifest.forEach(m => {
      const category = m.storageKey.split('/')[0];
      stats[category] = (stats[category] || 0) + 1;
    });
    console.log('\n- Category breakdown:');
    Object.entries(stats).forEach(([cat, count]) => console.log(`  * ${cat}: ${count} files`));

    console.log('\n- Path Mapping Samples (Local -> Supabase) [Top 20]:');
    // Pick samples with Korean characters
    const mappingSamples = manifest.filter(m => /[가-힣]/.test(m.localPath)).slice(0, 20);
    mappingSamples.forEach(s => {
       const localRel = path.relative(ROOT, s.localPath);
       console.log(`  [KO] ${localRel}`);
       console.log(`  [EN] ${s.storageKey}`);
       console.log('  ---');
    });

    console.log('\n- Supabase Path Samples [Top 20]:');
    manifest.slice(0, 20).forEach(s => {
       console.log(`  🔗 ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${s.storageKey}`);
    });

    console.log('\n✨ Dry-run complete. NO FILES WERE UPLOADED.');
    console.log('========================================\n');
    return;
  }

  if (mode === 'test') {
    // Upload single test file
    console.log('\n🧪 Test mode: uploading first file only...');
    const result = await uploadFile(manifest[0]);
    console.log('Result:', JSON.stringify(result, null, 2));
    if (result.status === 'success') {
      const pubUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${manifest[0].storageKey}`;
      console.log(`\n🔗 Public URL: ${pubUrl}`);
    }
    return;
  }

  // Full run
  const result = await uploadManifest(manifest);
  
  // Final report
  console.log('\n========================================');
  console.log('  FINAL REPORT');
  console.log('========================================');
  console.log(`  Manifest entries: ${manifest.length}`);
  console.log(`  Uploaded: ${result.success}`);
  console.log(`  Failed: ${result.failed}`);
  console.log(`  Oversized (skipped): ${oversized.length}`);
  console.log(`  URL_PREFIX: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`);
  console.log('========================================\n');
}

main().catch(console.error);
