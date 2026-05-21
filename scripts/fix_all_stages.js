/**
 * fix_all_stages.js
 * 점과좌표 2,3,4단계 + 직선의방정식 2,3,4단계 + 원의방정식 2,3,4단계
 * 전체 문제 이미지 텍스트 추출 + 보기 수식 래핑 + 저장
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
if (!apiKey) { console.error('No API key'); process.exit(1); }

function toBase64(p) { return Buffer.from(fs.readFileSync(p)).toString('base64'); }

function safeParseJson(raw) {
  try { return JSON.parse(raw); } catch(e1) {}
  const match = raw.match(/"questionText"\s*:\s*"([\s\S]+?)(?<!\\)"\s*\}/);
  if (match) return { questionText: match[1] };
  throw new Error('Parse failed');
}

async function extractText(imgPath, folderName) {
  const b64 = toBase64(imgPath);
  const prompt = `You are extracting a Korean high school math problem (${folderName} unit).
Return ONLY this JSON: {"questionText": "CONTENT"}

Rules:
- Korean text outside math delimiters
- Inline math: $expression$
- Block math: $$expression$$  
- In JSON strings, backslashes MUST be doubled: \\\\sqrt \\\\frac \\\\overline \\\\left \\\\right
- Each multiple choice option (①②③④⑤) on its own line starting with the circled number
- If option contains math expression like \\sqrt{2}, wrap it: $\\\\sqrt{2}$
- NO markdown blocks`;

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
        max_tokens: 900, temperature: 0.0
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    let content = data.choices[0].message.content.trim();
    if (content.startsWith('```')) content = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    return safeParseJson(content).questionText;
  } catch(e) {
    return null;
  }
}

// Ensure each option's math is wrapped in $
function fixOptionMath(text) {
  if (!text) return text;
  const oi = text.search(/[①②③④⑤]/);
  if (oi === -1) return text;
  const body = text.slice(0, oi);
  const opts = text.slice(oi);
  const fixedOpts = opts.replace(/(①|②|③|④|⑤) ([^\n①②③④⑤]+)/g, (_, circle, val) => {
    let v = val.trim();
    if (/\\[a-zA-Z]/.test(v) && !v.startsWith('$')) v = `$${v}$`;
    if (/[A-Za-z]?\([-\d., ]+\)/.test(v) && !v.startsWith('$')) v = `$${v}$`;
    return `${circle} ${v}`;
  });
  // Ensure each option on its own line
  const normalizedOpts = fixedOpts.replace(/([^\n])(①|②|③|④|⑤)/g, '$1\n$2');
  return body + normalizedOpts;
}

function isValid(t) {
  if (!t || t.trim() === '') return false;
  return /[가-힣]/.test(t) || /\$/.test(t);
}

const pLimit = async (n) => { const { default: m } = await import('p-limit'); return m(n); };

const TARGET_FOLDERS = [
  // 점과좌표 (3단계, 4단계만 - 2단계는 완료)
  { cropFolder: '(2)수학(상)기말/점과좌표3단계', keyPrefix: '점과좌표3단계' },
  { cropFolder: '(2)수학(상)기말/점과좌표4단계', keyPrefix: '점과좌표4단계' },
  // 직선의방정식
  { cropFolder: '(2)수학(상)기말/(6)직선의방정식 개념2단계(44)p19 1+1(쌍둥이)', keyPrefix: '(6)직선의방정식 개념2단계(44)p19 1+1(쌍둥이)' },
  { cropFolder: '(2)수학(상)기말/직선의방정식3단계', keyPrefix: '직선의방정식3단계' },
  { cropFolder: '(2)수학(상)기말/직선의방정식4단계', keyPrefix: '직선의방정식4단계' },
  // 원의방정식
  { cropFolder: '(2)수학(상)기말/(7)원의방정식 개념2단계(54)p24 1+1(쌍둥이)', keyPrefix: '(7)원의방정식 개념2단계(54)p24 1+1(쌍둥이)' },
  { cropFolder: '(2)수학(상)기말/원의방정식3단계', keyPrefix: '원의방정식3단계' },
  { cropFolder: '(2)수학(상)기말/원의방정식4단계', keyPrefix: '원의방정식4단계' },
];

async function main() {
  console.log('=== 점과좌표/직선/원 전단계 전수 추출 ===\n');
  const dict = JSON.parse(fs.readFileSync(DICT_JSON, 'utf-8'));
  const limit = await pLimit(5);
  
  for (const { cropFolder, keyPrefix } of TARGET_FOLDERS) {
    const folderPath = path.join(PUBLIC_DIR, 'math_crops', cropFolder);
    if (!fs.existsSync(folderPath)) {
      console.log(`⚠ 폴더 없음: ${cropFolder}`);
      continue;
    }
    
    const files = fs.readdirSync(folderPath)
      .filter(f => f.match(/^\d+\.webp$/))
      .sort();
    
    console.log(`\n[${keyPrefix}] ${files.length}개 문제 처리 중...`);
    
    const tasks = files.map(file => limit(async () => {
      const dictKey = `${keyPrefix}/${file}`;
      const existing = dict[dictKey];
      
      if (existing && isValid(existing)) {
        // Apply fixOptionMath even on existing valid entries
        const fixed = fixOptionMath(existing);
        if (fixed !== existing) {
          dict[dictKey] = fixed;
          process.stdout.write(`  fix ${file}\n`);
        }
        return;
      }
      
      const imgPath = path.join(folderPath, file);
      let text = null;
      for (let i = 0; i < 3; i++) {
        text = await extractText(imgPath, keyPrefix);
        if (text && isValid(text)) break;
        if (i < 2) await new Promise(r => setTimeout(r, 800));
      }
      
      if (text && isValid(text)) {
        dict[dictKey] = fixOptionMath(text);
        process.stdout.write(`  ✓ ${file}\n`);
      } else {
        process.stdout.write(`  ✗ ${file} 실패\n`);
      }
    }));
    
    await Promise.all(tasks);
    
    // Save after each folder
    fs.writeFileSync(DICT_JSON, JSON.stringify(dict, null, 2), 'utf-8');
    
    // Quick validation
    const total = files.length;
    const passed = files.filter(f => isValid(dict[`${keyPrefix}/${f}`])).length;
    console.log(`  → ${passed}/${total} 통과`);
  }
  
  console.log('\n=== 전체 완료 ===');
}

main().catch(console.error);
