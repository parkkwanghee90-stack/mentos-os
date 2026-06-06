/**
 * mathWeaknessReporter.js
 * 수학 전용 오답 극복 분석 및 격주 단원점검테스트 엔진 v1.0
 */

import { HOMEWORK_UNITS, getHomeworkRange } from '@/data/homeworkSSOT';
import { resolveAnswer } from '@/services/answerResolver';
import { queueParentPush } from '@/services/pushService';
import { getActiveWrongAnswers } from '@/services/wrongAnswerStore';

/**
 * 1. 최근 학습 오답 데이터 취합 및 단원별 취약성 분석
 */
export function analyzeMathWeakness() {
  const lessonHistory = JSON.parse(localStorage.getItem('mentos_lesson_results') || '[]');
  const unitStats = {};
  const countedKeys = new Set(); // 소스 B에서 센 (hwId:num) — 입력 C 중복 방지

  // A. 수업 오답 집계 (수학 + 미적분 + 확통 + 기하 과목 포함)
  const MATH_SUBJECTS = ['수학', '미적분', '확률과통계', '기하', '수학(상)', '수학1', '수학2'];
  lessonHistory.forEach(lh => {
    if (!MATH_SUBJECTS.includes(lh.subject)) return;
    const unit = lh.unit || '공통수학';
    if (!unitStats[unit]) {
      unitStats[unit] = { totalQuestions: 0, correctCount: 0, wrongCount: 0, wrongIndices: [] };
    }
    unitStats[unit].totalQuestions += lh.totalQuestions || 0;
    unitStats[unit].correctCount += lh.correctCount || 0;
    
    // 오답 리스트 추출
    const wrongList = lh.wrongQuestions?.map(q => q.problemId || q.id) || [];
    unitStats[unit].wrongCount += wrongList.length;
    unitStats[unit].wrongIndices = [...new Set([...unitStats[unit].wrongIndices, ...wrongList])];
  });

  // B. 숙제 오답 집계
  HOMEWORK_UNITS.forEach(hw => {
    const progress = JSON.parse(localStorage.getItem(`hw_progress_${hw.id}`) || '{}');
    const answeredCount = Object.keys(progress).length;
    if (answeredCount === 0) return;

    // relatedUnit으로 단원명 정규화 (수업 기록의 unit과 매칭)
    const unit = hw.relatedUnit || hw.title;
    if (!unitStats[unit]) {
      unitStats[unit] = { totalQuestions: 0, correctCount: 0, wrongCount: 0, wrongIndices: [] };
    }

    Object.entries(progress).forEach(([pid, data]) => {
      unitStats[unit].totalQuestions++;
      if (data.isCorrect) {
        unitStats[unit].correctCount++;
      } else {
        unitStats[unit].wrongCount++;
        unitStats[unit].wrongIndices.push(parseInt(pid, 10));
        countedKeys.add(`${hw.id}:${parseInt(pid, 10)}`);
      }
    });
    unitStats[unit].wrongIndices = [...new Set(unitStats[unit].wrongIndices)];
  });

  // C. 시험(모의고사) 오답 집계 — 오답스토어. 숙제에서 이미 센 (hwId,num)은 제외.
  try {
    for (const e of getActiveWrongAnswers()) {
      if (e.resolved) continue;
      const key = `${e.hwId}:${e.num}`;
      if (countedKeys.has(key)) continue;
      countedKeys.add(key);
      const unit = e.unit || '공통수학';
      if (!unitStats[unit]) {
        unitStats[unit] = { totalQuestions: 0, correctCount: 0, wrongCount: 0, wrongIndices: [] };
      }
      unitStats[unit].totalQuestions++;
      unitStats[unit].wrongCount++;
      unitStats[unit].wrongIndices.push(e.num);
    }
  } catch (err) {
    console.warn('[analyzeMathWeakness] 오답스토어 집계 실패:', err.message);
  }

  // D. 취약성 데이터 정렬 및 유형화
  const weaknessList = Object.entries(unitStats).map(([unit, stat]) => {
    const total = stat.totalQuestions;
    const wrong = stat.wrongCount;
    const errorRate = total > 0 ? Math.round((wrong / total) * 100) : 0;
    
    // 구체적 오답 분석 처방
    let tag = "연산 실수";
    if (errorRate >= 60) tag = "개념 결손 및 응용 한계";
    else if (errorRate >= 40) tag = "수식 전개 및 조건 해석 오류";
    else if (errorRate >= 20) tag = "단순 마킹 및 계산 착오";

    return {
      unit,
      total,
      wrong,
      errorRate,
      wrongIndices: stat.wrongIndices.sort((a,b) => a-b),
      tag
    };
  }).filter(item => item.wrong > 0);

  // 취약 단원 TOP 3 (오답률 및 오답 수 기준 정렬)
  const topWeakUnits = [...weaknessList]
    .sort((a, b) => b.wrong - a.wrong || b.errorRate - a.errorRate)
    .slice(0, 3);

  return {
    allWeakness: weaknessList,
    top3: topWeakUnits
  };
}

/**
 * 2. 격주 테스트 대비 13일차 수학 20문항 자동 예약/배정 엔진
 */
export function generateFortnightlyTestProblems(studentLevel = '4~5등급') {
  console.log('[Fortnightly Test Generator] Generating 20 problems for student level:', studentLevel);
  const weakness = analyzeMathWeakness();
  const top3 = weakness.top3;

  let targetUnits = top3.map(w => w.unit);
  
  // 만약 취약 단원이 전혀 없다면 학생 과목에 맞는 기본 단원에서 배정
  if (targetUnits.length === 0) {
    // 미적분 숙제가 존재하는지 확인하여 과목 자동 판별
    const hasCalcProgress = HOMEWORK_UNITS.some(h => h.id?.startsWith('hw_cal_') && 
      Object.keys(JSON.parse(localStorage.getItem(`hw_progress_${h.id}`) || '{}')).length > 0);
    targetUnits = hasCalcProgress 
      ? ['수열의 극한', '급수', '도함수의 활용 1']
      : ['다항식의 연산', '항등식과 나머지정리', '이차방정식과 이차함수'];
  }

  const assignedProblems = [];

  // 13개 단원 숙제 SSOT 매칭 검색하여 단원별로 넉넉하게 7문제씩 우선 발췌
  for (const unitName of targetUnits) {
    const hwUnit = HOMEWORK_UNITS.find(h => h.title === unitName || h.parentUnit === unitName);
    if (!hwUnit) continue;

    const range = getHomeworkRange(hwUnit, studentLevel);
    const progress = JSON.parse(localStorage.getItem(`hw_progress_${hwUnit.id}`) || '{}');

    // 1. 오답 및 미풀이 후보 수집
    const wrongList = Object.entries(progress)
      .filter(([pid, data]) => !data.isCorrect)
      .map(([pid]) => parseInt(pid, 10));

    const candidateNums = [];
    const isAdvancedStudent = studentLevel === '1~2등급' || studentLevel === '3등급';
    const startNum = isAdvancedStudent ? Math.max(range.start, 11) : range.start;
    const endNum = range.end;

    for (let num = startNum; num <= endNum; num++) {
      if (wrongList.includes(num)) {
        candidateNums.push({ num, isWrongHistory: true });
      } else if (!progress[num] || !progress[num].isCorrect) {
        candidateNums.push({ num, isWrongHistory: false });
      }
    }

    // 셔플 후 오답 우선으로 최대 7개 선택
    const selected = candidateNums
      .sort((a, b) => (b.isWrongHistory ? 1 : 0) - (a.isWrongHistory ? 1 : 0) || Math.random() - 0.5)
      .slice(0, 7);

    selected.forEach(candidate => {
      if (assignedProblems.length >= 20) return;
      
      const pNumStr = String(candidate.num).padStart(3, '0');
      const ansKey = hwUnit.answerKey;
      const rawAnswer = resolveAnswer(ansKey, candidate.num);
      if (rawAnswer === null) return; // 정답 없으면 출제 제외

      assignedProblems.push({
        id: `fort_${hwUnit.id}_${pNumStr}_${Date.now()}`,
        hwId: hwUnit.id,
        unit: unitName,
        num: candidate.num,
        numStr: pNumStr,
        imagePath: `${hwUnit.imagePath}${pNumStr}.webp`,
        solutionPath: `${hwUnit.imagePath}${pNumStr}a.webp`,
        hintKey: hwUnit.hintKey,
        correctAnswer: rawAnswer,
        isWrongHistory: candidate.isWrongHistory
      });
    });

    if (assignedProblems.length >= 20) break;
  }

  // 예외 상황: 20문제가 덜 찼다면 HOMEWORK_UNITS 전체에서 미중복 문제를 20개 빌드할 때까지 지능적으로 보충
  if (assignedProblems.length < 20) {
    for (const fillUnit of HOMEWORK_UNITS) {
      if (assignedProblems.length >= 20) break;
      const range = getHomeworkRange(fillUnit, studentLevel);
      
      for (let num = range.start; num <= range.end; num++) {
        if (assignedProblems.length >= 20) break;
        const pNumStr = String(num).padStart(3, '0');
        const isAlreadyAdded = assignedProblems.some(p => p.hwId === fillUnit.id && p.numStr === pNumStr);
        if (isAlreadyAdded) continue;

        const rawAnswer = resolveAnswer(fillUnit.answerKey, num);
        if (rawAnswer === null) continue; // 정답 없으면 출제 제외
        assignedProblems.push({
          id: `fort_${fillUnit.id}_${pNumStr}_${Date.now()}`,
          hwId: fillUnit.id,
          unit: fillUnit.title,
          num: num,
          numStr: pNumStr,
          imagePath: `${fillUnit.imagePath}${pNumStr}.webp`,
          solutionPath: `${fillUnit.imagePath}${pNumStr}a.webp`,
          hintKey: fillUnit.hintKey,
          correctAnswer: rawAnswer,
          isWrongHistory: false
        });
      }
    }
  }

  return assignedProblems;
}

/**
 * 3. 격주 단원점검테스트 채점 및 성취 개선도 분석 진단
 */
export function gradeFortnightlyTest(userAnswers, assignedProblems) {
  let correctCount = 0;
  const problemDetails = [];
  const unitResults = {};

  assignedProblems.forEach(p => {
    const userAnsClean = String(userAnswers[p.id] || '').trim();
    const correctAnsClean = String(p.correctAnswer || '').trim();
    
    // 정밀 1:1 문자열 대조
    const isCorrect = userAnsClean.length > 0 && userAnsClean === correctAnsClean;
    if (isCorrect) correctCount++;

    problemDetails.push({
      ...p,
      userAnswer: userAnsClean,
      isCorrect
    });

    // 단원별 채점 통계 누적
    if (!unitResults[p.unit]) {
      unitResults[p.unit] = { total: 0, correct: 0 };
    }
    unitResults[p.unit].total++;
    if (isCorrect) unitResults[p.unit].correct++;
  });

  const accuracy = Math.round((correctCount / assignedProblems.length) * 100);

  // 단원별 성취 개선도 판정
  const weakness = analyzeMathWeakness();
  const unitDiagnoses = Object.entries(unitResults).map(([unitName, stat]) => {
    const testAccuracy = Math.round((stat.correct / stat.total) * 100);
    
    // 이전 오답률 대조
    const prevWeak = weakness.allWeakness.find(w => w.unit === unitName);
    const prevErrorRate = prevWeak ? prevWeak.errorRate : 60; // 기본값 60% 가정

    // 이번 테스트 오답률 계산
    const testErrorRate = 100 - testAccuracy;
    
    // 판정 알고리즘
    let isImproved = false;
    let desc = "보강 필요 (그대로임 ⚠️)";
    
    if (testAccuracy >= 80 || testErrorRate <= prevErrorRate - 20) {
      isImproved = true;
      desc = "실력 개선됨 (나아짐! ✅)";
    }

    return {
      unit: unitName,
      prevErrorRate,
      testAccuracy,
      isImproved,
      desc
    };
  });

  return {
    accuracy,
    correctCount,
    totalCount: assignedProblems.length,
    problemDetails,
    unitDiagnoses
  };
}

/**
 * 4. 학부모 실시간 Push 극복 리포트 발송 서비스
 */
export function sendFortnightlyParentPush(studentName, gradingResult) {
  const dateStr = new Date().toLocaleDateString('ko-KR');
  
  let unitReportText = "";
  gradingResult.unitDiagnoses.forEach((diag, i) => {
    unitReportText += `${i + 1}. ${diag.unit}\n`;
    unitReportText += `   - 이전 오답률: ${diag.prevErrorRate}%\n`;
    unitReportText += `   - 격주 테스트 성취도: ${diag.testAccuracy}%\n`;
    unitReportText += `   - 진단 결과: ${diag.desc}\n`;
  });

  const pushMsg = `[학부모 알림 - 수학 격주 리포트]
📢 ${studentName} 학생이 격주 '수학 단원점검테스트'를 제출했습니다! (${dateStr})

📊 총 점수: ${gradingResult.accuracy}점 (${gradingResult.correctCount}/${gradingResult.totalCount}문제 정답)

📈 지난 2주간의 취약 단원 극복 성취도 분석:
${unitReportText}
💡 AI 종합 처방전:
${gradingResult.accuracy >= 80 
  ? "자주 틀리던 고난이도 유형을 완벽하게 격파했습니다! 실력이 비약적으로 성장하였으며, 다음 개념 융합 단계로 수월하게 진입이 가능합니다."
  : "실력이 일부 향상되었으나 여전히 몇몇 개념의 수식 전개에서 실수가 발견됩니다. 오답 오버랩 보강 클리닉 문제집과 1:1 AI 튜터 매칭 세션을 긴급 지원하였습니다."}

자세한 분석과 오답 노트 해설 동영상(AVS) 시청 현황은 앱 내 대시보드 리포트에서 확인하실 수 있습니다.`;

  const _weakUnit = [...gradingResult.unitDiagnoses].sort((a, b) => a.testAccuracy - b.testAccuracy)[0];
  const _gradeOf = (s) => (s >= 90 ? '1등급' : s >= 80 ? '2등급' : s >= 70 ? '3등급' : s >= 60 ? '4등급' : '5등급 이하');
  queueParentPush(pushMsg, {
    templateKey: 'weeklyTest', // 주간테스트결과
    variables: {
      '#{name}': studentName,
      '#{range}': gradingResult.unitDiagnoses.map(d => d.unit).join(', ') || '이번 점검 범위',
      '#{score}': String(gradingResult.accuracy),
      '#{grade}': _gradeOf(gradingResult.accuracy),
      '#{weak}': _weakUnit ? _weakUnit.unit : '-',
      '#{comment}': gradingResult.accuracy >= 80 ? '고난이도 유형을 잘 격파했습니다.' : '수식 전개 실수 보강이 필요합니다.',
    },
  });
  console.log('[Fortnightly Push Sent Successfully]', pushMsg);
  return pushMsg;
}
