const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const BUCKET = 'mentos-assets';

function loadConfig() {
  const config = { url: 'https://trvqgqvwhqvlgqzlsxbu.supabase.co', key: '' };
  for (const envFile of ['.env.local', '.env']) {
    try {
      const content = fs.readFileSync(path.join(ROOT, envFile), 'utf-8');
      const urlMatch = content.match(/VITE_SUPABASE_URL\s*=\s*(.+)/);
      if (urlMatch) config.url = urlMatch[1].trim();
      const keyMatch = content.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.+)/);
      if (keyMatch) config.key = keyMatch[1].trim();
      if (config.url && config.key) return config;
    } catch {}
  }
  return config;
}

const config = loadConfig();
const SUPABASE_URL = config.url;
const SERVICE_KEY = config.key;

async function uploadFile(localPath, storageKey) {
  return new Promise((resolve) => {
    if (!fs.existsSync(localPath)) {
      console.error(`  ❌ Local file not found: ${localPath}`);
      return resolve({ status: 'failed', storageKey, error: 'File not found' });
    }

    const fileBuffer = fs.readFileSync(localPath);
    const ext = path.extname(localPath).toLowerCase();
    const mimeMap = { '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png' };
    const contentType = mimeMap[ext] || 'application/octet-stream';
    
    const encodedKey = storageKey.split('/').map(s => encodeURIComponent(s).replace(/\(/g, '%28').replace(/\)/g, '%29')).join('/');
    const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodedKey}`;
    
    const opts = {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': contentType,
        'x-upsert': 'true'
      }
    };

    const req = https.request(url, opts, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`  ✅ Uploaded: ${storageKey}`);
          resolve({ status: 'success', storageKey, publicUrl: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storageKey}` });
        } else {
          console.error(`  ❌ Failed ${storageKey}: ${res.statusCode} ${body}`);
          resolve({ status: 'failed', storageKey, error: body });
        }
      });
    });

    req.on('error', (err) => {
      console.error(`  ❌ Error ${storageKey}: ${err.message}`);
      resolve({ status: 'error', storageKey, error: err.message });
    });

    req.write(fileBuffer);
    req.end();
  });
}

async function runTest() {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'upload_manifest_test_math2.json'), 'utf-8'));
  console.log(`Starting test upload of ${manifest.length} files...`);
  
  const results = [];
  for (const item of manifest) {
    const res = await uploadFile(item.localPath, item.storageKey);
    results.push(res);
  }
  
  console.log('\n========================================');
  console.log('  Test Upload Summary');
  console.log('========================================');
  results.forEach(r => {
    if (r.status === 'success') {
      console.log(`✅ ${r.storageKey}\n   URL: ${r.publicUrl}`);
    } else {
      console.log(`❌ ${r.storageKey} (Failed)`);
    }
  });
}

runTest();
