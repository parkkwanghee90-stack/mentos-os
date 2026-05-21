/**
 * rebuild_circle4_pcbsa.js
 * 원의방정식4단계 PCBSA 힌트 완전 재구축
 * - 문제 이미지 + 해설 이미지를 BOTH 읽어 유형 파악
 * - 유형별로 완전히 다른 PCBSA 생성
 * - 5문제씩 처리 후 검수
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CROP_DIR = path.join(__dirname, '../public/math_crops/(2)수학(상)기말/원의방정식4단계');
const HINT_DIR = path.join(__dirname, '../public/math_hints/원의방정식4단계');
const TEXTS = path.join(__dirname, '../src/data/math_problem_texts.json');

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

// Normalize: convert circle {x,y,r} → {center,radius}, strip $ from labels
function normalizeHint(h) {
  if (!h) return h;
  function fixObj(obj) {
    if (!obj || typeof obj !== 'object') return;
    if (obj.type === 'circle') {
      if (obj.x !== undefined && !obj.center) { obj.center = [obj.x ?? 0, obj.y ?? 0]; delete obj.x; delete obj.y; }
      if (obj.r !== undefined && !obj.radius) { obj.radius = obj.r; delete obj.r; }
    }
    if (obj.label && typeof obj.label === 'string') obj.label = obj.label.replace(/^\$\$?|\$\$?$/g, '').trim();
    if (Array.isArray(obj.objects)) obj.objects.forEach(fixObj);
  }
  if (h.base_figure?.objects) h.base_figure.objects.forEach(fixObj);
  for (const step of h.overlay_steps || []) {
    if (step.objects) step.objects.forEach(fixObj);
  }
  return h;
}

async function generateForProblem(id, problemText) {
  const probImg = path.join(CROP_DIR, `${id}.webp`);
  const solImg = path.join(CROP_DIR, `${id}a.webp`);
  if (!fs.existsSync(probImg)) return null;

  const images = [
    { type: 'image_url', image_url: { url: `data:image/webp;base64,${toBase64(probImg)}` } }
  ];
  if (fs.existsSync(solImg)) {
    images.push({ type: 'image_url', image_url: { url: `data:image/webp;base64,${toBase64(solImg)}` } });
  }

  const prompt = `You are creating a PCBSA-structured Korean math animation hint.

Image 1: Problem ${id}
Image 2: Solution/explanation (if provided)
Problem text: "${problemText}"

═══ STEP 1: IDENTIFY THE PROBLEM TYPE ═══
Look carefully at BOTH images. Determine which type this is:
- TypeA: "AP의 길이가 정수인 점P의 개수" → method: AC거리→AP범위→정수세기
- TypeB: "두 점으로부터 거리의 비" (아폴로니우스 원) → method: PA:PB=m:n → 원의 방정식 도출
- TypeC: "조건 만족 점P의 자취/넓이" (AP²=BP²+CP² etc.) → method: 좌표 대입→전개→표준형
- TypeD: "내분점/중점이 그리는 자취" → method: 중점 좌표 설정→원의 방정식 도출
- TypeE: "수선의 발의 자취" → method: 직선 위의 수선의 발→원의 방정식
- TypeF: "원과 직선 관계" (접선/교점/삼각형) → method: 중심~직선 거리 = 반지름
- TypeG: "원 위 점과 외부 점 조건" → method: 해당 조건 적용
- TypeH: Other unique type

═══ STEP 2: GENERATE EXACT PCBSA ═══
Return ONLY valid JSON matching this structure. No markdown.

{
  "problem_type": "TypeX - one line description of what this problem is",
  "layer": "render",
  "id": "${id}",
  "title": "원의 방정식 ${id}번",
  "type": "geometry",
  "base_figure": {
    "preset": "custom",
    "objects": [
      { "type": "axes" },
      // ADD EXACT GEOMETRIC OBJECTS from the problem:
      // For circles: { "type": "circle", "center": [x, y], "radius": r, "color": "#3b82f6" }
      // For points: { "type": "point", "x": val, "y": val, "label": "A(x,y)", "color": "#ef4444" }
      // For lines: { "type": "line", "points": [[x1,y1],[x2,y2]], "color": "#94a3b8" }
    ]
  },
  "overlay_steps": [
    {
      "step": 1,
      "label": "P (구하는 것)",
      "label_text": "무엇을 구해야 하는지 파악합니다.",
      "latex": "PURE LaTeX ONLY - no Korean text here",
      "objects": []
    },
    {
      "step": 2,
      "label": "C (주어진 조건)",
      "label_text": "Korean: list conditions in plain Korean",
      "latex": "Pure LaTeX of the key equation or condition",
      "objects": [ /* highlight relevant geometric objects */ ]
    },
    {
      "step": 3,
      "label": "B (배경지식)",
      "label_text": "Korean: which formula/theorem to apply",
      "latex": "The KEY FORMULA in pure LaTeX",
      "objects": []
    },
    {
      "step": 4,
      "label": "S1 (풀이 1단계)",
      "label_text": "Korean: what this step does",
      "latex": "Actual calculation in pure LaTeX",
      "objects": [ /* geometric objects for this step */ ]
    },
    // Add more S steps as needed following THE EXACT SOLUTION from image
    {
      "step": N,
      "label": "A (최종 정답)",
      "label_text": "정답을 확인합니다.",
      "latex": "\\\\therefore \\\\boxed{EXACT_ANSWER}",
      "objects": []
    }
  ],
  "viewBox": { "x": [minX, maxX], "y": [minY, maxY] }
}

═══ CRITICAL RULES ═══
1. READ THE SOLUTION IMAGE to understand the exact solving method used
2. DO NOT use a template from a different problem type
3. The latex field must be PURE LATEX - no Korean characters in latex fields
4. Korean goes ONLY in label_text fields
5. Backslashes in JSON must be doubled: \\\\sqrt \\\\frac \\\\overline \\\\leq \\\\geq \\\\pi \\\\therefore \\\\boxed
6. All coordinates in objects.x, objects.y must be REAL NUMBERS
7. circle objects: use "center": [x, y] and "radius": r format (NOT x/y/r)
8. Labels on objects: pure LaTeX without $ delimiters
9. Generate 5-7 overlay_steps minimum`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, ...images] }],
        max_tokens: 2500,
        temperature: 0.1
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    let c = data.choices[0].message.content.trim();
    if (c.startsWith('```')) c = c.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    return safeParse(c);
  } catch(e) {
    console.error(`  ERR ${id}: ${e.message.substring(0, 80)}`);
    return null;
  }
}

function validateHint(h) {
  if (!h?.overlay_steps || h.overlay_steps.length < 4) return false;
  const labels = h.overlay_steps.map(s => s.label || '');
  return (
    labels.some(l => l.includes('P')) &&
    labels.some(l => l.includes('C')) &&
    labels.some(l => l.includes('B')) &&
    labels.some(l => l.includes('A'))
  );
}

// Check if hint matches problem type (basic sanity)
function sanityCheck(id, hint, problemText) {
  if (!hint) return { ok: false, reason: 'null' };
  const type = hint.problem_type || '';
  const steps = hint.overlay_steps || [];
  
  // Problem 001-005: integer count type
  const isIntegerCountProblem = problemText.includes('정수가 되는') && problemText.includes('몇 개');
  // Problem 6-11: ratio type (아폴로니우스)
  const isRatioProblem = problemText.includes('거리의 비') || problemText.includes('AP = BP') || problemText.includes('2AP');
  // Problem 12-13: AP²=BP²+CP² type
  const isSquareCondition = problemText.includes('\\overline{') || problemText.includes('AP}^2');
  
  // Check if solution steps contain something relevant
  const allLatex = steps.map(s => s.latex || '').join(' ');
  const allText = steps.map(s => s.label_text || '').join(' ');
  
  // Red flag: integer-count template applied to non-integer-count problem
  if (!isIntegerCountProblem && (allText.includes('정수') && allText.includes('개수'))) {
    return { ok: false, reason: '잘못된 유형 (정수세기 템플릿이 다른 유형에 적용됨)' };
  }
  
  return { ok: validateHint(hint), reason: '' };
}

const pLimit = async (n) => { const { default: m } = await import('p-limit'); return m(n); };

// Process IDs from command line arg, or default range
const args = process.argv.slice(2);
let startId = parseInt(args[0]) || 1;
let endId = parseInt(args[1]) || 5;

async function processBatch(start, end) {
  const texts = JSON.parse(fs.readFileSync(TEXTS, 'utf-8'));
  const cropFiles = fs.readdirSync(CROP_DIR)
    .filter(f => f.match(/^\d+\.webp$/))
    .sort();

  const batchFiles = cropFiles.filter(f => {
    const n = parseInt(f.replace('.webp', ''));
    return n >= start && n <= end;
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`원의방정식4단계 ${start}~${end}번 PCBSA 재구축`);
  console.log(`${'='.repeat(60)}\n`);

  const limit = await pLimit(2); // slow but accurate
  let pass = 0, fail = 0;
  const results = [];

  const tasks = batchFiles.map(file => limit(async () => {
    const id = file.replace('.webp', '');
    const numId = parseInt(id);
    const key = `원의방정식4단계/${file}`;
    const problemText = texts[key] || '';
    const outPath = path.join(HINT_DIR, `${id}.json`);

    process.stdout.write(`[${id}] 처리 중...\n`);
    process.stdout.write(`  문제: ${problemText.split('\n')[0].substring(0, 70)}\n`);

    let hint = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      hint = await generateForProblem(id, problemText);
      if (hint) {
        const normalized = normalizeHint(hint);
        const { ok, reason } = sanityCheck(numId, normalized, problemText);
        if (ok) { hint = normalized; break; }
        if (attempt < 3) {
          process.stdout.write(`  재시도 ${attempt} (${reason})\n`);
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }

    if (hint && hint.overlay_steps?.length >= 4) {
      hint.id = id;
      hint.type = 'geometry';
      normalizeHint(hint);
      fs.writeFileSync(outPath, JSON.stringify(hint, null, 2), 'utf-8');
      pass++;
      const pType = hint.problem_type || '?';
      process.stdout.write(`  ✓ ${id} [${pType}] (steps:${hint.overlay_steps.length})\n`);
      results.push({ id, ok: true, type: pType });
    } else {
      fail++;
      process.stdout.write(`  ✗ ${id} 실패\n`);
      results.push({ id, ok: false });
    }
  }));

  await Promise.all(tasks);

  console.log(`\n${'─'.repeat(40)}`);
  console.log(`완료: ✓${pass} / ✗${fail}`);
  console.log(`\n문제별 결과:`);
  results.sort((a,b)=>a.id.localeCompare(b.id)).forEach(r => {
    console.log(`  ${r.ok ? '✓' : '✗'} ${r.id}: ${r.type || '실패'}`);
  });
}

processBatch(startId, endId).catch(console.error);
