import { aggregateMathLessonResult, saveMathLessonResult } from './lessonResultAggregator.js';
import { generateMathHomework } from './homeworkGenerator.js';
import { queueParentPush } from '@/services/pushService.js';

export function finalizeMathSession(session, solvedProblems = []) {
  console.log("=== [Finalize Math Lesson Session] Initialized ===");
  
  const lessonResult = aggregateMathLessonResult(session, {}, solvedProblems);
  generateMathHomework(lessonResult);

  // 학부모 푸시 알림 (오늘 배운 것 + 오늘 점수)
  const totalCorrect = lessonResult.core.correctCount + lessonResult.step.correctCount + lessonResult.mock.correctCount;
  const totalQuestions = lessonResult.core.totalQuestions + lessonResult.step.totalQuestions + lessonResult.mock.totalQuestions;
  const scorePercent = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  
  const topics = lessonResult.summary.coveredTopics.join(', ');
  const unitFeedback = lessonResult.summary.unitFeedback || "학습한 내용을 성실히 이수했습니다.";
  const reinforcementStatus = lessonResult.summary.reinforcementStatus || "기본 개념을 잘 숙지하고 있습니다.";

  const pushMsg = `[학부모 알림 - 수학]
👨‍🏫 ${session.teacher} 선생님과의 ${session.round}회차 수업 완료!

📚 오늘 배운 단원:
- ${topics}

📊 오늘의 성취도 점수: ${scorePercent}점 (${totalCorrect}/${totalQuestions}문제 정답)

📝 선생님 피드백:
${unitFeedback}

💡 복습 포인트:
${reinforcementStatus}

AI가 취약점을 분석하여 맞춤형 복습 과제를 발송했습니다. 앱 내 '숙제함'을 확인해 주세요!`;

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
      '#{오답수}': String(Math.max(0, totalQuestions - totalCorrect)),
    },
  });
  
  console.log("=== [Finalize Math Lesson Session] Completed ===");
  return { lessonResult, pushMsg };
}
