import { HOMEWORK_UNITS, getHomeworkRange, getUnitById } from '@/data/homeworkSSOT';
import { resolveAnswer } from '@/services/answerResolver';
import { getActiveWrongAnswers, addWrong, markResolved } from '@/services/wrongAnswerStore';
import { analyzeMathWeakness } from '@/engine/math/mathWeaknessReporter';
import { queueParentPush } from '@/services/pushService';

const MONTHLY_TARGET = 40;

/**
 * 30일 누적 오답 우선 + 취약단원 보충으로 40문항 생성.
 * 정답이 없는 문제(resolveAnswer===null)는 제외.
 */
export function generateMonthlyTestProblems(studentLevel = '4~5등급') {
  const problems = [];
  const seen = new Set();

  const pushProblem = (hwUnit, num) => {
    if (problems.length >= MONTHLY_TARGET) return;
    const numStr = String(num).padStart(3, '0');
    const key = `${hwUnit.id}_${numStr}`;
    if (seen.has(key)) return;
    const ans = resolveAnswer(hwUnit.answerKey, num);
    if (ans === null) return; // 정답 없는 문제 제외
    seen.add(key);
    problems.push({
      id: `monthly_${key}_${num}`,
      hwId: hwUnit.id,
      unit: hwUnit.relatedUnit || hwUnit.title,
      num,
      numStr,
      imagePath: `${hwUnit.imagePath}${numStr}.webp`,
      solutionPath: `${hwUnit.imagePath}${numStr}a.webp`,
      hintKey: hwUnit.hintKey,
      correctAnswer: ans,
      answerKey: hwUnit.answerKey,
    });
  };

  // 1. 누적 오답 우선
  for (const e of getActiveWrongAnswers()) {
    if (problems.length >= MONTHLY_TARGET) break;
    const unit = getUnitById(e.hwId);
    if (unit) pushProblem(unit, e.num);
  }

  // 2. 취약단원 보충
  if (problems.length < MONTHLY_TARGET) {
    const top = analyzeMathWeakness().top3.map(w => w.unit);
    for (const unitName of top) {
      const hwUnit = HOMEWORK_UNITS.find(h => h.title === unitName || h.parentUnit === unitName);
      if (!hwUnit) continue;
      const range = getHomeworkRange(hwUnit, studentLevel);
      for (let n = range.start; n <= range.end && problems.length < MONTHLY_TARGET; n++) pushProblem(hwUnit, n);
    }
  }

  // 3. 그래도 부족하면 전 단원에서 보충
  if (problems.length < MONTHLY_TARGET) {
    for (const hwUnit of HOMEWORK_UNITS) {
      if (problems.length >= MONTHLY_TARGET) break;
      const range = getHomeworkRange(hwUnit, studentLevel);
      for (let n = range.start; n <= range.end && problems.length < MONTHLY_TARGET; n++) pushProblem(hwUnit, n);
    }
  }

  return problems;
}

/** 채점 (격주 엔진과 동일한 비교 규칙) */
export function gradeMonthlyTest(userAnswers, assignedProblems) {
  let correctCount = 0;
  const unitResults = {};
  const problemDetails = assignedProblems.map(p => {
    const u = String(userAnswers[p.id] || '').trim();
    const c = String(p.correctAnswer || '').trim();
    const isCorrect = u.length > 0 && u === c;
    if (isCorrect) correctCount++;
    if (!unitResults[p.unit]) unitResults[p.unit] = { total: 0, correct: 0 };
    unitResults[p.unit].total++;
    if (isCorrect) unitResults[p.unit].correct++;
    return { ...p, userAnswer: u, isCorrect };
  });
  const totalCount = assignedProblems.length;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const unitDiagnoses = Object.entries(unitResults).map(([unit, s]) => ({
    unit,
    testAccuracy: Math.round((s.correct / s.total) * 100),
  }));
  return { accuracy, correctCount, totalCount, problemDetails, unitDiagnoses };
}

/**
 * 채점 결과를 오답스토어에 동기화.
 * 오답 → addWrong, 정답 → markResolved. hw_progress(숙제 진도)는 건드리지 않는다.
 */
export function recordMonthlyTestWrongs(grading) {
  if (!grading || !Array.isArray(grading.problemDetails)) return;
  try {
    grading.problemDetails.forEach(p => {
      if (!p || !p.hwId || p.num == null) return;
      if (p.isCorrect) {
        markResolved(p.hwId, p.num);
      } else if (p.answerKey) {
        addWrong({ hwId: p.hwId, num: p.num, unit: p.unit, answerKey: p.answerKey });
      }
    });
  } catch (err) {
    console.warn('[monthlyTest] 오답스토어 동기화 실패:', err.message);
  }
}

/** 학부모 월간 리포트 메시지 */
export function buildMonthlyParentMessage(studentName, gradingResult) {
  const dateStr = new Date().toLocaleDateString('ko-KR');
  let units = '';
  gradingResult.unitDiagnoses.forEach((d, i) => {
    units += `${i + 1}. ${d.unit}: ${d.testAccuracy}%\n`;
  });
  return `[학부모 알림 - 수학 월간 리포트]
📢 ${studentName} 학생이 '수학 월간 종합테스트'를 제출했습니다! (${dateStr})
📊 총점: ${gradingResult.accuracy}점 (${gradingResult.correctCount}/${gradingResult.totalCount})
📈 단원별 성취도:
${units}자세한 분석은 앱 대시보드 리포트에서 확인하실 수 있습니다.`;
}

/** 월간 리포트 학부모 발송 */
export function sendMonthlyParentPush(studentName, gradingResult) {
  const msg = buildMonthlyParentMessage(studentName, gradingResult);
  queueParentPush(msg);
  return msg;
}
