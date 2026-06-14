#!/usr/bin/env node
// 단원별 답안키 시프트 오프셋 판정.
// 사용: node scripts/analyze_shift.cjs <results.json> <jobs.json>
// 에이전트 도출답(correctAnswer/answerLatex)을 avs_answers[unit][pid+offset]와 대조해
// 단원마다 가장 잘 맞는 offset을 찾는다 (0=정상, +1=키가 +1 시프트됨).
const fs = require('fs');
const ROOT = '/Users/mac/mathmentos';
const avs = JSON.parse(fs.readFileSync(`${ROOT}/src/data/avs_answers.json`, 'utf8'));

const resPath = process.argv[2], jobsPath = process.argv[3];
const raw = JSON.parse(fs.readFileSync(resPath, 'utf8'));
const results = Array.isArray(raw) ? raw : (raw.result || raw);
const jobs = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));

// 수학 답 정규화: 공백/$/괄호/\left\right 제거, ln·sqrt·pi 통일, \frac{a}{b}->(a)/(b), \cdot/\times 제거
function norm(v) {
  if (v == null) return '';
  let s = String(v);
  s = s.replace(/[①②③④⑤]/g, m => ({ '①': '1', '②': '2', '③': '3', '④': '4', '⑤': '5' }[m]));
  s = s.replace(/\\left|\\right|\\,|\\!|\\;|\\ /g, '');
  s = s.replace(/\\dfrac|\\tfrac/g, '\\frac');
  s = s.replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '($1)/($2)');
  s = s.replace(/\\ln/g, 'ln').replace(/\\log/g, 'log').replace(/\\sqrt/g, 'sqrt');
  s = s.replace(/\\pi/g, 'pi').replace(/π/g, 'pi').replace(/√/g, 'sqrt');
  s = s.replace(/\\cdot|\\times|\*/g, '').replace(/\\mathbf|\\boxed/g, '');
  s = s.replace(/[{}$\s]/g, '').replace(/번$/, '').replace(/^=+|=+$/g, '');
  return s.toLowerCase();
}

// 도출답 후보 (둘 중 하나라도 맞으면 매치)
function derivedCandidates(r) {
  return [r && r.correctAnswer, r && r.answerLatex].filter(Boolean).map(norm).filter(Boolean);
}

// group by unit
const byUnit = {};
for (let i = 0; i < results.length; i++) {
  const job = jobs[i];
  if (!job) continue;
  (byUnit[job.hk] = byUnit[job.hk] || []).push({ pid: job.pid, r: results[i] });
}

const OFFSETS = [0, 1, -1, 2, -2];
console.log('unit | best_off | match/total | status(a/m/u) | (offset별 매치수)');
const report = {};
for (const [hk, rows] of Object.entries(byUnit)) {
  const key = avs[hk] || {};
  const counts = {};
  for (const off of OFFSETS) counts[off] = 0;
  let na = 0, nm = 0, nu = 0;
  for (const { pid, r } of rows) {
    if (!r) continue;
    if (r.status === 'authored') na++; else if (r.status === 'mismatch') nm++; else nu++;
    const cands = derivedCandidates(r);
    if (!cands.length) continue;
    const n = parseInt(pid, 10);
    for (const off of OFFSETS) {
      const sk = String(n + off).padStart(3, '0');
      const stored = key[sk];
      if (stored != null && cands.includes(norm(stored))) counts[off]++;
    }
  }
  // best offset
  let best = 0, bestC = -1;
  for (const off of OFFSETS) if (counts[off] > bestC) { bestC = counts[off]; best = off; }
  const total = rows.filter(x => x.r).length;
  report[hk] = { best, match: bestC, total, na, nm, nu, counts };
  console.log(`${hk.split('_')[1].padEnd(14)} | ${String(best).padStart(2)} | ${bestC}/${total} | ${na}/${nm}/${nu} | ${JSON.stringify(counts)}`);
}
fs.writeFileSync(`${ROOT}/scripts/shift_report.json`, JSON.stringify(report, null, 2));
console.log('\n→ scripts/shift_report.json 기록');
