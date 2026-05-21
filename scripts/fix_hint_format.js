/**
 * fix_hint_format.js
 * PCBSA 힌트 JSON 객체 형식 교정
 * 1. circle: {x,y,r} → {center:[x,y], radius:r} (MathCanvas 표준)
 * 2. label: "$...$" → "..." ($ 제거)
 * 3. dashed line: style:"dashed" 추가
 * 4. label에 $ 포함 시 모두 제거
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HINT_DIR = path.join(__dirname, '../public/math_hints/원의방정식4단계');

function stripDollar(s) {
  if (typeof s !== 'string') return s;
  return s.replace(/^\$\$?|\$\$?$/g, '').trim();
}

function normalizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  // 1. circle: {x,y,r} → {center:[x,y], radius:r}
  if (obj.type === 'circle') {
    if (obj.x !== undefined && obj.center === undefined) {
      obj.center = [obj.x ?? 0, obj.y ?? 0];
      delete obj.x; delete obj.y;
    }
    if (obj.r !== undefined && obj.radius === undefined) {
      obj.radius = obj.r;
      delete obj.r;
    }
    // Remove invalid center (non-array)
    if (obj.center && !Array.isArray(obj.center)) delete obj.center;
  }

  // 2. label: strip $
  if (obj.label) obj.label = stripDollar(obj.label);

  // 3. dashed line
  if (obj.type === 'line' && obj.dashed === true && !obj.style) {
    obj.style = 'dashed';
  }

  return obj;
}

function processAll(objects) {
  if (!Array.isArray(objects)) return;
  for (let i = 0; i < objects.length; i++) {
    objects[i] = normalizeObject(objects[i]);
    if (objects[i]?.objects) processAll(objects[i].objects);
  }
}

const files = fs.readdirSync(HINT_DIR).filter(f => f.match(/^\d+\.json$/)).sort();
let totalFixed = 0;

for (const file of files) {
  const p = path.join(HINT_DIR, file);
  const h = JSON.parse(fs.readFileSync(p, 'utf-8'));
  const before = JSON.stringify(h);

  if (h.base_figure?.objects) processAll(h.base_figure.objects);
  for (const step of h.overlay_steps || []) {
    if (step.objects) processAll(step.objects);
  }

  const after = JSON.stringify(h);
  if (before !== after) {
    fs.writeFileSync(p, JSON.stringify(h, null, 2), 'utf-8');
    totalFixed++;
    console.log(`  ✓ ${file}`);
  }
}

console.log(`\n총 ${totalFixed}/${files.length}개 형식 교정 완료`);

// Verify: check no circles still have {x,y,r} format
let badCircles = 0;
for (const file of files) {
  const h = JSON.parse(fs.readFileSync(path.join(HINT_DIR, file), 'utf-8'));
  const allObjs = [];
  if (h.base_figure?.objects) allObjs.push(...h.base_figure.objects);
  for (const s of h.overlay_steps || []) if (s.objects) allObjs.push(...s.objects);
  const bad = allObjs.filter(o => o.type === 'circle' && o.r !== undefined);
  if (bad.length) { console.log(`  ✗ ${file}: circle에 r 잔류`); badCircles++; }
}
if (badCircles === 0) console.log('✅ 모든 circle 형식 정상 (center+radius)');
