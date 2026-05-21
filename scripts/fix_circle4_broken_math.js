/**
 * fix_circle4_broken_math.js
 * 원의방정식4단계 문제 텍스트 전수 검사
 * 1. $ 없이 노출된 LaTeX 명령어 검출 → 재추출
 * 2. 전체 문제 단락 중 \overline, \sqrt 등이 $ 밖에 있는 경우 수정
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DICT = path.join(__dirname, '../src/data/math_problem_texts.json');
const CROP_DIR = path.join(__dirname, '../public/math_crops/(2)수학(상)기말/원의방정식4단계');

const envFile = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
let apiKey = '';
for (const line of envFile.split('\n')) {
  if (line.startsWith('VITE_OPENAI_API_KEY=')) apiKey = line.split('=')[1].trim();
}

function toBase64(p) { return Buffer.from(fs.readFileSync(p)).toString('base64'); }

function safeParse(raw) {
  try { return JSON.parse(raw); } catch {}
  try { return JSON.parse(raw.replace(/(?<!\\)\\(?!["\\\/bfnrtu])/g, '\\\\')); } catch {}
  const s = raw.indexOf('{'), e = raw.lastIndexOf('}');
  if (s >= 0 && e > s) {
    try { return JSON.parse(raw.slice(s, e+1)); } catch {}
    try { return JSON.parse(raw.slice(s, e+1).replace(/(?<!\\)\\(?!["\\\/bfnrtu])/g, '\\\\')); } catch {}
  }
  throw new Error('parse failed');
}

// 수식이 $ 밖에 노출됐는지 검사
function hasNakedMath(text) {
  if (!text) return false;
  // 줄별로 체크
  return text.split('\n').some(line => {
    // 보기 줄 제외
    if (/^[①②③④⑤]/.test(line.trim())) return false;
    // $ 없는데 \overline, \sqrt, \frac 등 있으면 문제
    const hasMathCmd = /\\(overline|sqrt|frac|leq|geq|cdot|pi|times|div|pm|neq|approx|infty|theta|alpha|beta)\b/.test(line);
    const hasDollar = /\$/.test(line);
    return hasMathCmd && !hasDollar;
  });
}

async function reextract(id, problemText) {
  const imgPath = path.join(CROP_DIR, `${id}.webp`);
  const ansPath = path.join(CROP_DIR, `${id}a.webp`);
  if (!fs.existsSync(imgPath)) return null;

  const imgs = [
    { type: 'image_url', image_url: { url: `data:image/webp;base64,${toBase64(imgPath)}` } }
  ];
  if (fs.existsSync(ansPath)) {
    imgs.push({ type: 'image_url', image_url: { url: `data:image/webp;base64,${toBase64(ansPath)}` } });
  }

  const prompt = `Extract this Korean math problem text accurately.
Return ONLY: {"questionText": "CONTENT"}

CRITICAL RULES:
- ALL math expressions MUST be wrapped in $...$: e.g. $\\\\overline{AP}^2$
- Inline math: $expr$, Block math: $$expr$$
- Backslashes doubled in JSON: \\\\overline \\\\sqrt \\\\frac \\\\pi \\\\leq \\\\geq
- Korean text stays outside $ delimiters
- Each option ①②③④⑤ on its own line
- Math in options must be in $: ① $\\\\pi$
- No naked LaTeX commands outside $ delimiters
- No markdown code blocks in response`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, ...imgs] }],
        max_tokens: 600, temperature: 0.0
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    let c = data.choices[0].message.content.trim();
    if (c.startsWith('```')) c = c.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    return safeParse(c).questionText;
  } catch(e) { console.error(`  ${e.message.substring(0,60)}`); return null; }
}

const pLimit = async (n) => { const { default: m } = await import('p-limit'); return m(n); };

async function main() {
  const dict = JSON.parse(fs.readFileSync(DICT, 'utf-8'));
  const cropFiles = fs.readdirSync(CROP_DIR)
    .filter(f => f.match(/^\d+\.webp$/))
    .sort();

  console.log('=== 원의방정식4단계 수식 깨짐 전수 검사 ===\n');

  // Find all broken
  const broken = [];
  for (const file of cropFiles) {
    const key = `원의방정식4단계/${file}`;
    const text = dict[key] || '';
    if (hasNakedMath(text)) {
      const id = file.replace('.webp', '');
      broken.push({ id, file, key, text });
      // Show the problematic lines
      const badLines = text.split('\n').filter(line => {
        if (/^[①②③④⑤]/.test(line.trim())) return false;
        return /\\(overline|sqrt|frac|leq|geq|cdot|pi|times|pm)\b/.test(line) && !/\$/.test(line);
      });
      console.log(`✗ ${id}번: ${badLines.slice(0,2).join(' | ').substring(0,80)}`);
    }
  }

  if (broken.length === 0) {
    console.log('✅ 수식 깨짐 없음');
    return;
  }

  console.log(`\n총 ${broken.length}개 문제 재추출 시작...\n`);

  const limit = await pLimit(4);
  let fixed = 0;

  const tasks = broken.map(({ id, file, key }) => limit(async () => {
    let text = null;
    for (let i = 0; i < 3; i++) {
      text = await reextract(id);
      if (text && !hasNakedMath(text)) break;
      if (i < 2) await new Promise(r => setTimeout(r, 700));
    }
    if (text && text.trim()) {
      dict[key] = text;
      fixed++;
      const stillBroken = hasNakedMath(text);
      console.log(`  ${stillBroken ? '⚠' : '✓'} ${id}번 ${stillBroken ? '(잔류)' : '수정완료'}`);
    } else {
      console.log(`  ✗ ${id}번 실패`);
    }
  }));

  await Promise.all(tasks);
  fs.writeFileSync(DICT, JSON.stringify(dict, null, 2), 'utf-8');

  console.log(`\n수정: ${fixed}/${broken.length}`);

  // Final check
  const remain = cropFiles.filter(f => hasNakedMath(dict[`원의방정식4단계/${f}`] || ''));
  if (remain.length === 0) {
    console.log('🎉 전체 원의방정식4단계 수식 정상!');
  } else {
    console.log(`⚠ 잔류 ${remain.length}개: ${remain.map(f=>f.replace('.webp','')).join(', ')}`);
  }
}

main().catch(console.error);
