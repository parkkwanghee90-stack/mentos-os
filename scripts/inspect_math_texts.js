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

function hasKatexError(text) {
  // Count $ and $$ to see if there's an odd number of delimiters, 
  // which implies broken formulas.
  let cleanText = text.replace(/\\\$/g, ''); // ignore escaped dollar signs
  
  // A simple heuristic: check if math block syntax has matching pairs.
  const inlineMatches = cleanText.match(/\$/g);
  if (inlineMatches && inlineMatches.length % 2 !== 0) return true;
  return false;
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
- Ensure pairs of KaTeX delimiters ($...$) are matched properly. NO broken formulas.
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

const pLimit = async (n) => { const { default: m } = await import('p-limit'); return m(n); };

async function main() {
  console.log('=== 수1 수학 문제 검수: 줄바꿈 및 수식 깨짐 방지 ===\n');
  const dict = JSON.parse(fs.readFileSync(DICT_JSON, 'utf-8'));
  const limit = await pLimit(5);
  let totalFixed = 0;

  const targetFolders = [
    { base: '(5)수학1 중간/2단계', name: '지수2단계', alias: '지수2단계' },
    { base: '(5)수학1 중간/2단계', name: '로그2단계', alias: '로그2단계' },
    { base: '(5)수학1 중간/2단계', name: '지수함수2단계', alias: '지수함수2단계' },
    { base: '(5)수학1 중간/2단계', name: '로그함수2단계', alias: '로그함수2단계' },
    { base: '(5)수학1 중간/2단계', name: '삼각함수성질2단계', alias: '삼각함수성질2단계' },
    { base: '(5)수학1 중간/2단계', name: '삼각함수그래프2단계', alias: '삼각함수그래프2단계' },

    { base: '(5)수학1 중간/3단계', name: '지수3단계', alias: '지수3단계' },
    { base: '(5)수학1 중간/3단계', name: '로그3단계', alias: '로그3단계' },
    { base: '(5)수학1 중간/3단계', name: '지수함수3단계', alias: '지수함수3단계' },
    { base: '(5)수학1 중간/3단계', name: '로그함수3단계', alias: '로그함수3단계' },
    { base: '(5)수학1 중간/3단계', name: '삼각함수3단계', alias: '삼각함수3단계' },
    { base: '(5)수학1 중간/3단계', name: '삼각함수그래프3단계', alias: '삼각함수그래프3단계' },

    { base: '(5)수학1 중간/4단계', name: '지수로그4단계', alias: '지수로그4단계' },
    { base: '(5)수학1 중간/4단계', name: '지수로그함수4단계', alias: '지수로그함수4단계' },
    { base: '(5)수학1 중간/4단계', name: '삼각함수그래프', alias: '삼각함수그래프' }
  ];

  for (const { base, name, alias } of targetFolders) {
    const folderPath = path.join(PUBLIC_DIR, 'math_crops', base, name);
    if (!fs.existsSync(folderPath)) continue;

    console.log(`\n[${alias}] 폴더 검수 중...`);
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.webp'));

    let toFix = [];
    for (const file of files) {
      const key = `${alias}/${file}`;
      const text = dict[key];
      if (!isValid(text) || hasLongLine(text) || hasKatexError(text)) {
        toFix.push({ file, key, text });
      }
    }

    if (toFix.length === 0) {
      console.log(`  -> 완벽합니다! (문제 없음)`);
      continue;
    }

    console.log(`  -> ${toFix.length}개 문제 발견. 재추출 및 자동 교정 진행 중...`);

    const tasks = toFix.map(({ file, key, text }) => limit(async () => {
      const imgPath = path.join(folderPath, file);
      
      let extracted = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        extracted = await extractWithBreaks(imgPath, alias);
        if (extracted && isValid(extracted)) break;
        if (attempt < 3) await new Promise(r => setTimeout(r, 800));
      }

      if (extracted && isValid(extracted)) {
        const fixed = fixOptionMath(extracted);
        dict[key] = fixed;
        totalFixed++;
        console.log(`    ✓ ${file} 교정 완료`);
      } else {
        console.log(`    ✗ ${file} 재추출 실패`);
      }
    }));

    await Promise.all(tasks);
    fs.writeFileSync(DICT_JSON, JSON.stringify(dict, null, 2), 'utf-8');
  }

  console.log(`\n=== 검수 및 자동 교정 완료. 총 ${totalFixed}개 교정됨 ===`);
}

main().catch(console.error);
