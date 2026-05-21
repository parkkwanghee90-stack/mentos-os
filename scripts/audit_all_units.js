/**
 * audit_all_units.js
 * 직선의방정식 2,3,4단계 + 원의방정식 2,3,4단계 전수 검수
 * 문제: 1) 수식 미래핑 2) 보기 인라인 3) 텍스트 없음 4) 문장 너무 긺
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '../public');
const DICT_JSON = path.join(__dirname, '../src/data/math_problem_texts.json');

const envFile = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
let apiKey = '';
for (const line of envFile.split('\n')) {
  if (line.startsWith('VITE_OPENAI_API_KEY=')) apiKey = line.split('=')[1].trim();
}

function toBase64(p) { return Buffer.from(fs.readFileSync(p)).toString('base64'); }

function safeParseJson(raw) {
  try { return JSON.parse(raw); } catch {}
  const m = raw.match(/"questionText"\s*:\s*"([\s\S]+?)(?<!\\)"\s*\}/);
  if (m) return { questionText: m[1] };
  throw new Error('parse failed');
}

async function extractText(imgPath, unit) {
  const b64 = toBase64(imgPath);
  const prompt = `Extract this Korean math problem (${unit}).
Return ONLY: {"questionText": "CONTENT"}
Rules:
- Korean text outside $
- Inline math: $expr$, Block math: $$expr$$
- Backslashes doubled in JSON: \\\\sqrt \\\\frac \\\\overline \\\\geq \\\\leq \\\\pm \\\\cdot
- Each option ①②③④⑤ on its own line
- Math in options MUST be wrapped: ② $\\\\sqrt{2}$ NOT ② \\\\sqrt{2}
- No markdown blocks`;
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
        max_tokens: 900, temperature: 0.0
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    let c = data.choices[0].message.content.trim();
    if (c.startsWith('```')) c = c.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    return safeParseJson(c).questionText;
  } catch(e) { return null; }
}

// ── Validators ──────────────────────────────────────────
function hasNakedLatexInOptions(text) {
  const oi = text.search(/[①②③④⑤]/);
  if (oi === -1) return false;
  const opts = text.slice(oi);
  const lines = opts.split('\n');
  return lines.some(line => {
    if (!/^[①②③④⑤]/.test(line.trim())) return false;
    const val = line.trim().replace(/^[①②③④⑤]\s*/, '');
    // has LaTeX backslash but not inside $...$
    return /\\[a-zA-Z]/.test(val) && !val.startsWith('$') && !val.match(/^\$.*\$$/);
  });
}

function hasInlineOptions(text) {
  const oi = text.search(/[①②③④⑤]/);
  if (oi === -1) return false;
  const opts = text.slice(oi);
  // Multiple circles on same line
  return opts.split('\n').some(line => /[①②③④⑤].+[①②③④⑤]/.test(line));
}

function hasLongLine(text) {
  // Any line > 120 chars (excluding lines with only math)
  return text.split('\n').some(line => line.length > 120);
}

function isValid(t) {
  return t && t.trim().length > 0 && (/[가-힣]/.test(t) || /\$/.test(t));
}

// ── Fixers ──────────────────────────────────────────────
function fixOptionMath(text) {
  if (!text) return text;
  const oi = text.search(/[①②③④⑤]/);
  if (oi === -1) return text;
  const body = text.slice(0, oi);
  const opts = text.slice(oi);
  
  // Fix inline (multiple options on one line)
  let normalized = opts.replace(/([^\n])(①|②|③|④|⑤)/g, '$1\n$2');
  
  // Wrap naked LaTeX in options
  normalized = normalized.replace(/(①|②|③|④|⑤)\s*([^\n①②③④⑤]+)/g, (_, circle, val) => {
    let v = val.trim();
    if (/\\[a-zA-Z]/.test(v) && !v.startsWith('$')) v = `$${v}$`;
    if (/[A-Za-z]?\([-\d., ]+\)/.test(v) && !v.startsWith('$')) v = `$${v}$`;
    return `${circle} ${v}`;
  });
  
  return body + normalized;
}

function addSmartBreaks(text) {
  return text
    .replace(/([이하]다\.)\s+(?=[가-힣A-Z$])/g, '$1\n')
    .replace(/(하자\.)\s+(?=[가-힣A-Z$])/g, '$1\n')
    .replace(/(있다\.)\s+(?=[가-힣A-Z$])/g, '$1\n')
    .replace(/(라 하자\.)\s+/g, '$1\n')
    .replace(/(이라 할 때,)\s+(?=[가-힣A-Z$])/g, '$1\n')
    .replace(/(\))\s+(이때|이 때|단,|여기서|다음|선분|삼각형|점)\s/g, '$1\n$2 ')
    .replace(/(구하시오\.)\s+/g, '$1\n');
}

// ── Main ────────────────────────────────────────────────
const TARGET_FOLDERS = [
  { cropFolder: '(2)수학(상)기말/(6)직선의방정식 개념2단계(44)p19 1+1(쌍둥이)', keyPrefix: '(6)직선의방정식 개념2단계(44)p19 1+1(쌍둥이)', name: '직선2단계' },
  { cropFolder: '(2)수학(상)기말/직선의방정식3단계', keyPrefix: '직선의방정식3단계', name: '직선3단계' },
  { cropFolder: '(2)수학(상)기말/직선의방정식4단계', keyPrefix: '직선의방정식4단계', name: '직선4단계' },
  { cropFolder: '(2)수학(상)기말/(7)원의방정식 개념2단계(54)p24 1+1(쌍둥이)', keyPrefix: '(7)원의방정식 개념2단계(54)p24 1+1(쌍둥이)', name: '원2단계' },
  { cropFolder: '(2)수학(상)기말/원의방정식3단계', keyPrefix: '원의방정식3단계', name: '원3단계' },
  { cropFolder: '(2)수학(상)기말/원의방정식4단계', keyPrefix: '원의방정식4단계', name: '원4단계' },
];

const pLimit = async (n) => { const { default: m } = await import('p-limit'); return m(n); };

async function main() {
  console.log('=== 직선/원의방정식 전 단계 전수 검수 + 수정 ===\n');
  const dict = JSON.parse(fs.readFileSync(DICT_JSON, 'utf-8'));
  const limit = await pLimit(5);

  const report = [];

  for (const { cropFolder, keyPrefix, name } of TARGET_FOLDERS) {
    const folderPath = path.join(PUBLIC_DIR, 'math_crops', cropFolder);
    if (!fs.existsSync(folderPath)) { console.log(`⚠ 없음: ${cropFolder}`); continue; }

    const files = fs.readdirSync(folderPath)
      .filter(f => f.match(/^\d+\.webp$/))
      .sort();

    console.log(`\n[${name}] ${files.length}개 검수 중...`);

    let unitPass = 0, unitFail = 0, unitFixed = 0;
    const failList = [];

    const tasks = files.map(file => limit(async () => {
      const key = `${keyPrefix}/${file}`;
      const imgPath = path.join(folderPath, file);
      let text = dict[key];
      let needsReextract = false;
      let issues = [];

      if (!isValid(text)) {
        issues.push('없음');
        needsReextract = true;
      } else {
        if (hasNakedLatexInOptions(text)) issues.push('수식미래핑');
        if (hasInlineOptions(text)) issues.push('보기인라인');
        if (hasLongLine(text)) issues.push('줄바꿈필요');
      }

      // Auto-fix non-reextract issues first
      if (!needsReextract && issues.length > 0) {
        let fixed = fixOptionMath(text);
        fixed = addSmartBreaks(fixed);
        if (fixed !== text) {
          dict[key] = fixed;
          text = fixed;
          unitFixed++;
          // Recheck after fix
          issues = [];
          if (hasNakedLatexInOptions(text)) issues.push('수식미래핑(잔류)');
          if (hasInlineOptions(text)) issues.push('보기인라인(잔류)');
        }
      }

      // Re-extract if still broken or missing
      if (needsReextract || issues.some(i => i.includes('잔류'))) {
        let extracted = null;
        for (let i = 0; i < 3; i++) {
          extracted = await extractText(imgPath, name);
          if (extracted && isValid(extracted)) break;
          if (i < 2) await new Promise(r => setTimeout(r, 600));
        }
        if (extracted && isValid(extracted)) {
          let fixed = fixOptionMath(extracted);
          fixed = addSmartBreaks(fixed);
          dict[key] = fixed;
          unitFixed++;
          issues = []; // cleared after re-extract
          if (hasNakedLatexInOptions(fixed)) issues.push('재추출후수식오류');
        }
      }

      if (issues.length === 0) {
        unitPass++;
      } else {
        unitFail++;
        failList.push(`  ✗ ${file}: ${issues.join(', ')}`);
      }
    }));

    await Promise.all(tasks);
    fs.writeFileSync(DICT_JSON, JSON.stringify(dict, null, 2), 'utf-8');

    const status = unitFail === 0 ? '🎉' : '⚠';
    console.log(`${status} ${name}: ${unitPass}/${files.length} 통과, ${unitFixed}개 수정`);
    if (failList.length > 0) failList.forEach(l => console.log(l));
    report.push({ name, pass: unitPass, total: files.length, fixed: unitFixed, fails: failList });
  }

  // Final summary
  console.log('\n\n========== 최종 검수 결과 ==========');
  let grandPass = 0, grandTotal = 0;
  for (const r of report) {
    grandPass += r.pass;
    grandTotal += r.total;
    const ok = r.pass === r.total ? '✅' : '❌';
    console.log(`${ok} ${r.name}: ${r.pass}/${r.total} (${r.fixed}개 수정)`);
  }
  console.log(`\n총계: ${grandPass}/${grandTotal}`);
  if (grandPass === grandTotal) {
    console.log('\n🎉🎉 전체 통과! 직선~원의방정식 전 단계 검수 완료!');
  } else {
    console.log(`\n⚠ ${grandTotal - grandPass}개 미해결. 개별 확인 필요.`);
  }
}

main().catch(console.error);
