import { aggregateEnglishLessonResult, saveEnglishLessonResult } from './lessonResultAggregator.js';
import { generateEnglishHomework } from './homeworkGenerator.js';
import { queueParentPush } from '@/services/pushService.js';

export function finalizeEnglishSession(session) {
  console.log("=== [Finalize English Lesson Session] Initialized ===");
  
  const lessonResult = aggregateEnglishLessonResult(session);
  generateEnglishHomework(lessonResult);

  const pushMsg = `[영어 학습 리포트] ${session.teacher} 선생님과의 ${session.round}회차 수업이 종료되었습니다. 숙제가 발송되었으니 확인 부탁드립니다.`;

  saveEnglishLessonResult(lessonResult);
  queueParentPush(pushMsg);
  
  console.log("=== [Finalize English Lesson Session] Completed ===");
  return { lessonResult, pushMsg };
}
