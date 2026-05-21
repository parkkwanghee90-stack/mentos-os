/**
 * fix_remaining.js — 나머지 미해결 파일 최종 처리
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
function hasLongLine(text) { return text.split('\n').some(line => line.length > 120); }

function fixOptionMath(text) {
  if (!text) return text;
  const oi = text.search(/[①②③④⑤]/);
  if (oi === -1) return text;
  const body = text.slice(0, oi);
  const opts = text.slice(oi);
  let n = opts.replace(/([^\n])(①|②|③|④|⑤)/g, '$1\n$2');
  n = n.replace(/(①|②|③|④|⑤)\s*([^\n①②③④⑤]+)/g, (_, c, v) => {
    let val = v.trim();
    if (/\\[a-zA-Z]/.test(val) && !val.startsWith('$')) val = `$${val}$`;
    if (/[A-Za-z]?\([-\d., ]+\)/.test(val) && !val.startsWith('$')) val = `$${val}$`;
    return `${c} ${val}`;
  });
  return body + n;
}

async function extractWithBreaks(imgPath, unit) {
  const b64 = toBase64(imgPath);
  const prompt = `Extract this Korean math problem (${unit}).
Return ONLY: {"questionText": "CONTENT"}

LINE BREAK RULES (strict):
- Max line length: 60 characters per line
- Break after: "이다.", "하자.", "있다.", "이라 할 때," "이고," followed by next clause
- Break before: "이때", "선분", "삼각형", "직선", "원" when starting new clause
- Each option ①②③④⑤ on its own line
- Wrap option math in $: ② $\\\\sqrt{2}$ 
- Backslashes doubled in JSON: \\\\sqrt \\\\frac \\\\overline \\\\leq \\\\geq \\\\pm \\\\cdot

No markdown. Valid JSON only.`;
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

const REMAINING = [
  // 직선2단계 43번 긴줄
  { cropFolder: '(2)수학(상)기말/(6)직선의방정식 개념2단계(44)p19 1+1(쌍둥이)', keyPrefix: '(6)직선의방정식 개념2단계(44)p19 1+1(쌍둥이)', name: '직선2단계', files: ['043.webp'] },
  // 직선3단계 12,16,21,27,31번
  { cropFolder: '(2)수학(상)기말/직선의방정식3단계', keyPrefix: '직선의방정식3단계', name: '직선3단계',
    files: ['012.webp','016.webp','021.webp','027.webp','031.webp'] },
  // 직선4단계 6,8번 없음
  { cropFolder: '(2)수학(상)기말/직선의방정식4단계', keyPrefix: '직선의방정식4단계', name: '직선4단계',
    files: ['006.webp','008.webp'] },
  // 원3단계 13번
  { cropFolder: '(2)수학(상)기말/원의방정식3단계', keyPrefix: '원의방정식3단계', name: '원3단계', files: ['013.webp'] },
  // 원4단계 13,39,49,54,64번 + 나머지 확인
  { cropFolder: '(2)수학(상)기말/원의방정식4단계', keyPrefix: '원의방정식4단계', name: '원4단계',
    files: ['013.webp','039.webp','049.webp','054.webp','064.webp'] },
];

const pLimit = async (n) => { const { default: m } = await import('p-limit'); return m(n); };

async function main() {
  console.log('=== 나머지 미해결 파일 최종 처리 ===\n');
  const dict = JSON.parse(fs.readFileSync(DICT_JSON, 'utf-8'));
  const limit = await pLimit(5);
  let fixed = 0;

  for (const { cropFolder, keyPrefix, name, files } of REMAINING) {
    const folderPath = path.join(PUBLIC_DIR, 'math_crops', cropFolder);
    console.log(`\n[${name}] ${files.length}개...`);

    const tasks = files.map(file => limit(async () => {
      const key = `${keyPrefix}/${file}`;
      const imgPath = path.join(folderPath, file);
      const before = dict[key] || '';
      
      let text = null;
      for (let i = 0; i < 3; i++) {
        text = await extractWithBreaks(imgPath, name);
        if (text && isValid(text)) break;
        if (i < 2) await new Promise(r => setTimeout(r, 700));
      }
      
      if (text && isValid(text)) {
        const processed = fixOptionMath(text);
        dict[key] = processed;
        fixed++;
        const maxLine = Math.max(...processed.split('\n').map(l => l.length));
        const stillLong = maxLine > 120 ? ` ⚠여전히${maxLine}자` : '';
        console.log(`  ✓ ${file} (최대: ${maxLine}자)${stillLong}`);
      } else {
        console.log(`  ✗ ${file} 실패`);
      }
    }));

    await Promise.all(tasks);
    fs.writeFileSync(DICT_JSON, JSON.stringify(dict, null, 2), 'utf-8');
  }

  console.log(`\n총 ${fixed}개 처리`);

  // Final check
  const allFolders = [
    { keyPrefix: '(6)직선의방정식 개념2단계(44)p19 1+1(쌍둥이)', name: '직선2단계', count: 44 },
    { keyPrefix: '직선의방정식3단계', name: '직선3단계', count: 31 },
    { keyPrefix: '직선의방정식4단계', name: '직선4단계', count: 8 },
    { keyPrefix: '(7)원의방정식 개념2단계(54)p24 1+1(쌍둥이)', name: '원2단계', count: 54 },
    { keyPrefix: '원의방정식3단계', name: '원3단계', count: 28 },
    { keyPrefix: '원의방정식4단계', name: '원4단계', count: 92 },
  ];

  console.log('\n=== 최종 검수 ===');
  let gPass = 0, gTotal = 0;
  for (const { keyPrefix, name, count } of allFolders) {
    let pass = 0; const fails = [];
    for (let i = 1; i <= count; i++) {
      const key = `${keyPrefix}/${String(i).padStart(3,'0')}.webp`;
      const t = dict[key];
      if (!isValid(t)) { fails.push(`${i}없음`); continue; }
      if (hasLongLine(t)) { fails.push(`${i}긴줄`); continue; }
      pass++;
    }
    gPass += pass; gTotal += count;
    const ok = pass === count ? '✅' : '❌';
    console.log(`${ok} ${name}: ${pass}/${count}${fails.length ? ' | ' + fails.slice(0,6).join(',') : ''}`);
  }
  console.log(`\n최종: ${gPass}/${gTotal}`);
  if (gPass === gTotal) console.log('🎉🎉 전체 100% 완료!');
}

main().catch(console.error);
