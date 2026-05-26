const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { getSafePath } = require('../src/config/pathMapping.js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://trvqgqvwhqvlgqzlsxbu.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydnFncXZ3aHF2bGdxemxzeGJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY1NzA1MywiZXhwIjoyMDk0MjMzMDUzfQ.a76V1LYSItB48fXQN2in-rXfy8oD4o7KJteAMCyX9so';
const BUCKET = 'mentos-assets';

const TARGET_UNITS = ['원의방정식2단계', '원의방정식3단계', '원의방정식4단계'];
const BASE_DIR = path.join(__dirname, '..', 'public', 'math_hints');
const CONCURRENCY = 10;

async function uploadFile(localAbsPath, remotePath) {
  if (!fs.existsSync(localAbsPath)) {
    return { path: remotePath, status: 'missing', error: 'File not found locally' };
  }

  const fileBuffer = fs.readFileSync(localAbsPath);
  const contentType = 'application/json';

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

async function main() {
  console.log('========================================================');
  console.log('🔺 Mentos OS — Surgical Circle Equation Hints Sync 🔺');
  console.log('========================================================\n');

  const uploadQueue = [];

  for (const unit of TARGET_UNITS) {
    const unitDir = path.join(BASE_DIR, unit);
    if (!fs.existsSync(unitDir)) {
      console.log(`⚠️  Unit directory not found: ${unitDir}`);
      continue;
    }

    console.log(`🔍 Scanning Unit: ${unit}...`);
    const files = fs.readdirSync(unitDir).filter(f => f.endsWith('.json'));
    
    for (const f of files) {
      const localPath = path.join(unitDir, f);
      const mappedPath = getSafePath(`math_hints/${unit}/${f}`);
      uploadQueue.push({ localPath, remotePath: mappedPath });
    }
    console.log(`  ➔ Added ${files.length} files from ${unit}`);
  }

  console.log(`\n🚀 Starting upload of ${uploadQueue.length} hints...`);

  let successCount = 0;
  let failCount = 0;
  let processed = 0;
  const startTime = Date.now();

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

    const pct = ((processed / uploadQueue.length) * 100).toFixed(1);
    console.log(`  [${pct}%] ${processed}/${uploadQueue.length} — ✅ Success: ${successCount} | ❌ Fail: ${failCount}`);
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n========================================================');
  console.log('🎉 UPLOAD COMPLETE REPORT');
  console.log('========================================================');
  console.log(`Total Upload Queue: ${uploadQueue.length}`);
  console.log(`Successfully Uploaded: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Time Elapsed: ${totalTime}s`);
  console.log('========================================================\n');
}

main().catch(console.error);
