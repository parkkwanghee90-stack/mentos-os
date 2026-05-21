const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydnFncXZ3aHF2bGdxemxzeGJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODY1NzA1MywiZXhwIjoyMDk0MjMzMDUzfQ.a76V1LYSItB48fXQN2in-rXfy8oD4o7KJteAMCyX9so';
const BUCKET = 'mentos-assets';

function getHintFolder(unitName) {
  if (!unitName) return null;
  const clean = unitName.replace(/\s+/g, '');
  const stepMatch = clean.match(/(2|3|4)단계/);
  const stepStr = stepMatch ? stepMatch[0] : '2단계';
  const stepNum = stepMatch ? stepMatch[1] : '2';

  if (clean.includes('삼각함수') && clean.includes('활용')) return stepStr === '4단계' ? '삼각함수활용 4단계(68)' : `삼각함수활용${stepStr}`;
  if (clean.includes('삼각함수') && clean.includes('그래프')) return stepStr === '4단계' ? '삼각함수그래프' : `삼각함수그래프${stepStr}`;
  if (clean.includes('삼각함수') && (clean.includes('정의') || clean.includes('성질'))) return stepStr !== '2단계' ? `삼각함수${stepStr}` : `삼각함수성질${stepStr}`;
  if (clean.includes('등차') || clean.includes('등비')) return stepStr === '4단계' ? '등차등비수열4단계' : `등차등비${stepStr}`;
  if (clean.includes('시그마')) { if (stepStr === '3단계') return '여러가지수열3단계'; if (stepStr === '4단계') return '수열의합4단계'; return `시그마용법${stepStr}`; }
  if (clean.includes('귀납적')) return stepStr === '2단계' ? '귀납적정의2단계' : `수학적귀납법${stepStr}`;
  if (clean.includes('지수함수')) return `지수함수${stepStr}`;
  if (clean.includes('로그함수')) return `로그함수${stepStr}`;
  if (clean.includes('행렬')) return `행렬${stepStr}`;
  if (clean.includes('고차방정식')) return `고차방정식${stepStr}`;
  if (clean.includes('일차부등식')) return `일차부등식${stepStr}`;
  if (clean.includes('이차부등식')) return `이차부등식${stepStr}`;
  if (clean.includes('경우의수')) return `경우의수${stepStr}`;
  if (clean.includes('점과좌표')) return `점과좌표${stepStr}`;
  if (clean.includes('직선의방정식')) return `직선의방정식${stepStr}`;
  if (clean.includes('원의방정식')) return `원의방정식${stepStr}`;
  if (clean.includes('도형의이동')) return `도형의이동${stepStr}`;
  if (clean.includes('지수2단계')) return '지수2단계';
  if (clean.includes('지수3단계')) return '지수3단계';
  if (clean.includes('지수로그4단계')) return '지수로그4단계';
  if (clean.includes('지수로그함수4단계')) return '지수로그함수4단계';
  if (clean.includes('로그2단계')) return '로그2단계';
  if (clean.includes('로그3단계')) return '로그3단계';
  if (clean.includes('삼각함수3단계')) return '삼각함수3단계';
  return unitName; // default fallback
}

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

async function scanAndUpload(baseDir) {
  if (!fs.existsSync(baseDir)) return;
  const items = fs.readdirSync(baseDir);
  let totalUploaded = 0;

  for (const item of items) {
    const fullPath = path.join(baseDir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      const mappedFolder = getHintFolder(item);
      // Let's check if it's a target Math1/Sang unit
      const isTarget = ['고차방정식','부등식','경우의수','점과좌표','직선의방정식','원의방정식','도형의이동','행렬','지수','로그','삼각','등차','시그마','수열','귀납'].some(k => mappedFolder.includes(k));
      if (!isTarget) continue;

      console.log(`\n📂 Processing local: ${item} -> remote: math_hints/${mappedFolder}`);
      const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.json'));
      for (const f of files) {
        // skip files that don't look like 001.json
        if (!/^\d{3}[a-z]?\.json$/.test(f)) continue;

        const localPath = path.join(fullPath, f);
        const remotePath = `math_hints/${mappedFolder}/${f}`;
        const res = await uploadFile(localPath, remotePath);
        if (res) totalUploaded++;
      }
    }
  }
  return totalUploaded;
}

async function main() {
  console.log('--- Uploading Math (Sang) and Math 1 Hints to correct paths ---');
  let count = 0;
  count += await scanAndUpload('C:\\mentos_os_clean\\public\\math_hints');
  count += await scanAndUpload('C:\\mentos_os_clean\\assets_backup\\math_hints_backup_su1');
  console.log(`\nTotal uploaded: ${count}`);
}

main().catch(console.error);
