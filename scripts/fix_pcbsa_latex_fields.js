/**
 * fix_pcbsa_latex_fields.js
 * PCBSA 힌트의 latex 필드에서 한글+수식 혼합 → 분리
 * label_text: 한글 설명
 * latex: 순수 LaTeX 수식만
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HINT_DIR = path.join(__dirname, '../public/math_hints/원의방정식4단계');

// 텍스트에 한글+수식 혼합인지 확인
function hasMixedContent(text) {
  if (!text) return false;
  return /[가-힣]/.test(text) && /[\$\\]/.test(text);
}

// 혼합 텍스트에서 순수 LaTeX 추출
// 예: "점 $A$에서 $AC = 5$" → { description: "점 A에서 AC = 5", latex: "AC = 5" }
function splitMixedLatex(text) {
  if (!text) return { description: '', latex: '' };
  
  // Extract all $...$ and $$...$$ segments as the latex content
  const mathParts = [];
  let cleaned = text;
  
  // Block math $$...$$
  cleaned = cleaned.replace(/\$\$([\s\S]+?)\$\$/g, (_, m) => {
    mathParts.push(m.trim());
    return ' ';
  });
  
  // Inline math $...$
  cleaned = cleaned.replace(/\$((?:[^$\\]|\\[\s\S])+?)\$/g, (_, m) => {
    mathParts.push(m.trim());
    return `(${m.trim()})`;
  });
  
  // Pure latex (no $, has \\commands)
  if (mathParts.length === 0 && /\\[a-zA-Z]/.test(text)) {
    return { description: text, latex: text };
  }
  
  // The description is the cleaned text (Korean with math replaced by readable form)
  const description = cleaned.replace(/\s+/g, ' ').trim();
  
  // Main latex = join with \\quad separator, or just the first meaningful one
  const latex = mathParts.length > 0 ? mathParts.join(' \\quad ') : '';
  
  return { description, latex };
}

// Process a single hint file
function processHint(hintPath) {
  const h = JSON.parse(fs.readFileSync(hintPath, 'utf-8'));
  if (!h.overlay_steps) return false;
  
  let changed = false;
  
  for (const step of h.overlay_steps) {
    const latex = step.latex;
    if (!latex) continue;
    
    // If latex has Korean text mixed in, split it
    if (hasMixedContent(latex)) {
      const { description, latex: pureLatex } = splitMixedLatex(latex);
      
      // Move Korean description to label_text if label_text is generic
      const currentLabelText = step.label_text || '';
      if (!currentLabelText.includes(description.substring(0, 10)) && description.length > 5) {
        // Append Korean description to label_text
        step.label_text = (currentLabelText ? currentLabelText + ' — ' : '') + description;
      }
      
      // Keep only pure LaTeX in the latex field
      step.latex = pureLatex || latex;
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(hintPath, JSON.stringify(h, null, 2), 'utf-8');
  }
  return changed;
}

async function main() {
  const files = fs.readdirSync(HINT_DIR).filter(f => f.match(/^\d+\.json$/)).sort();
  console.log(`=== PCBSA latex 필드 분리 패치 (${files.length}개) ===\n`);
  
  let fixedCount = 0;
  for (const file of files) {
    const changed = processHint(path.join(HINT_DIR, file));
    if (changed) {
      fixedCount++;
      console.log(`  ✓ ${file} 패치됨`);
    }
  }
  
  console.log(`\n총 ${fixedCount}/${files.length}개 패치`);
  
  // Verify: check no step.latex has Korean after fix
  console.log('\n=== 검수 ===');
  let pass = 0, fail = 0;
  for (const file of files) {
    const h = JSON.parse(fs.readFileSync(path.join(HINT_DIR, file), 'utf-8'));
    const hasMixedLatex = (h.overlay_steps || []).some(s => hasMixedContent(s.latex));
    if (hasMixedLatex) {
      const bad = h.overlay_steps.filter(s => hasMixedContent(s.latex));
      console.log(`  ✗ ${file}: ${bad.length}개 스텝에 혼합 latex 잔류`);
      fail++;
    } else {
      pass++;
    }
  }
  console.log(`통과: ${pass}/${files.length}`);
}

main().catch(console.error);
