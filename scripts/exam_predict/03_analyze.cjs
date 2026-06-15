#!/usr/bin/env node
/**
 * 03단계: extracted/<school>.json → analysis/<school>.json (순수 JS, LLM 불필요).
 * 산출: 단원별 출제비중(%), 객/서 비율, 난이도 분포, 많이 나온 단원 TOP, 총평(난이도/변별력 별점 추정).
 * 이 통계가 포스터의 파이차트/총평/처방, 그리고 04단계 생성의 '비중 명세'가 된다.
 *
 * 사용: node scripts/exam_predict/03_analyze.cjs ["풍산"]
 */
const path = require('path');
const fs = require('fs');
const C = require('./lib/config.cjs');

const filter = process.argv[2];

function pct(n, total) { return total ? Math.round((n / total) * 100) : 0; }

// 추출 단원이 "순열, 조합"처럼 복수일 수 있음 → 주 단원 하나로 정규화.
function primaryUnit(u) {
  if (!u) return '기타';
  return String(u).split(/[,/·]|및|와|과\s/)[0].trim() || '기타';
}

function analyze(exam) {
  const ps = exam.problems || [];
  const total = ps.length || 1;

  const byUnit = {};
  for (const p of ps) { const u = primaryUnit(p.unit); byUnit[u] = (byUnit[u] || 0) + 1; }
  const unitShare = Object.entries(byUnit)
    .map(([unit, count]) => ({ unit, count, percent: pct(count, total) }))
    .sort((a, b) => b.count - a.count);

  const objCount = ps.filter(p => p.type === '객관식').length;
  const subjCount = ps.filter(p => p.type !== '객관식').length;
  const advanced = ps.filter(p => p.level === '심화').length;

  // 변별력/난이도 추정: 심화 비율 + 서술형 비율 기반(1~5 별점)
  const advRatio = advanced / total, subjRatio = subjCount / total;
  const difficulty = Math.max(1, Math.min(5, Math.round(3 + advRatio * 3 - 0.5)));
  const discrimination = Math.max(1, Math.min(5, Math.round(3 + advRatio * 2 + subjRatio * 3)));

  return {
    school: exam.school, year: exam.year, grade: exam.grade, term: exam.term, subject: exam.subject,
    total_problems: ps.length,
    unit_share: unitShare,                       // 파이차트
    top_units: unitShare.slice(0, 5).map(u => u.unit),
    objective_ratio: pct(objCount, total),
    subjective_ratio: pct(subjCount, total),
    advanced_ratio: pct(advanced, total),
    difficulty_stars: difficulty,                // 총평 별점
    discrimination_stars: discrimination,
    summary: `${exam.school} 기말은 ${unitShare.slice(0,2).map(u=>u.unit).join('·')} 비중이 높고 `
      + `서술형 ${pct(subjCount,total)}%·심화 ${pct(advanced,total)}% 로 ${difficulty>=4?'변별력이 큰':'표준적인'} 시험.`,
    analyzed_at: new Date().toISOString(),
  };
}

function run() {
  C.ensureDirs();
  let files = fs.readdirSync(C.STAGES.extracted).filter(f => f.endsWith('.json'));
  if (filter) files = files.filter(f => f.includes(filter));
  console.log(`[03] 분석 대상 ${files.length}개`);
  let ok = 0;
  for (const f of files) {
    try {
      const exam = JSON.parse(fs.readFileSync(path.join(C.STAGES.extracted, f), 'utf8'));
      const a = analyze(exam);
      fs.writeFileSync(path.join(C.STAGES.analysis, f), JSON.stringify(a, null, 2));
      console.log(`  ✓ ${a.school}: ${a.total_problems}문항, TOP ${a.top_units.slice(0,3).join('/')} (난이도 ${a.difficulty_stars}★)`);
      ok++;
    } catch (e) { console.log(`  ✗ ${f}: ${e.message}`); C.logFailure('03_analyze', f, f, e); }
  }
  console.log(`[03] 완료 ok=${ok}`);
}

if (require.main === module) run();
module.exports = { analyze };
