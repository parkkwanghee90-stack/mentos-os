import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '../public');
const LESSON_JSON = path.join(__dirname, '../src/data/lessons/math/h_math1/week_1/lesson_01.json');
const DICT_JSON = path.join(__dirname, '../src/data/math_problem_texts.json');
const FOLDER = '(2)수학(상)기말/(5)점과좌표 개념2단계(44)p17 1+1(쌍둥이)';
const FOLDER_KEY_PREFIX = '(5)점과좌표 개념2단계(44)p17 1+1(쌍둥이)';

const envFile = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
let apiKey = '';
for (const line of envFile.split('\n')) {
  if (line.startsWith('VITE_OPENAI_API_KEY=')) apiKey = line.split('=')[1].trim();
}
if (!apiKey) { console.error('No API key'); process.exit(1); }

function toBase64(p) { return Buffer.from(fs.readFileSync(p)).toString('base64'); }

// Safe JSON parser that handles LaTeX double-backslash escaping issues
function safeParseJson(raw) {
  // Try direct parse first
  try { return JSON.parse(raw); } catch(e1) {}
  
  // Strategy: Extract the questionText value manually using regex
  // This avoids the issue where GPT outputs \sqrt instead of \\sqrt inside JSON
  const match = raw.match(/"questionText"\s*:\s*"([\s\S]+?)"\s*\}/);
  if (match) {
    // The captured content has raw backslashes from GPT response
    // We need to properly escape them for the JS string
    let text = match[1];
    // Replace unescaped backslashes with double backslash
    // but be careful not to double-escape already-escaped ones
    // The raw string from the regex already has single \ for LaTeX commands
    return { questionText: text };
  }
  
  // Strategy 2: Fix the JSON string by normalizing backslashes
  try {
    // Remove outer quotes and fix backslashes within the value
    let fixed = raw;
    // Find the value between quotes after questionText:
    fixed = fixed.replace(/"questionText"\s*:\s*"([\s\S]*?)(?<!\\)"\s*\}/, (_, val) => {
      // Properly escape backslashes in the LaTeX value
      const escaped = val.replace(/\\(?!["\\\/bfnrtu])/g, '\\\\');
      return `"questionText": "${escaped}"}`;
    });
    return JSON.parse(fixed);
  } catch(e2) {}
  
  throw new Error('All parse strategies failed');
}

async function extractText(imgPath) {
  const b64 = toBase64(imgPath);
  const prompt = `You are extracting a Korean math problem from an image.

TASK: Return ONLY this exact JSON format with no other text:
{"questionText": "CONTENT_HERE"}

CONTENT rules:
- Korean text goes outside math delimiters as normal text
- Inline math: $expression$ (use for variables, numbers, coordinates)
- Block math: $$expression$$ (use for full equations on their own line)  
- In JSON strings, backslashes MUST be doubled: \\\\sqrt{2} \\\\frac{1}{2} \\\\overline{AB}
- Multiple choice options each on new line: \\n① value \\n② value \\n③ value \\n④ value \\n⑤ value
- NO markdown, NO codeblocks, NO extra fields

Example output:
{"questionText": "두 점 $A(1,3)$, $B(3,5)$에서 같은 거리에 있는 점 $P$의 좌표가 $(a,1)$이다.\\n\\n① $\\\\sqrt{2}$ \\n② $\\\\sqrt{5}$ \\n③ $2\\\\sqrt{2}$ \\n④ $4$ \\n⑤ $5$"}`;

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
        max_tokens: 1000,
        temperature: 0.0
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    let content = data.choices[0].message.content.trim();
    // Strip any accidental markdown
    if (content.startsWith('```')) content = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    
    const parsed = safeParseJson(content);
    return parsed.questionText || null;
  } catch (e) {
    console.error(`  ✗ ${e.message.substring(0, 100)}`);
    return null;
  }
}

// Check if text renders properly (no obvious KaTeX breaks)
function isValid(text) {
  if (!text || text.trim() === '') return false;
  // Must contain Korean text
  if (!/[가-힣]/.test(text)) return false;
  // Check for unmatched $ (excluding $$)
  const cleaned = text.replace(/\$\$[^$]*\$\$/g, '');
  const singles = (cleaned.match(/(?<!\$)\$(?!\$)/g) || []).length;
  if (singles % 2 !== 0) return false;
  return true;
}

const pLimit = async (n) => { const { default: m } = await import('p-limit'); return m(n); };

async function main() {
  console.log('=== 점과좌표 2단계 전수 재추출 (강화 파서) ===\n');

  let dict = {};
  if (fs.existsSync(DICT_JSON)) dict = JSON.parse(fs.readFileSync(DICT_JSON, 'utf-8'));
  const lesson = JSON.parse(fs.readFileSync(LESSON_JSON, 'utf-8'));
  const problems = lesson.core.problems;

  const folderPath = path.join(PUBLIC_DIR, 'math_crops', FOLDER);
  const allFiles = fs.readdirSync(folderPath)
    .filter(f => f.match(/^\d+\.webp$/))
    .sort();

  console.log(`총 ${allFiles.length}개 문제 이미지 처리 시작\n`);

  const limit = await pLimit(4);
  let updatedCount = 0;

  const tasks = allFiles.map(file => limit(async () => {
    const num = parseInt(file.replace('.webp', ''), 10);
    const dictKey = `${FOLDER_KEY_PREFIX}/${file}`;
    const imgPath = path.join(folderPath, file);
    
    const existing = dict[dictKey];
    if (existing && isValid(existing)) {
      process.stdout.write(`✓ ${file}\n`);
      return;
    }
    
    process.stdout.write(`⟳ ${file} 재추출 중...\n`);
    
    // Retry up to 3 times
    let text = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      text = await extractText(imgPath);
      if (text && isValid(text)) break;
      if (attempt < 3) {
        process.stdout.write(`  재시도 ${attempt}...\n`);
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    
    if (text && isValid(text)) {
      dict[dictKey] = text;
      const prob = problems.find(p => p.number === num);
      if (prob) prob.questionText = text;
      updatedCount++;
      process.stdout.write(`  ✓ ${file} 완료\n`);
    } else {
      process.stdout.write(`  ✗ ${file} 실패 (3회 시도)\n`);
    }
  }));

  await Promise.all(tasks);

  // Save
  fs.writeFileSync(DICT_JSON, JSON.stringify(dict, null, 2), 'utf-8');
  fs.writeFileSync(LESSON_JSON, JSON.stringify(lesson, null, 2), 'utf-8');
  console.log(`\n✓ ${updatedCount}개 업데이트됨`);

  // Final validation report
  console.log('\n=== 최종 검수 ===');
  let pass = 0, fail = 0;
  for (const file of allFiles) {
    const key = `${FOLDER_KEY_PREFIX}/${file}`;
    const text = dict[key];
    if (isValid(text)) {
      pass++;
    } else {
      console.log(`  ✗ ${file}: ${text ? '유효성 실패' : '없음'}`);
      fail++;
    }
  }
  console.log(`\n✓ 통과: ${pass}/${allFiles.length}`);
  if (fail === 0) console.log('🎉 전체 44문제 100% 통과!');
  else console.log(`✗ 실패: ${fail}개 남음`);
}

main().catch(console.error);
