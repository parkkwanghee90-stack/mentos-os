/**
 * create_pcbsa_all.js
 * 원의방정식 4단계 전체 PCBSA 힌트 생성
 * - API: 이미지를 읽고 문제를 파악하는 눈
 * - 나(모델): PCBSA 구조 강제, 수학 좌표 정밀 계산 지시
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

function safeParse(raw) {
  try { return JSON.parse(raw); } catch {}
  try {
    const fixed = raw.replace(/(?<!\\)\\(?!["\\\/bfnrtu])/g, '\\\\');
    return JSON.parse(fixed);
  } catch {}
  // Try extracting JSON object
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try { return JSON.parse(raw.slice(start, end + 1)); } catch {}
    try {
      const sub = raw.slice(start, end + 1).replace(/(?<!\\)\\(?!["\\\/bfnrtu])/g, '\\\\');
      return JSON.parse(sub);
    } catch {}
  }
  throw new Error('parse failed');
}

async function generateHint(id, problemText, hasAnswer) {
  const problemImg = path.join(CROP_DIR, `${id}.webp`);
  const answerImg = path.join(CROP_DIR, `${id}a.webp`);
  if (!fs.existsSync(problemImg)) return null;

  const images = [
    { type: 'image_url', image_url: { url: `data:image/webp;base64,${toBase64(problemImg)}` } }
  ];
  if (hasAnswer && fs.existsSync(answerImg)) {
    images.push({ type: 'image_url', image_url: { url: `data:image/webp;base64,${toBase64(answerImg)}` } });
  }

  const PCBSA_PROMPT = `You are a Korean math teacher creating a PCBSA-structured geometry animation hint.

Problem text: ${problemText}
${hasAnswer ? '(Solution image also provided — use it to understand the exact method and final answer)' : ''}

OUTPUT: Return ONLY valid JSON (no markdown, no code blocks).

REQUIRED STRUCTURE:
{
  "layer": "render",
  "id": "${id}",
  "title": "원의 방정식 심화",
  "type": "geometry",
  "base_figure": {
    "preset": "custom",
    "objects": [
      { "type": "axes" },
      // THE CIRCLE: extract EXACT center (Cx, Cy) and radius r from problem
      // For (x-a)^2+(y-b)^2=r^2: center=(a,b), radius=r
      // For general ax^2+y^2+Dx+Ey+F=0: complete the square first
      { "type": "circle", "x": Cx, "y": Cy, "r": r, "color": "#3b82f6" },
      { "type": "point", "x": Cx, "y": Cy, "label": "C(Cx,Cy)", "color": "#3b82f6" },
      // THE EXTERNAL POINT A: exact coordinates from problem
      { "type": "point", "x": Ax, "y": Ay, "label": "A(Ax,Ay)", "color": "#ef4444" }
    ]
  },
  "overlay_steps": [
    {
      "step": 1,
      "label": "P (구하는 것)",
      "label_text": "무엇을 구해야 하는지 파악합니다.",
      "latex": "Korean explanation of what to find",
      "objects": []
    },
    {
      "step": 2,
      "label": "C (주어진 조건)",
      "label_text": "주어진 조건을 정리합니다.",
      "latex": "List all given info: point A coords, circle equation, center, radius",
      "objects": [
        { "type": "point", "x": Ax, "y": Ay, "label": "A", "color": "#ef4444", "highlight": true },
        { "type": "circle", "x": Cx, "y": Cy, "r": r, "color": "#3b82f6", "highlight": true }
      ]
    },
    {
      "step": 3,
      "label": "B (배경지식)",
      "label_text": "핵심 공식을 떠올립니다.",
      "latex": "AP_{min} = \\\\overline{AC} - r, \\\\quad AP_{max} = \\\\overline{AC} + r",
      "objects": [
        { "type": "line", "points": [[Ax, Ay], [Cx, Cy]], "color": "#f59e0b", "dashed": true }
      ]
    },
    {
      "step": 4,
      "label": "S1 (풀이 1단계)",
      "label_text": "AC 거리를 계산합니다.",
      "latex": "\\\\overline{AC} = \\\\sqrt{(Cx-Ax)^2+(Cy-Ay)^2} = EXACT_VALUE",
      "objects": [
        { "type": "line", "points": [[Ax, Ay], [Cx, Cy]], "color": "#f59e0b" }
      ]
    },
    {
      "step": 5,
      "label": "S2 (풀이 2단계)",
      "label_text": "AP의 범위를 구합니다.",
      "latex": "AP_{min} = AC - r = EXACT, \\\\quad AP_{max} = AC + r = EXACT",
      "objects": [
        // P_min: point on circle closest to A → on line segment CA extended toward A
        // P_min coords: (Cx + r*(Ax-Cx)/AC, Cy + r*(Ay-Cy)/AC) — calculate these exactly
        { "type": "point", "x": Pmin_x, "y": Pmin_y, "label": "P_{min}", "color": "#10b981" },
        { "type": "point", "x": Pmax_x, "y": Pmax_y, "label": "P_{max}", "color": "#f97316" }
      ]
    },
    {
      "step": 6,
      "label": "S3 (풀이 3단계)",
      "label_text": "정수가 되는 경우의 수를 셉니다.",
      "latex": "Explain which integers work and how many points for each",
      "objects": []
    },
    {
      "step": 7,
      "label": "A (최종 정답)",
      "label_text": "정답을 확인합니다.",
      "latex": "\\\\therefore \\\\text{점 P의 개수} = \\\\boxed{FINAL_ANSWER}",
      "objects": []
    }
  ],
  "viewBox": {
    "x": [minX-2, maxX+2],
    "y": [minY-2, maxY+2]
  }
}

MATHEMATICAL REQUIREMENTS:
1. Extract the circle equation and compute: center (Cx,Cy) and radius r
2. Read point A's coordinates: (Ax, Ay)
3. Calculate AC = sqrt((Cx-Ax)^2 + (Cy-Ay)^2) — give EXACT value (simplified radical or integer)
4. AP_min = AC - r, AP_max = AC + r — exact values
5. P_min = (Cx + r*(Ax-Cx)/AC, Cy + r*(Ay-Cy)/AC) — calculate to 2 decimal places
6. P_max = (Cx - r*(Ax-Cx)/AC, Cy - r*(Ay-Cy)/AC) — calculate to 2 decimal places
7. Count integers strictly between AP_min and AP_max: endpoints give 1 point each if they are integers, others give 2 points each
8. All coordinates in overlay_steps.objects must be REAL numbers (not formulas)

LATEX RULES: In JSON strings, backslashes must be doubled: \\\\sqrt, \\\\frac, \\\\overline, \\\\leq, \\\\geq, \\\\therefore, \\\\text
Korean text goes outside math delimiters.`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: [{ type: 'text', text: PCBSA_PROMPT }, ...images] }],
        max_tokens: 2500,
        temperature: 0.1
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    let content = data.choices[0].message.content.trim();
    if (content.startsWith('```')) content = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    return safeParse(content);
  } catch(e) {
    process.stdout.write(`  ✗ ${e.message.substring(0, 60)}\n`);
    return null;
  }
}

function validateHint(h) {
  if (!h || !h.overlay_steps || h.overlay_steps.length < 5) return false;
  const labels = h.overlay_steps.map(s => s.label || '');
  return (
    labels.some(l => l.includes('P')) &&
    labels.some(l => l.includes('C')) &&
    labels.some(l => l.includes('B')) &&
    labels.some(l => l.includes('A')) &&
    (h.base_figure?.objects || []).some(o => o.type === 'circle')
  );
}

const pLimit = async (n) => { const { default: m } = await import('p-limit'); return m(n); };

async function main() {
  const texts = JSON.parse(fs.readFileSync(TEXTS, 'utf-8'));
  const files = fs.readdirSync(CROP_DIR)
    .filter(f => f.match(/^\d+\.webp$/))
    .sort();

  // Skip already-done files (001, 002, 003 are manually created)
  const SKIP = new Set(['001', '002', '003']);

  console.log(`\n=== 원의방정식4단계 PCBSA 힌트 생성 (${files.length}개) ===\n`);

  const limit = await pLimit(3);
  let pass = 0, fail = 0;

  const tasks = files.map(file => limit(async () => {
    const id = file.replace('.webp', '');
    if (SKIP.has(id)) { process.stdout.write(`  skip ${id} (수동 작성)\n`); pass++; return; }

    const outPath = path.join(HINT_DIR, `${id}.json`);
    const problemText = texts[`원의방정식4단계/${file}`] || '';
    const hasAnswer = fs.existsSync(path.join(CROP_DIR, `${id}a.webp`));

    process.stdout.write(`[${id}] 생성 중...\n`);

    let hint = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      hint = await generateHint(id, problemText, hasAnswer);
      if (validateHint(hint)) break;
      if (attempt < 3) {
        process.stdout.write(`  재시도 ${attempt}...\n`);
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    if (hint && hint.overlay_steps?.length > 0) {
      hint.id = id;
      hint.type = 'geometry';
      fs.writeFileSync(outPath, JSON.stringify(hint, null, 2), 'utf-8');
      const valid = validateHint(hint);
      pass++;
      process.stdout.write(`  ✓ ${id} (steps:${hint.overlay_steps.length}, PCBSA:${valid})\n`);
    } else {
      fail++;
      process.stdout.write(`  ✗ ${id} 실패\n`);
    }
  }));

  await Promise.all(tasks);
  console.log(`\n완료: ✓${pass} ✗${fail} / ${files.length}`);

  // Final validation
  let pcbsaPass = 0;
  for (const file of files) {
    const id = file.replace('.webp', '');
    const p = path.join(HINT_DIR, `${id}.json`);
    if (!fs.existsSync(p)) continue;
    try {
      const h = JSON.parse(fs.readFileSync(p, 'utf-8'));
      if (validateHint(h)) pcbsaPass++;
    } catch {}
  }
  console.log(`PCBSA 구조 통과: ${pcbsaPass}/${files.length}`);
}

main().catch(console.error);
