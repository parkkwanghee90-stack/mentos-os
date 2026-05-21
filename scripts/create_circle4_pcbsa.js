/**
 * create_circle4_pcbsa.js
 * 원의방정식 4단계 PCBSA 힌트 재생성
 * - API: 이미지 읽기 (눈 역할)
 * - 나(모델): PCBSA 구조, 수학 계산, 정밀 좌표 직접 작성
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CROP_DIR = path.join(__dirname, '../public/math_crops/(2)수학(상)기말/원의방정식4단계');
const HINT_DIR = path.join(__dirname, '../public/math_hints/원의방정식4단계');
const TEXTS = path.join(__dirname, '../src/data/math_problem_texts.json');

if (!fs.existsSync(HINT_DIR)) fs.mkdirSync(HINT_DIR, { recursive: true });

const envFile = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
let apiKey = '';
for (const line of envFile.split('\n')) {
  if (line.startsWith('VITE_OPENAI_API_KEY=')) apiKey = line.split('=')[1].trim();
}

function toBase64(p) { return Buffer.from(fs.readFileSync(p)).toString('base64'); }

// Read problem+solution image and produce strict PCBSA JSON
async function generatePCBSA(problemImgPath, solutionImgPath, problemId, problemText) {
  const problemB64 = toBase64(problemImgPath);
  const solutionB64 = fs.existsSync(solutionImgPath) ? toBase64(solutionImgPath) : null;

  const images = [
    { type: 'image_url', image_url: { url: `data:image/webp;base64,${problemB64}` } }
  ];
  if (solutionB64) {
    images.push({ type: 'image_url', image_url: { url: `data:image/webp;base64,${solutionB64}` } });
  }

  const prompt = `You are an elite Korean math teacher creating a PCBSA structured geometry animation hint.

Problem: ${problemText || '이미지 참조'}
${solutionB64 ? 'I also provide the solution image. Use it to understand the exact solving method.' : ''}

Create a PCBSA-structured JSON hint following this EXACT format:

{
  "layer": "render",
  "id": "${problemId}",
  "title": "원의 방정식 4단계",
  "type": "geometry",
  "base_figure": {
    "preset": "custom",
    "objects": [
      { "type": "axes" },
      // REQUIRED: Add the EXACT circle from the problem with CORRECT center and radius
      // e.g. for (x-2)^2 + y^2 = 4: { "type": "circle", "x": 2, "y": 0, "r": 2, "color": "#3b82f6" }
      // Add the exact external point A
      // e.g. { "type": "point", "x": -1, "y": 4, "label": "A", "color": "#f87171" }
    ]
  },
  "overlay_steps": [
    {
      "step": 1,
      "label": "P (구하는 것)",
      "label_text": "무엇을 구해야 하는지 파악합니다.",
      "latex": "State exactly WHAT to find using Korean + LaTeX",
      "objects": []
    },
    {
      "step": 2,
      "label": "C (주어진 조건)",
      "label_text": "주어진 조건을 정리합니다.",
      "latex": "List ALL given conditions with exact numbers",
      "objects": [
        // Highlight the circle and point A with exact coordinates
      ]
    },
    {
      "step": 3,
      "label": "B (배경지식)",
      "label_text": "핵심 공식을 떠올립니다.",
      "latex": "FORMULA: 원의 중심 C에서 외부 점 A까지 거리 AC를 구한 후,\\n원의 반지름 r을 이용하여 AP_{min} = AC - r, AP_{max} = AC + r",
      "objects": [
        // Draw line from A to center C
        { "type": "line", "points": [[Ax, Ay], [Cx, Cy]], "color": "#f59e0b", "dashed": true }
      ]
    },
    {
      "step": 4,
      "label": "S1 (풀이 1단계)",
      "label_text": "AC 거리를 계산합니다.",
      "latex": "AC = \\\\sqrt{(Cx-Ax)^2 + (Cy-Ay)^2} = EXACT_VALUE",
      "objects": [
        { "type": "line", "points": [[Ax, Ay], [Cx, Cy]], "color": "#f59e0b" }
      ]
    },
    {
      "step": 5,
      "label": "S2 (풀이 2단계)",
      "label_text": "AP의 최솟값과 최댓값을 구합니다.",
      "latex": "AP_{min} = AC - r = EXACT, AP_{max} = AC + r = EXACT",
      "objects": [
        // Draw P_min and P_max points on the circle at correct positions
        { "type": "point", "x": P_min_x, "y": P_min_y, "label": "P_{min}", "color": "#10b981" },
        { "type": "point", "x": P_max_x, "y": P_max_y, "label": "P_{max}", "color": "#ef4444" }
      ]
    },
    {
      "step": 6,
      "label": "A (정답)",
      "label_text": "정수인 AP의 개수를 셉니다.",
      "latex": "AP_{min} \\\\leq AP \\\\leq AP_{max} 중 정수 AP의 개수 = FINAL_ANSWER",
      "objects": []
    }
  ],
  "viewBox": {
    "x": [appropriate_range],
    "y": [appropriate_range]
  }
}

CRITICAL RULES:
1. PCBSA structure: P(구하는 것) → C(주어진 조건) → B(배경지식) → S1,S2,...(풀이) → A(정답)
2. ALL coordinates MUST be mathematically EXACT. Calculate them yourself:
   - Extract circle center (Cx, Cy) and radius r from the equation
   - P_min is on the line segment AC at distance r from C (toward A)
   - P_max is on the ray from C through A at distance r from C (away from A)
   - P_min_x = Cx + r*(Ax-Cx)/AC, P_min_y = Cy + r*(Ay-Cy)/AC
   - P_max_x = Cx - r*(Ax-Cx)/AC, P_max_y = Cy - r*(Ay-Cy)/AC
3. Set viewBox to fit all objects with 20% padding
4. Write latex in Korean Korean except math symbols; backslashes doubled in JSON
5. Return ONLY valid JSON. No markdown blocks.`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, ...images] }],
        max_tokens: 2000,
        temperature: 0.1
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    let content = data.choices[0].message.content.trim();
    if (content.startsWith('```')) content = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    
    // Safe parse with backslash fixup
    let parsed;
    try { parsed = JSON.parse(content); }
    catch {
      const fixed = content.replace(/(?<!\\)\\(?!["\\\/bfnrtu])/g, '\\\\');
      parsed = JSON.parse(fixed);
    }
    return parsed;
  } catch(e) {
    console.error(`  ✗ ${problemId}: ${e.message.substring(0, 80)}`);
    return null;
  }
}

// Validate that hint has proper PCBSA structure
function validatePCBSA(hint) {
  if (!hint) return false;
  const steps = hint.overlay_steps || [];
  if (steps.length < 4) return false;
  
  // Must have P, C, B, S, A labels
  const labels = steps.map(s => s.label || '');
  const hasP = labels.some(l => l.includes('P'));
  const hasC = labels.some(l => l.includes('C'));
  const hasB = labels.some(l => l.includes('B'));
  const hasA = labels.some(l => l.includes('A'));
  const hasCircle = (hint.base_figure?.objects || []).some(o => o.type === 'circle');
  
  return hasP && hasC && hasB && hasA && hasCircle;
}

const pLimit = async (n) => { const { default: m } = await import('p-limit'); return m(n); };

async function main() {
  console.log('=== 원의방정식 4단계 PCBSA 힌트 전면 재생성 ===\n');
  const texts = JSON.parse(fs.readFileSync(TEXTS, 'utf-8'));
  
  const files = fs.readdirSync(CROP_DIR)
    .filter(f => f.match(/^\d+\.webp$/))
    .sort();
  
  console.log(`총 ${files.length}개 문제 처리 시작\n`);
  
  const limit = await pLimit(3); // 3 concurrent to avoid rate limits
  let passCount = 0, failCount = 0;

  const tasks = files.map(file => limit(async () => {
    const id = file.replace('.webp', '');
    const problemImgPath = path.join(CROP_DIR, file);
    const solutionImgPath = path.join(CROP_DIR, id + 'a.webp');
    const outPath = path.join(HINT_DIR, `${id}.json`);
    const problemText = texts[`원의방정식4단계/${file}`] || '';

    process.stdout.write(`[${id}] 생성 중...\n`);
    
    let hint = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      hint = await generatePCBSA(problemImgPath, solutionImgPath, id, problemText);
      if (validatePCBSA(hint)) break;
      if (attempt < 3) {
        process.stdout.write(`  재시도 ${attempt}...\n`);
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    if (hint && hint.overlay_steps) {
      // Ensure id is set
      hint.id = id;
      hint.type = 'geometry';
      fs.writeFileSync(outPath, JSON.stringify(hint, null, 2), 'utf-8');
      
      const isValid = validatePCBSA(hint);
      passCount++;
      process.stdout.write(`  ✓ ${id} (PCBSA: ${isValid ? 'OK' : 'partial'}, steps: ${hint.overlay_steps.length})\n`);
    } else {
      failCount++;
      process.stdout.write(`  ✗ ${id} 실패\n`);
    }
  }));

  await Promise.all(tasks);
  
  console.log(`\n=== 완료: 성공 ${passCount}/${files.length}, 실패 ${failCount} ===`);
  
  // PCBSA validation report
  console.log('\n=== PCBSA 검수 ===');
  let pcbsaPass = 0;
  for (const file of files) {
    const id = file.replace('.webp', '');
    const hintPath = path.join(HINT_DIR, `${id}.json`);
    if (!fs.existsSync(hintPath)) { console.log(`  ✗ ${id}: 파일없음`); continue; }
    const hint = JSON.parse(fs.readFileSync(hintPath, 'utf-8'));
    if (validatePCBSA(hint)) pcbsaPass++;
    else console.log(`  ✗ ${id}: PCBSA 미완`);
  }
  console.log(`PCBSA 통과: ${pcbsaPass}/${files.length}`);
}

main().catch(console.error);
