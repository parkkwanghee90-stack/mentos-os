import { aggregateScienceLessonResult, saveScienceLessonResult } from './lessonResultAggregator.js';
import { generateScienceHomework } from './homeworkGenerator.js';
import { queueParentPush } from '@/services/pushService.js';

export function finalizeScienceSession(session) {
  console.log("=== [Finalize Science Lesson Session] Initialized ===");
  
  const lessonResult = aggregateScienceLessonResult(session);
  generateScienceHomework(lessonResult);

  const pushMsg = `[과학 학습 리포트] ${session.teacher} 선생님과의 ${session.round}회차 수업이 종료되었습니다. 숙제가 발송되었으니 확인 부탁드립니다.`;

  saveScienceLessonResult(lessonResult);
  queueParentPush(pushMsg);
  
  console.log("=== [Finalize Science Lesson Session] Completed ===");
  return { lessonResult, pushMsg };
}
