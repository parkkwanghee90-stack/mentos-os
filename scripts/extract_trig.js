/**
 * extract_trig.js
 * 삼각함수 그래프 / 삼각함수 활용 2단계 문제 텍스트 추출 (KaTeX 렌더링용)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pLimit from 'p-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_CROP_DIR = path.join(__dirname, '../public/math_crops');
const DICT_FILE = path.join(__dirname, '../src/data/math_problem_texts.json');

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

async function extractText(imgPath) {
  const ext = path.extname(imgPath).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : 'image/webp';
  
  const images = [
    { type: 'image_url', image_url: { url: `data:${mimeType};base64,${toBase64(imgPath)}` } }
  ];

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
        messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, ...images] }],
        max_tokens: 600, temperature: 0.0
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    let c = data.choices[0].message.content.trim();
    if (c.startsWith('```')) c = c.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    return safeParse(c).questionText;
  } catch(e) { 
    return null; 
  }
}

const TARGET_DIRS = [
  '(5)수학1 중간/2단계/삼각함수그래프2단계',
  '(5)수학1 중간/2단계/삼각함수활용2단계'
];

async function main() {
  const dict = JSON.parse(fs.readFileSync(DICT_FILE, 'utf-8'));
  const tasks = [];
  let totalFound = 0;
  
  for (const dirPath of TARGET_DIRS) {
    const fullDir = path.join(BASE_CROP_DIR, dirPath);
    if (!fs.existsSync(fullDir)) continue;
    
    const unitFolder = dirPath.split('/').pop();
    
    const files = fs.readdirSync(fullDir);
    for (const file of files) {
      if ((file.endsWith('.webp') || file.endsWith('.png')) && !file.match(/a\.(webp|png)$/i)) {
        totalFound++;
        const key = `${unitFolder}/${file}`;
        
        if (!dict[key]) {
          tasks.push({
            key,
            imgPath: path.join(fullDir, file),
            unitFolder
          });
        }
      }
    }
  }
  
  console.log(`전체 문제 수: ${totalFound}`);
  console.log(`추출 대상 수: ${tasks.length}`);
  
  if (tasks.length === 0) {
    console.log('✅ 모든 문제 텍스트 추출 완료됨!');
    return;
  }
  
  const limit = pLimit(5); 
  let processed = 0;
  let saved = 0;
  
  const promises = tasks.map(task => limit(async () => {
    let text = null;
    for (let i = 0; i < 3; i++) {
      text = await extractText(task.imgPath);
      if (text) break;
      await new Promise(r => setTimeout(r, 1000));
    }
    
    processed++;
    if (text) {
      // Reload dict before saving to avoid overwriting other process's work!
      const currentDict = JSON.parse(fs.readFileSync(DICT_FILE, 'utf-8'));
      currentDict[task.key] = text;
      fs.writeFileSync(DICT_FILE, JSON.stringify(currentDict, null, 2), 'utf-8');
      saved++;
      process.stdout.write(`\r[TRIG] ✓ [${processed}/${tasks.length}] ${task.key}`);
    } else {
      process.stdout.write(`\r[TRIG] ✗ [${processed}/${tasks.length}] 실패: ${task.key}`);
    }
  }));
  
  await Promise.all(promises);
  console.log(`\n\n완료: ${saved}/${tasks.length} 추출 및 저장.`);
}

main().catch(console.error);
