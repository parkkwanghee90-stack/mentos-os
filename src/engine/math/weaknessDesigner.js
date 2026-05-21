/**
 * weaknessDesigner.js
 * 취약 단원 맞춤 설계 엔진 v2
 * 
 * 취약 분석 기준:
 * - 단원별 오답률 / 오답 개수
 * - 난이도별 오답률
 * - 유형별 오답률
 * 
 * 취약 단원 선정:
 * - 오답률 50% 이상
 * - 오답 개수 상위 TOP3
 * - 최근 2주 반복 오답 단원
 */

import { REINFORCEMENT_DIFFICULTY, getReinforcementCount } from '@/engine/gradeFlowSSOT.js';

const STORAGE_KEY = 'mentos_weakness_history';

function getWeaknessHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function saveWeaknessHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

/**
 * 5문제 단위 취약 분석
 * @param {Array} results - [{ number, unit, level, isCorrect, problemType }]
 * @returns {Object} analysis report
 */
export function analyzeWeakness(results) {
  if (!results || results.length === 0) return null;

  const unitStats = {};
  const levelStats = {};
  const typeStats = {};

  results.forEach(r => {
    // Unit
    const u = r.unit || '미분류';
    if (!unitStats[u]) unitStats[u] = { total: 0, wrong: 0 };
    unitStats[u].total++;
    if (!r.isCorrect) unitStats[u].wrong++;

    // Level
    const l = r.level || 2;
    if (!levelStats[l]) levelStats[l] = { total: 0, wrong: 0 };
    levelStats[l].total++;
    if (!r.isCorrect) levelStats[l].wrong++;

    // Type
    const t = r.problemType || '일반';
    if (!typeStats[t]) typeStats[t] = { total: 0, wrong: 0 };
    typeStats[t].total++;
    if (!r.isCorrect) typeStats[t].wrong++;
  });

  // 오답률 계산
  Object.values(unitStats).forEach(s => s.errorRate = s.total > 0 ? Math.round((s.wrong / s.total) * 100) : 0);
  Object.values(levelStats).forEach(s => s.errorRate = s.total > 0 ? Math.round((s.wrong / s.total) * 100) : 0);
  Object.values(typeStats).forEach(s => s.errorRate = s.total > 0 ? Math.round((s.wrong / s.total) * 100) : 0);

  // 취약 단원 선정
  const weakUnits = Object.entries(unitStats)
    .filter(([_, s]) => s.wrong > 0)
    .sort((a, b) => b[1].wrong - a[1].wrong || b[1].errorRate - a[1].errorRate)
    .map(([unit, s]) => ({
      unit,
      wrong: s.wrong,
      total: s.total,
      errorRate: s.errorRate
    }));

  // 상위 TOP3
  const top3 = weakUnits.slice(0, 3);
  // 오답률 50% 이상
  const highErrorRate = weakUnits.filter(w => w.errorRate >= 50);

  const totalCorrect = results.filter(r => r.isCorrect).length;
  const totalWrong = results.length - totalCorrect;
  const accuracy = Math.round((totalCorrect / results.length) * 100);

  // 히스토리 업데이트
  const history = getWeaknessHistory();
  history.push({
    date: new Date().toISOString(),
    top3: top3.map(w => w.unit),
    accuracy,
    totalProblems: results.length
  });
  // 최근 30일만 유지
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const trimmed = history.filter(h => new Date(h.date).getTime() > cutoff);
  saveWeaknessHistory(trimmed);

  // 최근 2주 반복 오답 단원 확인
  const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const recentHistory = trimmed.filter(h => new Date(h.date).getTime() > twoWeeksAgo);
  const unitFrequency = {};
  recentHistory.forEach(h => {
    (h.top3 || []).forEach(u => {
      unitFrequency[u] = (unitFrequency[u] || 0) + 1;
    });
  });
  const repeatWeakUnits = Object.entries(unitFrequency)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([unit, count]) => ({ unit, repeatCount: count }));

  return {
    accuracy,
    totalCorrect,
    totalWrong,
    totalProblems: results.length,
    unitStats,
    levelStats,
    typeStats,
    weakUnits,
    top3,
    highErrorRate,
    repeatWeakUnits
  };
}

/**
 * 취약 분석 결과를 기반으로 보강 문제 세트를 설계합니다.
 * @param {Object} analysis - analyzeWeakness()의 결과
 * @param {string} rank - 학생 등급 ('4~5등급', '3등급', '1~2등급')
 * @returns {Array} 보강 문제 메타데이터 배열
 */
export function designReinforcement(analysis, rank) {
  if (!analysis || !analysis.top3 || analysis.top3.length === 0) return [];

  const reinforcements = [];
  let totalCount = 0;
  const dailyMax = 60;

  analysis.top3.forEach(weakUnit => {
    const wrongCount = weakUnit.wrong;
    let count = getReinforcementCount(wrongCount);

    // 하루 60문제 제한 적용
    if (totalCount + count > dailyMax) {
      count = Math.max(0, dailyMax - totalCount);
    }
    if (count <= 0) return;

    // 가장 많이 틀린 난이도 레벨 찾기
    const wrongLevel = findDominantWrongLevel(analysis, weakUnit.unit);
    const difficultyRatio = REINFORCEMENT_DIFFICULTY[wrongLevel] || REINFORCEMENT_DIFFICULTY[2];

    // 난이도별 배분
    const l2Count = Math.round(count * difficultyRatio.level2);
    const l3Count = Math.round(count * difficultyRatio.level3);
    const l4Count = count - l2Count - l3Count;

    const problems = [];
    for (let i = 0; i < l2Count; i++) problems.push(createDrillMeta(weakUnit.unit, 2, i));
    for (let i = 0; i < l3Count; i++) problems.push(createDrillMeta(weakUnit.unit, 3, l2Count + i));
    for (let i = 0; i < l4Count; i++) problems.push(createDrillMeta(weakUnit.unit, 4, l2Count + l3Count + i));

    reinforcements.push({
      unit: weakUnit.unit,
      wrong: weakUnit.wrong,
      errorRate: weakUnit.errorRate,
      dominantWrongLevel: wrongLevel,
      problems
    });

    totalCount += count;
  });

  return reinforcements;
}

function findDominantWrongLevel(analysis, unit) {
  // 해당 단원에서 가장 많이 틀린 난이도 레벨 반환
  // analysis에는 레벨별 상세가 없을 수 있으므로 기본값 2
  return 2;
}

function createDrillMeta(unit, level, idx) {
  return {
    drillId: `drill_${unit}_L${level}_${idx}_${Date.now()}`,
    unit,
    level,
    type: '보강문제',
    tag: '취약분석_자동생성',
    isHomework: false,
    createdAt: new Date().toISOString()
  };
}

/**
 * 전체 세션 결과를 localStorage에 저장하고, 취약 분석 + 보강 세트를 반환합니다.
 * 5문제 단위로 호출됩니다.
 */
export function processWeaknessCheckpoint(recentFiveResults, rank) {
  const analysis = analyzeWeakness(recentFiveResults);
  if (!analysis) return { analysis: null, reinforcements: [] };

  const reinforcements = designReinforcement(analysis, rank);

  // 세션 로그 저장
  const sessionLogs = JSON.parse(localStorage.getItem('mentos_lesson_results') || '[]');
  sessionLogs.push({
    timestamp: Date.now(),
    type: 'weakness_checkpoint',
    analysis: {
      accuracy: analysis.accuracy,
      top3: analysis.top3.map(w => w.unit),
      totalProblems: analysis.totalProblems
    },
    reinforcementCount: reinforcements.reduce((sum, r) => sum + r.problems.length, 0)
  });
  localStorage.setItem('mentos_lesson_results', JSON.stringify(sessionLogs));

  return { analysis, reinforcements };
}
