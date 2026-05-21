const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydnFncXZ3aHF2bGdxemxzeGJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY1NzA1MywiZXhwIjoyMDk0MjMzMDUzfQ.a76V1LYSItB48fXQN2in-rXfy8oD4o7KJteAMCyX9so';
const BUCKET = 'mentos-assets';

async function uploadFile(localAbsPath, remotePath) {
  const fileBuffer = fs.readFileSync(localAbsPath);
  
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${remotePath}`;
  const ext = path.extname(localAbsPath);
  let contentType = 'application/octet-stream';
  if (ext === '.json') contentType = 'application/json';
  if (ext === '.png') contentType = 'image/png';
  if (ext === '.webp') contentType = 'image/webp';

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: fileBuffer,
  });

  if (res.ok) {
    return true;
  } else {
    return false;
  }
}

async function scanAndUploadCrops(baseDir) {
  if (!fs.existsSync(baseDir)) return;
  const items = fs.readdirSync(baseDir);
  let totalUploaded = 0;

  for (const item of items) {
    const fullPath = path.join(baseDir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      const files = fs.readdirSync(fullPath);
      for (const f of files) {
        if (!f.endsWith('.png') && !f.endsWith('.webp')) continue;

        const localPath = path.join(fullPath, f);
        const remotePath = `math_crops/${item}/${f}`;
        const res = await uploadFile(localPath, remotePath);
        if (res) {
          totalUploaded++;
          if (totalUploaded % 100 === 0) process.stdout.write('.');
        }
      }
    }
  }
  console.log(`\nUploaded ${totalUploaded} crops.`);
  return totalUploaded;
}

async function scanAndUploadHints(baseDir) {
  if (!fs.existsSync(baseDir)) return;
  const items = fs.readdirSync(baseDir);
  let totalUploaded = 0;

  for (const item of items) {
    const fullPath = path.join(baseDir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      const files = fs.readdirSync(fullPath);
      for (const f of files) {
        if (!f.endsWith('.json')) continue;

        const localPath = path.join(fullPath, f);
        const remotePath = `math_hints/${item}/${f}`;
        const res = await uploadFile(localPath, remotePath);
        if (res) {
          totalUploaded++;
          if (totalUploaded % 100 === 0) process.stdout.write('.');
        }
      }
    }
  }
  console.log(`\nUploaded ${totalUploaded} hints.`);
  return totalUploaded;
}

async function main() {
  console.log('--- Uploading all local hints and crops to Supabase ---');
  await scanAndUploadCrops('C:\\mentos_os_clean\\public\\math_crops');
  await scanAndUploadHints('C:\\mentos_os_clean\\public\\math_hints');
}

main().catch(console.error);
