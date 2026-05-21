const fs = require('fs');
const path = require('path');

const hintsBase = 'public/math_hints';
let totalChars = 0, totalFiles = 0, noP = 0;

const scanDir = (dir) => {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    const p = path.join(dir, item);
    if (fs.statSync(p).isDirectory()) { scanDir(p); continue; }
    if (!item.endsWith('.json')) continue;
    try {
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      const pText = data.P || data.p || '';
      const cText = data.C || data.c || '';
      const bText = data.B || data.b || '';
      if (!pText && !cText && !bText) { noP++; continue; }
      const combined = [pText, cText, bText].join(' ');
      // Strip LaTeX commands for char count
      const cleaned = combined
        .replace(/\\[a-zA-Z]+\{[^}]*\}/g, '')
        .replace(/\\\\/g, '')
        .replace(/[\$\{\}\\]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      totalChars += cleaned.length;
      totalFiles++;
    } catch(e) {}
  }
};

scanDir(hintsBase);

const costPer1M = 15;
const totalCost = (totalChars / 1000000) * costPer1M;
const avgChars = Math.round(totalChars / totalFiles);
const avgFileSize = 80;
const totalStorage = Math.round(totalFiles * avgFileSize / 1024);

console.log('=== TTS 비용 추정 ===');
console.log('PCB 텍스트가 있는 파일:', totalFiles + '개');
console.log('PCB 없는 파일:', noP + '개 (스킵)');
console.log('총 글자 수:', totalChars.toLocaleString() + '자');
console.log('평균 글자 수:', avgChars + '자/문제');
console.log('');
console.log('OpenAI TTS-1 비용: $' + totalCost.toFixed(2) + ' (약 ' + Math.round(totalCost * 1400) + '원)');
console.log('예상 저장 용량: ~' + totalStorage + 'MB');
console.log('Supabase Free: 1GB Storage 포함');
