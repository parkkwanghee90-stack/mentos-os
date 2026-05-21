/**
 * fix_failed_hints.js - 009, 055번 재생성 + 전체 정확 재검수
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

function validatePCBSA(h) {
  if (!h?.overlay_steps?.length) return false;
  const labels = h.overlay_steps.map(s => s.label || '');
  return (
    labels.some(l => l.includes('P')) &&
    labels.some(l => l.includes('C')) &&
    labels.some(l => l.includes('B')) &&
    labels.some(l => l.includes('A')) &&
    (h.base_figure?.objects || []).some(o => o.type === 'circle')
  );
}

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

async function generate(id, problemText) {
  const pImg = path.join(CROP_DIR, `${id}.webp`);
  const aImg = path.join(CROP_DIR, `${id}a.webp`);
  if (!fs.existsSync(pImg)) return null;

  const imgs = [{ type: 'image_url', image_url: { url: `data:image/webp;base64,${toBase64(pImg)}` } }];
  if (fs.existsSync(aImg)) imgs.push({ type: 'image_url', image_url: { url: `data:image/webp;base64,${toBase64(aImg)}` } });

  const prompt = `Korean math teacher creating PCBSA geometry hint for problem ${id}.

Problem: ${problemText}
(Solution image provided if available)

Return ONLY valid JSON:
{
  "layer": "render", "id": "${id}", "title": "원의 방정식 심화", "type": "geometry",
  "base_figure": {
    "preset": "custom",
    "objects": [
      { "type": "axes" },
      { "type": "circle", "x": <Cx>, "y": <Cy>, "r": <r>, "color": "#3b82f6" },
      { "type": "point", "x": <Cx>, "y": <Cy>, "label": "C(<Cx>,<Cy>)", "color": "#3b82f6" },
      { "type": "point", "x": <Ax>, "y": <Ay>, "label": "A(<Ax>,<Ay>)", "color": "#ef4444" }
    ]
  },
  "overlay_steps": [
    { "step": 1, "label": "P (구하는 것)", "label_text": "무엇을 구해야 하는지 파악합니다.", "latex": "<Korean: what to find>", "objects": [] },
    { "step": 2, "label": "C (주어진 조건)", "label_text": "주어진 조건을 정리합니다.", "latex": "<list given info>", "objects": [{"type":"point","x":<Ax>,"y":<Ay>,"label":"A","color":"#ef4444"},{"type":"circle","x":<Cx>,"y":<Cy>,"r":<r>,"color":"#3b82f6"}] },
    { "step": 3, "label": "B (배경지식)", "label_text": "핵심 공식을 떠올립니다.", "latex": "AP_{min} = \\\\overline{AC} - r, \\\\quad AP_{max} = \\\\overline{AC} + r", "objects": [{"type":"line","points":[[<Ax>,<Ay>],[<Cx>,<Cy>]],"color":"#f59e0b","dashed":true}] },
    { "step": 4, "label": "S1 (풀이 1단계)", "label_text": "AC 거리 계산", "latex": "\\\\overline{AC} = \\\\sqrt{...} = <exact value>", "objects": [{"type":"line","points":[[<Ax>,<Ay>],[<Cx>,<Cy>]],"color":"#f59e0b"}] },
    { "step": 5, "label": "S2 (풀이 2단계)", "label_text": "AP 범위 결정", "latex": "AP_{min}=<val>, AP_{max}=<val>", "objects": [{"type":"point","x":<Pmin_x>,"y":<Pmin_y>,"label":"P_{min}","color":"#10b981"},{"type":"point","x":<Pmax_x>,"y":<Pmax_y>,"label":"P_{max}","color":"#f97316"}] },
    { "step": 6, "label": "S3 (풀이 3단계)", "label_text": "정수 AP의 개수 계산", "latex": "<count integers and explain>", "objects": [] },
    { "step": 7, "label": "A (최종 정답)", "label_text": "정답 확인", "latex": "\\\\therefore \\\\boxed{<answer>}", "objects": [] }
  ],
  "viewBox": { "x": [<minX>, <maxX>], "y": [<minY>, <maxY>] }
}

MATH: Calculate Cx,Cy,r from circle equation. Calculate AC exactly. P_min = C + r*(A-C)/AC, P_max = C - r*(A-C)/AC.
Backslashes doubled in JSON strings.`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, ...imgs] }],
        max_tokens: 2000, temperature: 0.1
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    let c = data.choices[0].message.content.trim();
    if (c.startsWith('```')) c = c.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    return safeParse(c);
  } catch(e) { console.error(`  ${e.message.substring(0,80)}`); return null; }
}

async function main() {
  const texts = JSON.parse(fs.readFileSync(TEXTS, 'utf-8'));
  const cropFiles = fs.readdirSync(CROP_DIR).filter(f => f.match(/^\d+\.webp$/)).sort().map(f => f.replace('.webp', ''));

  // Full accurate validation
  console.log('=== 전체 정확 검수 ===');
  const needsWork = [];
  for (const id of cropFiles) {
    const p = path.join(HINT_DIR, `${id}.json`);
    if (!fs.existsSync(p)) { needsWork.push(id); console.log(`  ✗ ${id}: 파일없음`); continue; }
    try {
      const h = JSON.parse(fs.readFileSync(p, 'utf-8'));
      if (!validatePCBSA(h)) { needsWork.push(id); console.log(`  ✗ ${id}: PCBSA 미완 (steps:${h.overlay_steps?.length}, circle:${(h.base_figure?.objects||[]).some(o=>o.type==='circle')})`); }
    } catch { needsWork.push(id); console.log(`  ✗ ${id}: 파싱오류`); }
  }

  if (needsWork.length === 0) {
    console.log('\n🎉 모든 92개 PCBSA 통과!');
    return;
  }

  console.log(`\n재생성 필요: ${needsWork.length}개 → ${needsWork.join(', ')}\n`);

  for (const id of needsWork) {
    const problemText = texts[`원의방정식4단계/${id}.webp`] || '';
    console.log(`[${id}] 재생성...`);

    let hint = null;
    for (let i = 0; i < 3; i++) {
      hint = await generate(id, problemText);
      if (validatePCBSA(hint)) break;
      if (i < 2) { console.log(`  재시도 ${i+1}`); await new Promise(r => setTimeout(r, 800)); }
    }

    if (hint && hint.overlay_steps?.length > 0) {
      hint.id = id; hint.type = 'geometry';
      fs.writeFileSync(path.join(HINT_DIR, `${id}.json`), JSON.stringify(hint, null, 2), 'utf-8');
      console.log(`  ✓ ${id} (PCBSA:${validatePCBSA(hint)}, steps:${hint.overlay_steps.length})`);
    } else {
      console.log(`  ✗ ${id} 실패`);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  // Final count
  let pass = 0;
  for (const id of cropFiles) {
    const p = path.join(HINT_DIR, `${id}.json`);
    if (!fs.existsSync(p)) continue;
    try { if (validatePCBSA(JSON.parse(fs.readFileSync(p,'utf-8')))) pass++; } catch {}
  }
  console.log(`\n최종: ${pass}/${cropFiles.length} PCBSA 통과`);
  if (pass === cropFiles.length) console.log('🎉🎉 원의방정식4단계 전체 완료!');
}

main().catch(console.error);
