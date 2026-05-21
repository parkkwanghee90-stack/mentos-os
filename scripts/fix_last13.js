import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DICT = path.join(__dirname, '../src/data/math_problem_texts.json');
const PUBLIC = path.join(__dirname, '../public/math_crops/(2)수학(상)기말');

const envFile = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
let apiKey = '';
for (const line of envFile.split('\n')) {
  if (line.startsWith('VITE_OPENAI_API_KEY=')) apiKey = line.split('=')[1].trim();
}

function toBase64(p) { return Buffer.from(fs.readFileSync(p)).toString('base64'); }
function isValid(t) { return t && t.trim().length > 0; }
function hasLongLine(t) { return t.split('\n').some(l => l.length > 120); }

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
    return `${c} ${val}`;
  });
  return body + n;
}

function safeParseJson(raw) {
  try { return JSON.parse(raw); } catch {}
  const m = raw.match(/"questionText"\s*:\s*"([\s\S]+?)(?<!\\)"\s*\}/);
  if (m) return { questionText: m[1] };
  throw new Error('parse failed');
}

async function extract(imgPath, unit) {
  const b64 = toBase64(imgPath);
  const prompt = `Extract Korean math problem (${unit}).
Return ONLY: {"questionText": "CONTENT"}
- Max line length: 70 chars
- Break at: 이다. 하자. 있다. 이고, 이며, 라 할 때,
- Options ①②③④⑤ each on own line, math in $...$
- Double backslashes: \\\\sqrt \\\\frac \\\\overline \\\\leq \\\\geq \\\\pm
No markdown.`;
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
    let c = data.choices[0].message.content.trim();
    if (c.startsWith('```')) c = c.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    return safeParseJson(c).questionText;
  } catch { return null; }
}

const TARGETS = [
  { crop: '직선의방정식4단계', key: '직선의방정식4단계', name: '직선4단계', files: ['009.webp'] },
  { crop: '원의방정식3단계', key: '원의방정식3단계', name: '원3단계', files: ['013.webp'] },
  { crop: '원의방정식4단계', key: '원의방정식4단계', name: '원4단계',
    files: ['013.webp','039.webp','049.webp','054.webp','064.webp','066.webp','067.webp','068.webp'] },
];

const pLimit = async (n) => { const { default: m } = await import('p-limit'); return m(n); };

async function main() {
  const dict = JSON.parse(fs.readFileSync(DICT, 'utf-8'));
  const limit = await pLimit(5);
  let fixed = 0;

  for (const { crop, key, name, files } of TARGETS) {
    console.log(`\n[${name}] ${files.length}개 처리...`);
    const tasks = files.map(file => limit(async () => {
      const imgPath = path.join(PUBLIC, crop, file);
      if (!fs.existsSync(imgPath)) { console.log(`  skip ${file}: 파일없음`); return; }
      let text = null;
      for (let i = 0; i < 3; i++) {
        text = await extract(imgPath, name);
        if (text && isValid(text)) break;
        if (i < 2) await new Promise(r => setTimeout(r, 700));
      }
      if (text && isValid(text)) {
        const processed = fixOptionMath(text);
        dict[key + '/' + file] = processed;
        fixed++;
        const max = Math.max(...processed.split('\n').map(l => l.length));
        console.log(`  ✓ ${file} max:${max}자${max > 120 ? ' ⚠' : ''}`);
      } else {
        console.log(`  ✗ ${file} 실패`);
      }
    }));
    await Promise.all(tasks);
    fs.writeFileSync(DICT, JSON.stringify(dict, null, 2), 'utf-8');
  }

  console.log(`\n총 ${fixed}개 수정`);

  // Final check
  const allFolders = [
    { crop: '직선의방정식4단계', key: '직선의방정식4단계', name: '직선4단계' },
    { crop: '원의방정식3단계', key: '원의방정식3단계', name: '원3단계' },
    { crop: '원의방정식4단계', key: '원의방정식4단계', name: '원4단계' },
  ];
  const dict2 = JSON.parse(fs.readFileSync(DICT, 'utf-8'));
  console.log('\n=== 최종 ===');
  for (const { crop, key, name } of allFolders) {
    const dir = path.join(PUBLIC, crop);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => /^\d+\.webp$/.test(f)).sort();
    let pass = 0; const fails = [];
    for (const file of files) {
      const t = dict2[key + '/' + file];
      if (!isValid(t)) { fails.push(file + '없음'); continue; }
      if (hasLongLine(t)) { fails.push(file + '긴줄'); continue; }
      pass++;
    }
    const ok = pass === files.length ? '✅' : '❌';
    console.log(`${ok} ${name}: ${pass}/${files.length}${fails.length ? ' | ' + fails.join(',') : ''}`);
  }
}

main().catch(console.error);
