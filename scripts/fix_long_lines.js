/**
 * fix_long_lines.js
 * 줄바꿈이 부족한 23개 문제를 Vision API로 재추출 (완벽 줄바꿈 지시)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '../public');
const DICT_JSON = path.join(__dirname, '../src/data/math_problem_texts.json');

const envFile = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
let apiKey = '';
for (const line of envFile.split('\n')) {
  if (line.startsWith('VITE_OPENAI_API_KEY=')) apiKey = line.split('=')[1].trim();
}

function toBase64(p) { return Buffer.from(fs.readFileSync(p)).toString('base64'); }

function safeParseJson(raw) {
  try { return JSON.parse(raw); } catch {}
  const m = raw.match(/"questionText"\s*:\s*"([\s\S]+?)(?<!\\)"\s*\}/);
  if (m) return { questionText: m[1] };
  throw new Error('parse failed');
}

function isValid(t) { return t && t.trim().length > 0 && (/[가-힣]/.test(t) || /\$/.test(t)); }

function hasLongLine(text) {
  return text.split('\n').some(line => line.length > 120);
}

async function extractWithBreaks(imgPath, unit) {
  const b64 = toBase64(imgPath);
  const prompt = `Extract this Korean math problem (${unit}) with proper line breaks.
Return ONLY: {"questionText": "CONTENT"}

CRITICAL LINE BREAK RULES:
- After "이다." → add \\n before next sentence
- After "하자." → add \\n before next sentence  
- After "있다." → add \\n before next sentence
- After "라 하자." → add \\n
- After coordinate/condition group like "~이고," or "~이며," → add \\n if sentence continues
- After "이때" → keep on same line unless very long
- Each option ①②③④⑤ MUST be on its own line
- Math in options MUST be wrapped in $: ② $\\\\sqrt{2}$ 
- Backslashes doubled: \\\\sqrt \\\\frac \\\\overline \\\\leq \\\\geq \\\\pm
- NO line should exceed 80 characters (break naturally at Korean sentence boundaries)

Return valid JSON only, no markdown.`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:image/webp;base64,${b64}` } }
        ]}],
        max_tokens: 1000, temperature: 0.0
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    let c = data.choices[0].message.content.trim();
    if (c.startsWith('```')) c = c.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    return safeParseJson(c).questionText;
  } catch(e) { return null; }
}

function fixOptionMath(text) {
  if (!text) return text;
  const oi = text.search(/[①②③④⑤]/);
  if (oi === -1) return text;
  const body = text.slice(0, oi);
  const opts = text.slice(oi);
  let normalized = opts.replace(/([^\n])(①|②|③|④|⑤)/g, '$1\n$2');
  normalized = normalized.replace(/(①|②|③|④|⑤)\s*([^\n①②③④⑤]+)/g, (_, circle, val) => {
    let v = val.trim();
    if (/\\[a-zA-Z]/.test(v) && !v.startsWith('$')) v = `$${v}$`;
    if (/[A-Za-z]?\([-\d., ]+\)/.test(v) && !v.startsWith('$')) v = `$${v}$`;
    return `${circle} ${v}`;
  });
  return body + normalized;
}

const BROKEN_FILES = [
  { cropFolder: '(2)수학(상)기말/직선의방정식3단계', keyPrefix: '직선의방정식3단계', name: '직선3단계',
    files: ['003.webp', '010.webp', '019.webp'] },
  { cropFolder: '(2)수학(상)기말/직선의방정식4단계', keyPrefix: '직선의방정식4단계', name: '직선4단계',
    files: ['004.webp', '005.webp'] },
  { cropFolder: '(2)수학(상)기말/(7)원의방정식 개념2단계(54)p24 1+1(쌍둥이)', keyPrefix: '(7)원의방정식 개념2단계(54)p24 1+1(쌍둥이)', name: '원2단계',
    files: ['033.webp', '037.webp'] },
  { cropFolder: '(2)수학(상)기말/원의방정식3단계', keyPrefix: '원의방정식3단계', name: '원3단계',
    files: ['005.webp', '016.webp', '022.webp', '026.webp'] },
  { cropFolder: '(2)수학(상)기말/원의방정식4단계', keyPrefix: '원의방정식4단계', name: '원4단계',
    files: ['012.webp', '022.webp', '044.webp', '045.webp', '050.webp', '053.webp',
            '061.webp', '063.webp', '065.webp', '071.webp', '079.webp', '081.webp'] },
];

const pLimit = async (n) => { const { default: m } = await import('p-limit'); return m(n); };

async function main() {
  console.log('=== 줄바꿈 부족 23개 파일 재추출 ===\n');
  const dict = JSON.parse(fs.readFileSync(DICT_JSON, 'utf-8'));
  const limit = await pLimit(5);
  let totalFixed = 0;

  for (const { cropFolder, keyPrefix, name, files } of BROKEN_FILES) {
    const folderPath = path.join(PUBLIC_DIR, 'math_crops', cropFolder);
    console.log(`\n[${name}] ${files.length}개 재추출...`);

    const tasks = files.map(file => limit(async () => {
      const key = `${keyPrefix}/${file}`;
      const imgPath = path.join(folderPath, file);
      
      // Show current (before)
      const before = dict[key] || '';
      const maxLineBefore = Math.max(...(before.split('\n').map(l => l.length)));
      
      let extracted = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        extracted = await extractWithBreaks(imgPath, name);
        if (extracted && isValid(extracted)) break;
        if (attempt < 3) await new Promise(r => setTimeout(r, 800));
      }

      if (extracted && isValid(extracted)) {
        const fixed = fixOptionMath(extracted);
        const maxLineAfter = Math.max(...(fixed.split('\n').map(l => l.length)));
        dict[key] = fixed;
        totalFixed++;
        const improved = maxLineAfter <= maxLineBefore ? '✓개선' : '△같음';
        console.log(`  ${improved} ${file} (최대줄: ${maxLineBefore}→${maxLineAfter}자)`);
        if (hasLongLine(fixed)) {
          console.log(`    ⚠ 여전히 긴 줄 있음 (${maxLineAfter}자)`);
        }
      } else {
        console.log(`  ✗ ${file} 재추출 실패`);
      }
    }));

    await Promise.all(tasks);
    fs.writeFileSync(DICT_JSON, JSON.stringify(dict, null, 2), 'utf-8');
  }

  // Final validation
  console.log(`\n총 ${totalFixed}개 업데이트`);
  
  console.log('\n=== 최종 전체 검수 ===');
  const allFolders = [
    { keyPrefix: '(6)직선의방정식 개념2단계(44)p19 1+1(쌍둥이)', name: '직선2단계', count: 44 },
    { keyPrefix: '직선의방정식3단계', name: '직선3단계', count: 31 },
    { keyPrefix: '직선의방정식4단계', name: '직선4단계', count: 8 },
    { keyPrefix: '(7)원의방정식 개념2단계(54)p24 1+1(쌍둥이)', name: '원2단계', count: 54 },
    { keyPrefix: '원의방정식3단계', name: '원3단계', count: 28 },
    { keyPrefix: '원의방정식4단계', name: '원4단계', count: 92 },
  ];

  let grandPass = 0, grandTotal = 0;
  for (const { keyPrefix, name, count } of allFolders) {
    let pass = 0;
    const fails = [];
    for (let i = 1; i <= count; i++) {
      const key = `${keyPrefix}/${String(i).padStart(3,'0')}.webp`;
      const t = dict[key];
      if (!isValid(t)) { fails.push(`${i}번:없음`); continue; }
      if (hasLongLine(t)) { fails.push(`${i}번:긴줄`); continue; }
      pass++;
    }
    grandPass += pass;
    grandTotal += count;
    const ok = pass === count ? '✅' : '❌';
    console.log(`${ok} ${name}: ${pass}/${count}${fails.length > 0 ? ' | ' + fails.slice(0,5).join(', ') : ''}`);
  }
  console.log(`\n총계: ${grandPass}/${grandTotal}`);
  if (grandPass === grandTotal) console.log('🎉 전체 100% 통과!');
}

main().catch(console.error);
