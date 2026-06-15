#!/usr/bin/env node
/**
 * 06단계: cards/*.json → 앱이 import 하는 단일 번들 src/data/exam_predict/exam_predict_bundle.json
 * 구조: { built_at, count, schools:[ { slug, school, region, analysis, price, rounds:[{round, problems[]}] } ] }
 *  - analysis 는 무료 공개(미리보기), rounds(예상문제)는 유료.
 *  - 현재 학교당 1회분(round 1). 2·3회분 생성되면 같은 slug 로 rounds 에 누적되도록 병합.
 */
const fs = require('fs');
const path = require('path');
const C = require('./lib/config.cjs');

const PRICE = parseInt(process.env.EXAM_PRICE || '5000', 10);
const OUT = path.join(C.OUT_BASE, 'exam_predict_bundle.json');

function run() {
  C.ensureDirs();
  const files = fs.readdirSync(C.STAGES.cards).filter(f => f.endsWith('.json') && f !== '_index.json');
  const schools = [];
  for (const f of files) {
    try {
      const card = JSON.parse(fs.readFileSync(path.join(C.STAGES.cards, f), 'utf8'));
      // 다회차 지원: predicted.rounds(=[[문제],[문제],...]) 가 있으면 사용, 없으면 단일 회차
      const roundArrays = Array.isArray(card.predicted.rounds) && card.predicted.rounds.length
        ? card.predicted.rounds
        : [card.predicted.problems];
      schools.push({
        slug: f.replace('.json', ''),
        school: card.school,
        region: card.region || null,
        analysis: card.analysis,                       // 무료 공개
        price: PRICE,
        rounds: roundArrays.map((problems, i) => ({ round: i + 1, problems })),  // 유료
      });
    } catch (e) { console.log(`  ✗ ${f}: ${e.message}`); }
  }
  schools.sort((a, b) => a.school.localeCompare(b.school, 'ko'));
  fs.writeFileSync(OUT, JSON.stringify({ built_at: new Date().toISOString(), count: schools.length, schools }, null, 2));
  console.log(`[06] 번들 ${schools.length}개 학교 → ${path.relative(C.REPO, OUT)}`);
}

run();
