/**
 * fix_labels_dollar.js
 * PCBSA 힌트 JSON에서 objects.label 필드의 $ 기호 제거
 * "$P_{min}$" → "P_{min}"
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HINT_DIR = path.join(__dirname, '../public/math_hints/원의방정식4단계');

function stripDollar(label) {
  if (!label) return label;
  // Remove wrapping $ or $$ delimiters
  return label.replace(/^\$\$?|\$\$?$/g, '').trim();
}

function processObjects(objects) {
  if (!Array.isArray(objects)) return;
  for (const obj of objects) {
    if (obj.label) obj.label = stripDollar(obj.label);
    if (obj.objects) processObjects(obj.objects);
  }
}

let totalFixed = 0;
const files = fs.readdirSync(HINT_DIR).filter(f => f.match(/^\d+\.json$/)).sort();

for (const file of files) {
  const p = path.join(HINT_DIR, file);
  const h = JSON.parse(fs.readFileSync(p, 'utf-8'));
  let changed = false;

  // Fix base_figure objects
  if (h.base_figure?.objects) {
    const before = JSON.stringify(h.base_figure.objects);
    processObjects(h.base_figure.objects);
    if (JSON.stringify(h.base_figure.objects) !== before) changed = true;
  }

  // Fix overlay_steps objects
  for (const step of h.overlay_steps || []) {
    if (step.objects) {
      const before = JSON.stringify(step.objects);
      processObjects(step.objects);
      if (JSON.stringify(step.objects) !== before) changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(p, JSON.stringify(h, null, 2), 'utf-8');
    totalFixed++;
    console.log(`  ✓ ${file}`);
  }
}

console.log(`\n총 ${totalFixed}/${files.length}개 label $ 제거 완료`);
