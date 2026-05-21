const fs = require('fs');

const SUPABASE_URL = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydnFncXZ3aHF2bGdxemxzeGJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY1NzA1MywiZXhwIjoyMDk0MjMzMDUzfQ.a76V1LYSItB48fXQN2in-rXfy8oD4o7KJteAMCyX9so';
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
