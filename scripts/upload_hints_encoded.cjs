/**
 * 한글 경로 힌트 파일 → Supabase Storage 업로드
 * Supabase Storage는 한글 key에 URL encoding이 필요
 */
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydnFncXZ3aHF2bGdxemxzeGJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY1NzA1MywiZXhwIjoyMDk0MjMzMDUzfQ.a76V1LYSItB48fXQN2in-rXfy8oD4o7KJteAMCyX9so';
const BUCKET = 'mentos-assets';

async function uploadFile(localAbsPath, remotePath) {
  const fileBuffer = fs.readFileSync(localAbsPath);
  
  // URL-encode each path segment for Korean characters
  const encodedPath = remotePath.split('/').map(s => encodeURIComponent(s)).join('/');
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodedPath}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'x-upsert': 'true',
    },
    body: fileBuffer,
  });

  if (res.ok) {
    console.log(`  ✅ ${remotePath} (${fileBuffer.length}b)`);
    return true;
  } else {
    const errText = await res.text();
    console.log(`  ❌ ${remotePath} → ${res.status}: ${errText.substring(0, 150)}`);
    return false;
  }
}

async function main() {
  const hintDir = path.join(__dirname, '..', 'assets_backup', 'math_hints', '도형의이동2단계');
  const files = fs.readdirSync(hintDir).filter(f => f.endsWith('.json'));
  
  console.log(`\n📦 Uploading ${files.length} hint files (URL-encoded Korean paths)\n`);
  
  let ok = 0, fail = 0;
  for (const f of files) {
    const localPath = path.join(hintDir, f);
    const remotePath = `math_hints/도형의이동2단계/${f}`;
    const result = await uploadFile(localPath, remotePath);
    if (result) ok++; else fail++;
  }
  
  console.log(`\n📊 Done: ${ok} uploaded, ${fail} failed`);
  
  // Verify first file
  const verifyPath = encodeURIComponent('도형의이동2단계');
  const verifyUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/math_hints/${verifyPath}/001.json`;
  console.log(`\n🔍 Verify URL: ${verifyUrl}`);
  const verifyRes = await fetch(verifyUrl);
  console.log(`   Status: ${verifyRes.status} ${verifyRes.statusText}`);
  if (verifyRes.ok) {
    const data = await verifyRes.json();
    console.log(`   ✅ JSON loaded! Keys: ${Object.keys(data).join(', ')}`);
  }
}

main().catch(console.error);
