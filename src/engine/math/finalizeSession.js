import { aggregateMathLessonResult, saveMathLessonResult } from './lessonResultAggregator.js';
import { generateMathHomework as generateUnitHomework } from '@/services/homeworkGenerator.js';
import { queueParentPush } from '@/services/pushService.js';

/**
 * 수학 수업 종료 처리(단일 오케스트레이터):
 *  1) 실제 채점 결과로 성취도 집계 (가짜 기본값 제거)
 *  2) 오답 단원(취약단원) 식별 → lessonResult에 주입
 *  3) 숙제: services 생성기 단일화(실제 단원 문제) + 세션-회차 dedupe
 *  4) 학부모 푸시: 실제 점수 + 실제 취약단원 문구
 *
 * @param session 수업 세션
 * @param opts { gradingHistory?, courseName?, teacherName?, teacherId? }
 *   gradingHistory 미전달 시 localStorage 'localGradingHistory'를 읽는다(모든 호출부 호환).
 */
export function finalizeMathSession(session, opts = {}) {
  // ── 실제 채점 데이터 확보 ──
  let graded = opts.gradingHistory;
  if (!Array.isArray(graded)) {
    try { graded = JSON.parse(localStorage.getItem('localGradingHistory') || '[]'); }
    catch { graded = []; }
  }
  const courseName  = opts.courseName  || session.courseName || '고등 수학';
  const teacherName = opts.teacherName || session.teacher   || 'AI 튜터';
  const teacherId   = opts.teacherId   || session.teacherId || 'default';

  const totalQuestions = graded.length;
  const totalCorrect   = graded.filter(h => h.isCorrect).length;
  const totalWrong     = totalQuestions - totalCorrect;
  const scorePercent   = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // ── 실제 성취도로 evalData 구성 (이전: 하드코딩 2/2·2/3·3/5 → 항상 70점 버그) ──
  const evalData = {
    core: { totalQuestions, correctCount: totalCorrect, wrongCount: totalWrong },
    step: { totalQuestions: 0, correctCount: 0, wrongCount: 0 },
    mock: { totalQuestions: 0, correctCount: 0, wrongCount: 0 },
  };
  const lessonResult = aggregateMathLessonResult(session, evalData, graded);

  // ── 취약단원: 이번 수업 오답을 단원별로 집계 ──
  const wrongByUnit = {};
  graded.filter(h => !h.isCorrect).forEach(h => {
    const u = h.unit || lessonResult.summary.coveredTopics[0] || '오늘 학습 단원';
    wrongByUnit[u] = (wrongByUnit[u] || 0) + 1;
  });
  const weakUnits = Object.keys(wrongByUnit).sort((a, b) => wrongByUnit[b] - wrongByUnit[a]);
  lessonResult.mistakeTags = weakUnits; // 다운스트림(분석/엔진)에 실제 취약 신호 주입
  lessonResult.summary.weakPoints = weakUnits.length
    ? weakUnits.map(u => `${u} 오답 ${wrongByUnit[u]}문항`)
    : ['오늘 학습 내용을 정확히 이해'];

  // ── 숙제 생성: services 단일화 + 세션-회차 dedupe(showReport/조기종료와 공유) ──
  const flagKey = `hw_generated_flag_${teacherId}_${session?.round || 1}`;
  let homeworkInfo = null;
  if (graded.length > 0 && !localStorage.getItem(flagKey)) {
    homeworkInfo = generateUnitHomework(graded, courseName, teacherName);
    if (homeworkInfo) localStorage.setItem(flagKey, 'true');
  }

  // ── 학부모 푸시: 실제 점수 + 실제 취약단원 ──
  const topics = lessonResult.summary.coveredTopics.join(', ');
  let achievementLine;
  let homeworkLine;
  if (totalQuestions === 0) {
    achievementLine = `오늘 수업을 마쳤습니다.`;
    homeworkLine = `다음 수업도 잘 부탁드립니다.`;
  } else if (weakUnits.length > 0) {
    achievementLine = `📊 오늘의 성취도: ${scorePercent}점 (${totalCorrect}/${totalQuestions}문제 정답)`;
    homeworkLine = `'${weakUnits[0]}'에서 ${totalWrong}문항 오답이 있어, 해당 단원 보강 숙제를 숙제함에 발송했습니다.`;
  } else {
    achievementLine = `📊 오늘의 성취도: ${scorePercent}점 (${totalCorrect}/${totalQuestions}문제 정답) — 완벽!`;
    homeworkLine = `오늘 배운 내용을 정확히 이해했습니다. 복습용 숙제를 숙제함에 발송했습니다.`;
  }

  const pushMsg = `[학부모 알림 - 수학]
👨‍🏫 ${session.teacher} 선생님과의 ${session.round}회차 수업 완료!

📚 오늘 배운 단원:
- ${topics}

${achievementLine}

💡 ${homeworkLine}

앱 내 '숙제함'에서 오늘의 숙제를 확인해 주세요!`;

  saveMathLessonResult(lessonResult);

  let studentName = '멘토스 학생';
  try { studentName = JSON.parse(localStorage.getItem('mentos_mock_user') || '{}')?.name || studentName; } catch { /* noop */ }
  queueParentPush(pushMsg, {
    templateKey: 'lessonEnd', // 수업종료리포트
    variables: {
      '#{학생명}': studentName,
      '#{과목}': '수학',
      '#{단원}': topics || '오늘 학습 단원',
      '#{문제수}': String(totalQuestions),
      '#{오답수}': String(totalWrong),
    },
  });

  return { lessonResult, pushMsg, homeworkInfo };
}
