#!/usr/bin/env node
/**
 * Mentos OS — Surgical Homework & Database Asset Upload to Supabase Storage
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ─── CONFIG ───
const ROOT = path.resolve(__dirname, '..');
const BUCKET = 'mentos-assets';

function loadConfig() {
  const config = {
    url: 'https://trvqgqvwhqvlgqzlsxbu.supabase.co',
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
  throw new Error('SUPABASE_SERVICE_ROLE_KEY not found in .env or .env.local');
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const CONCURRENCY = 8; // Higher concurrency for fast uploads

function buildManifest() {
  console.log('\n========================================');
  console.log('  Building Surgical Upload Manifest');
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
      manifest.push({ localPath: fp, storageKey, size });
      console.log(`  ✅ ${fn}: ${(size/1024).toFixed(1)}KB`);
    }
  }

  // 1. Updated core database JSONs
  console.log('── Core Data JSON ──');
  addFiles(path.join(ROOT, 'src', 'data'), 'data', ['math_problem_texts.json', 'avs_answers.json']);
  addFiles(path.join(ROOT, 'public', 'data'), 'data', ['math_problem_texts.json']);

  // 2. Homework crops (images) from active project
  console.log('\n── Math Crops: Homework images from public/math_crops/숙제 ──');
  const hwCropsRoot = path.join(ROOT, 'public', 'math_crops', '숙제');
  if (fs.existsSync(hwCropsRoot)) {
    const hwSubdirs = fs.readdirSync(hwCropsRoot).filter(d => fs.statSync(path.join(hwCropsRoot, d)).isDirectory());
    addDir(path.join(ROOT, 'public', 'math_crops'), 'math_crops', hwSubdirs.map(sub => `숙제/${sub}`));
  }

  const totalSize = manifest.reduce((a, e) => a + e.size, 0);
  console.log('\n========================================');
  console.log(`  Manifest: ${manifest.length} files`);
  console.log(`  Total size: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
  console.log('========================================\n');

  return { manifest };
}

async function uploadManifest(manifest) {
  console.log('\n========================================');
  console.log('  Phase 2: Uploading to Supabase Storage');
  console.log('========================================\n');

  let success = 0, failed = 0, skipped = 0;
  const failures = [];

  for (let i = 0; i < manifest.length; i += CONCURRENCY) {
    const batch = manifest.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(entry => uploadFile(entry)));
    
    for (const r of results) {
      if (r.status === 'success') success++;
      else if (r.status === 'skipped') skipped++;
      else { failed++; failures.push(r); }
    }

    if ((i + CONCURRENCY) % 20 < CONCURRENCY || i + CONCURRENCY >= manifest.length) {
      const pct = ((i + CONCURRENCY) / manifest.length * 100).toFixed(1);
      console.log(`  [${pct}%] ${Math.min(i + CONCURRENCY, manifest.length)}/${manifest.length} — ✅ ${success} | ❌ ${failed}`);
    }
  }

  return { success, failed };
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
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg'
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
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
  return results;
}

async function main() {
  const { manifest } = buildManifest();
  if (manifest.length === 0) {
    console.log('No files to upload.');
    return;
  }
  
  console.log(`Starting surgical upload of ${manifest.length} files...`);
  const result = await uploadManifest(manifest);
  console.log(`\nSurgical Upload Finished: ✅ ${result.success} Success, ❌ ${result.failed} Failed.`);
}

main().catch(console.error);
