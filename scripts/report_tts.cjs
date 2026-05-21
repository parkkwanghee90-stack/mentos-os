const fs = require('fs');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'math-tts';

// Load the English map
const mapPath = 'scripts/tts_map.json';
const unitMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

// Reverse map to get Korean names back
const revMap = {};
for (const [korean, eng] of Object.entries(unitMap)) {
  if (!revMap[eng]) revMap[eng] = [];
  revMap[eng].push(korean);
}

async function reportTTS() {
  const engFolders = [...new Set(Object.values(unitMap))];
  
  const report = [];

  for (const folder of engFolders) {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prefix: `${folder}/`, limit: 100 })
    });
    
    if (res.ok) {
      const files = await res.json();
      const mp3s = files.filter(f => f.name.endsWith('.mp3'));
      if (mp3s.length > 0) {
        const pids = mp3s.map(f => parseInt(f.name.replace('.mp3', '')));
        const maxPid = Math.max(...pids);
        
        // Match back to Korean folder name
        const koreanNames = revMap[folder].join(', ');
        report.push(`- 단원명: [${koreanNames}] -> ${mp3s.length}개 완료 (최대 ${maxPid}번 문제까지)`);
      }
    }
  }

  console.log('=== 현재 완료된 TTS 목록 ===');
  console.log(report.join('\n'));
}

reportTTS().catch(console.error);
