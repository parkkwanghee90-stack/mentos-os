const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load the same path mapping logic used by the React app
const { getSafePath } = require('../src/config/pathMapping.js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://trvqgqvwhqvlgqzlsxbu.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydnFncXZ3aHF2bGdxemxzeGJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY1NzA1MywiZXhwIjoyMDk0MjMzMDUzfQ.a76V1LYSItB48fXQN2in-rXfy8oD4o7KJteAMCyX9so';
const BUCKET = 'mentos-assets';

const CONCURRENCY = 15; // 병렬 업로드 개수

async function uploadFile(localAbsPath, remotePath) {
  if (!fs.existsSync(localAbsPath)) {
    return { path: remotePath, status: 'missing', error: 'File not found locally' };
  }

  const fileBuffer = fs.readFileSync(localAbsPath);
  const ext = path.extname(localAbsPath).toLowerCase();
  let contentType = 'application/octet-stream';
  if (ext === '.json') contentType = 'application/json';
  if (ext === '.png') contentType = 'image/png';
  if (ext === '.webp') contentType = 'image/webp';
  if (ext === '.svg') contentType = 'image/svg+xml';
  if (ext === '.mp3') contentType = 'audio/mpeg';

  // URL encode path segments for the REST API
  const encodedRemotePath = remotePath.split('/').map(encodeURIComponent).join('/');
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodedRemotePath}`;

  try {
    const res = await fetch(url, {
      method: 'POST', // Storage API uses POST with x-upsert header for upserting
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': contentType,
        'x-upsert': 'true',
        'Cache-Control': 'public, max-age=31536000',
      },
      body: fileBuffer,
    });

    if (res.ok) {
      return { path: remotePath, status: 'ok' };
    } else {
      const errText = await res.text();
      return { path: remotePath, status: 'error', error: `${res.status}: ${errText.slice(0, 200)}` };
    }
  } catch (e) {
    return { path: remotePath, status: 'error', error: e.message };
  }
}

// Recursively find all files in a directory
function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

async function main() {
  console.log('====================================================');
  console.log('⚡ Mentos OS — Surgical Supabase Storage Asset Sync ⚡');
  console.log('====================================================');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Bucket: ${BUCKET}\n`);

  const uploadQueue = [];

  // 1. Core Data JSONs (avs_answers, math_problem_texts, answers_master)
  console.log('🔍 Preparing Core Data JSONs...');
  const coreFiles = ['avs_answers.json', 'math_problem_texts.json', 'answers_master.json'];
  for (const file of coreFiles) {
    const localPath = path.join('public', 'data', file);
    if (fs.existsSync(localPath)) {
      uploadQueue.push({ localPath, remotePath: getSafePath(`data/${file}`) });
      console.log(`  ➕ Added: data/${file} (mapped: ${getSafePath(`data/${file}`)})`);
    }
  }

  // 2. Math Hints
  console.log('\n🔍 Scanning Math Hints...');
  const hintsDir = path.join('public', 'math_hints');
  if (fs.existsSync(hintsDir)) {
    const hintFiles = getAllFiles(hintsDir);
    let hintCount = 0;
    for (const f of hintFiles) {
      if (!f.endsWith('.json')) continue;
      const relPath = path.relative(hintsDir, f).replace(/\\/g, '/');
      const mappedPath = getSafePath(`math_hints/${relPath}`);
      uploadQueue.push({ localPath: f, remotePath: mappedPath });
      hintCount++;
    }
    console.log(`  ✅ Found ${hintCount} JSON hints`);
  }

  // 3. Math Crops
  console.log('\n🔍 Scanning Math Crops...');
  const cropsDir = path.join('public', 'math_crops');
  if (fs.existsSync(cropsDir)) {
    const cropFiles = getAllFiles(cropsDir);
    let cropCount = 0;
    for (const f of cropFiles) {
      const ext = path.extname(f).toLowerCase();
      if (ext !== '.png' && ext !== '.webp') continue;
      const relPath = path.relative(cropsDir, f).replace(/\\/g, '/');
      const mappedPath = getSafePath(`math_crops/${relPath}`);
      uploadQueue.push({ localPath: f, remotePath: mappedPath });
      cropCount++;
    }
    console.log(`  ✅ Found ${cropCount} crop images`);
  }

  console.log(`\n🚀 Total files to sync: ${uploadQueue.length}\n`);

  let successCount = 0;
  let failCount = 0;
  let processed = 0;
  const startTime = Date.now();

  // Process queue in concurrency-limited batches
  for (let i = 0; i < uploadQueue.length; i += CONCURRENCY) {
    const batch = uploadQueue.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(item => uploadFile(item.localPath, item.remotePath))
    );

    for (let rIdx = 0; rIdx < results.length; rIdx++) {
      const r = results[rIdx];
      processed++;
      if (r.status === 'ok') {
        successCount++;
      } else {
        failCount++;
        console.error(`  ❌ Failed to upload: ${r.path} — ${r.error}`);
      }
    }

    if (processed % 50 === 0 || processed === uploadQueue.length) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const pct = ((processed / uploadQueue.length) * 100).toFixed(1);
      console.log(`  [${pct}%] ${processed}/${uploadQueue.length} — ✅ Success: ${successCount} | ❌ Fail: ${failCount} (${elapsed}s)`);
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n====================================================');
  console.log('🎉 SYNC COMPLETE REPORT');
  console.log('====================================================');
  console.log(`Total Scanned: ${uploadQueue.length}`);
  console.log(`Successfully Uploaded: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total Time Elapsed: ${totalTime}s`);
  console.log('====================================================\n');
}

main().catch(console.error);
