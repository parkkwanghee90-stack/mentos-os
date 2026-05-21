/**
 * Upload hteachers/ webp files to Supabase mentos-assets bucket.
 * Only uploads .webp files (not .png) to keep bucket lean.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPABASE_URL = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co';
const BUCKET = 'mentos-assets';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydnFncXZ3aHF2bGdxemxzeGJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY1NzA1MywiZXhwIjoyMDk0MjMzMDUzfQ.a76V1LYSItB48fXQN2in-rXfy8oD4o7KJteAMCyX9so';
const BASE_DIR = path.resolve(__dirname, '..', 'assets_backup', 'hteachers');

function uploadFile(localPath, remotePath) {
  return new Promise((resolve, reject) => {
    const fileData = fs.readFileSync(localPath);
    const url = new URL(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${remotePath}`);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'image/webp',
        'Content-Length': fileData.length,
        'x-upsert': 'true'  // overwrite if exists
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, path: remotePath });
        } else {
          reject(new Error(`${res.statusCode}: ${body} for ${remotePath}`));
        }
      });
    });
    req.on('error', reject);
    req.write(fileData);
    req.end();
  });
}

async function main() {
  // Gather all .webp files under hteachers/
  const subjects = fs.readdirSync(BASE_DIR).filter(d => fs.statSync(path.join(BASE_DIR, d)).isDirectory());
  
  let total = 0;
  let success = 0;
  let failed = 0;
  
  for (const subj of subjects) {
    const dir = path.join(BASE_DIR, subj);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.webp'));
    
    for (const file of files) {
      const localPath = path.join(dir, file);
      const remotePath = `hteachers/${subj}/${file}`;
      total++;
      
      try {
        const result = await uploadFile(localPath, remotePath);
        console.log(`✅ ${result.status} ${remotePath}`);
        success++;
      } catch (err) {
        console.error(`❌ FAIL ${remotePath}: ${err.message}`);
        failed++;
      }
    }
  }
  
  console.log(`\n=== Upload Complete ===`);
  console.log(`Total: ${total}, Success: ${success}, Failed: ${failed}`);
}

main().catch(console.error);
