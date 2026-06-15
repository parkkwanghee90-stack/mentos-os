require('dotenv').config();
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY 미설정 — .env에 service_role 키를 설정하세요(코드 하드코딩 금지).');
const fs = require('fs');

const SUPABASE_URL = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'mentos-assets';

async function uploadFile(localAbsPath, remotePath) {
  if (!fs.existsSync(localAbsPath)) return;
  const fileBuffer = fs.readFileSync(localAbsPath);
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${remotePath}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'x-upsert': 'true',
    },
    body: fileBuffer,
  });
  if (res.ok) console.log(`✅ Uploaded ${remotePath}`);
  else console.log(`❌ Failed to upload ${remotePath}`);
}

async function main() {
  await uploadFile('C:\\mentos_os_clean\\assets_backup\\data\\math_problem_texts.json', 'data/math_problem_texts.json');
}

main().catch(console.error);
