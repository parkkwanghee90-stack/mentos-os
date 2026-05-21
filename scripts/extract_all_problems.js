/**
 * extract_all_problems.js
 * 고차방정식 ~ 순열조합 전체 단원 문제 텍스트 추출 (KaTeX 렌더링용)
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

// 1+1 쌍둥이 등도 포함
const TARGET_DIRS = [
  '(2)수학(상)기말/(1)일차부등식 개념2단계(26) 1+1(쌍둥이)',
  '(2)수학(상)기말/(2)이차부등식 개념2단계(42)p21 1+1(쌍둥이)',
  '(2)수학(상)기말/(3)경우의수2단계',
  '(2)수학(상)기말/(4)행렬2단계',
  '(2)수학(상)기말/(8)도형의이동 개념2단계(46)p21 1+1(쌍둥이)',
  '(2)수학(상)기말/경우의수3단계',
  '(2)수학(상)기말/경우의수4단계',
  '(2)수학(상)기말/고차방정식2단계',
  '(2)수학(상)기말/고차방정식3단계',
  '(2)수학(상)기말/고차방정식4단계',
  '(2)수학(상)기말/도형의이동3단계',
  '(2)수학(상)기말/도형의이동4단계',
  '(2)수학(상)기말/이차부등식3단계',
  '(2)수학(상)기말/이차부등식4단계',
  '(2)수학(상)기말/일차부등식3단계',
  '(2)수학(상)기말/일차부등식4단계',
  '(2)수학(상)기말/행렬3단계',
  '(2)수학(상)기말/행렬4단계',

];

async function main() {
  // Load existing dictionary
  const dict = JSON.parse(fs.readFileSync(DICT_FILE, 'utf-8'));
  
  // Find all problem images to process
  const tasks = [];
  let totalFound = 0;
  
  for (const dirPath of TARGET_DIRS) {
    const fullDir = path.join(BASE_CROP_DIR, dirPath);
    if (!fs.existsSync(fullDir)) continue;
    
    // Only get the short unit name to use as key, handling 1+1(쌍둥이) or numbers
    // Actually, HintPlayerRouter expects the key to just be `unitName/filename` where unitName is from classroom
    // In our system, the unitName in lesson JSON matches exactly the folder name in math_crops,
    // OR it strips the numbering. Let's just use the folder name as the first part of the key.
    const unitFolder = dirPath.split('/').pop();
    
    const files = fs.readdirSync(fullDir);
    for (const file of files) {
      if ((file.endsWith('.webp') || file.endsWith('.png')) && !file.match(/a\.(webp|png)$/i)) {
        totalFound++;
        const key = `${unitFolder}/${file}`;
        
        // Skip if we already have it
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
  
  const limit = pLimit(5); // Process 5 concurrently to speed up
  let processed = 0;
  let saved = 0;
  
  // Create a backup of dict
  fs.writeFileSync(`${DICT_FILE}.backup`, JSON.stringify(dict, null, 2));

  // Process in batches and save frequently
  const promises = tasks.map(task => limit(async () => {
    let text = null;
    for (let i = 0; i < 3; i++) {
      text = await extractText(task.imgPath);
      if (text) break;
      await new Promise(r => setTimeout(r, 1000));
    }
    
    processed++;
    if (text) {
      dict[task.key] = text;
      saved++;
      process.stdout.write(`\r✓ [${processed}/${tasks.length}] ${task.key}`);
    } else {
      process.stdout.write(`\r✗ [${processed}/${tasks.length}] 실패: ${task.key}`);
    }
    
    // Save every 10 successful extractions
    if (saved > 0 && saved % 10 === 0) {
      fs.writeFileSync(DICT_FILE, JSON.stringify(dict, null, 2), 'utf-8');
    }
  }));
  
  await Promise.all(promises);
  fs.writeFileSync(DICT_FILE, JSON.stringify(dict, null, 2), 'utf-8');
  console.log(`\n\n완료: ${saved}/${tasks.length} 추출 및 저장.`);
}

main().catch(console.error);
