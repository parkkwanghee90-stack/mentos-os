// Upload curriculum JSON data files to Supabase Storage (mentos-assets/data/).
// Doubles as the "instant swap" tool: pass a source dir of known-good JSONs.
//   node scripts/supabase_upload_data.cjs [sourceDir]
// Default sourceDir = public/data
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SRC = process.argv[2] || 'public/data';
const HOST = 'trvqgqvwhqvlgqzlsxbu.supabase.co';
const BUCKET = 'mentos-assets';
const FILES = ['math_problem_texts.json', 'avs_answers.json', 'answers_master.json'];

const env = fs.readFileSync('.env', 'utf8');
const m = env.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*"?([^"\r\n]+)"?/);
if (!m) { console.error('SUPABASE_SERVICE_ROLE_KEY not in .env'); process.exit(1); }
const KEY = m[1].trim();
const md5 = b => crypto.createHash('md5').update(b).digest('hex');

function upload(name) {
  const local = path.join(SRC, name);
  const body = fs.readFileSync(local);
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: HOST, path: `/storage/v1/object/${BUCKET}/data/${name}`, method: 'POST',
      headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json', 'x-upsert': 'true', 'Content-Length': body.length, 'cache-control': 'max-age=0' }
    }, res => { let b = ''; res.on('data', d => b += d); res.on('end', () => {
      console.log(`UPLOAD data/${name} <- ${local} | HTTP ${res.statusCode} | ${body.length}B | md5 ${md5(body)}`);
      (res.statusCode >= 200 && res.statusCode < 300) ? resolve() : reject(new Error('HTTP ' + res.statusCode + ' ' + b));
    }); });
    req.on('error', reject); req.write(body); req.end();
  });
}
function verify(name) {
  return new Promise(resolve => {
    https.get(`https://${HOST}/storage/v1/object/public/${BUCKET}/data/${name}?t=${process.argv[3]||'v'}`, res => {
      let c = []; res.on('data', d => c.push(d)); res.on('end', () => { const buf = Buffer.concat(c); console.log(`VERIFY data/${name} | HTTP ${res.statusCode} | ${buf.length}B | md5 ${md5(buf)}`); resolve(); });
    }).on('error', e => { console.log('verify err', e.message); resolve(); });
  });
}
(async () => {
  console.log('--- Uploading from', SRC, '---');
  for (const f of FILES) await upload(f);
  console.log('--- Verifying public URLs ---');
  for (const f of FILES) await verify(f);
  console.log('DONE');
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
