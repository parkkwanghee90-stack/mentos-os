#!/usr/bin/env node
/**
 * 05단계: analysis + predicted → cards/<school>.json (앱 카드/포스터용 최종 데이터).
 * 앱의 '전국 고1 1학기 기말 예상문제' 코스 카드와 포스터(분석 인포그래픽 + 예상문제 N선)가
 * 이 한 파일만 읽으면 렌더되도록 합친다. 실제 기출 본문(extracted)은 포함하지 않는다.
 *
 * 사용: node scripts/exam_predict/05_assemble.cjs ["풍산"]
 */
const path = require('path');
const fs = require('fs');
const C = require('./lib/config.cjs');

const filter = process.argv[2];

function assemble(analysis, predicted) {
  return {
    schema: 'exam_predict_card@1',
    school: analysis.school, region: analysis.region || null,
    year: analysis.year, grade: analysis.grade, term: analysis.term, subject: analysis.subject,
    // 포스터 '분석 인포그래픽' 블록
    analysis: {
      difficulty_stars: analysis.difficulty_stars,
      discrimination_stars: analysis.discrimination_stars,
      unit_share: analysis.unit_share,
      top_units: analysis.top_units,
      objective_ratio: analysis.objective_ratio,
      subjective_ratio: analysis.subjective_ratio,
      summary: analysis.summary,
    },
    // 포스터 '예상문제 N선' + 앱 풀이용
    predicted: {
      count: predicted.count,
      problems: predicted.problems,   // {num,unit,level,type,latex,choices,answer,solution,wrong_point}
    },
    built_at: new Date().toISOString(),
  };
}

function run() {
  C.ensureDirs();
  let files = fs.readdirSync(C.STAGES.predicted).filter(f => f.endsWith('.json'));
  if (filter) files = files.filter(f => f.includes(filter));
  console.log(`[05] 카드 조립 대상 ${files.length}개`);
  const index = [];
  let ok = 0;
  for (const f of files) {
    try {
      const predicted = JSON.parse(fs.readFileSync(path.join(C.STAGES.predicted, f), 'utf8'));
      const aPath = path.join(C.STAGES.analysis, f);
      if (!fs.existsSync(aPath)) { console.log(`  ✗ ${f}: analysis 없음`); continue; }
      const analysis = JSON.parse(fs.readFileSync(aPath, 'utf8'));
      const card = assemble(analysis, predicted);
      fs.writeFileSync(path.join(C.STAGES.cards, f), JSON.stringify(card, null, 2));
      index.push({ school: card.school, file: f, count: card.predicted.count, top_units: card.analysis.top_units.slice(0, 3) });
      console.log(`  ✓ ${card.school}`);
      ok++;
    } catch (e) { console.log(`  ✗ ${f}: ${e.message}`); C.logFailure('05_assemble', f, f, e); }
  }
  // 앱이 학교 목록을 한 번에 읽을 인덱스
  fs.writeFileSync(path.join(C.STAGES.cards, '_index.json'),
    JSON.stringify({ built_at: new Date().toISOString(), schools: index.sort((a,b)=>a.school.localeCompare(b.school,'ko')) }, null, 2));
  console.log(`[05] 완료 ok=${ok} → cards/_index.json (${index.length}개 학교)`);
}

if (require.main === module) run();
module.exports = { assemble };
