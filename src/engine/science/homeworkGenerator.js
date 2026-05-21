export function generateScienceHomework(lessonResult) {
  const rankStr = (lessonResult.rank || []).join('');
  const lessonContent = lessonResult.lessonContent || {};
  
  const concept = lessonContent.concept?.summary || "기초 과학 개념 요약본";
  const exam = lessonContent.exam?.question || "기본 과학 문제";

  let items = [];

  if (rankStr.includes('1') || rankStr.includes('2')) {
      items = [
          { type: 'concept', title: `[개념 보충] 다음 개념에 대해 백지 노트 복습을 수행하고, 심화 질문 2가지에 답하시오.\n내용: ${concept.substring(0, 50)}...` },
          { type: 'solve', title: '[심화 풀이] 오답과 관련된 고난도(킬러) 변형 문제 5개를 풀이 과정과 함께 제출하시오.' }
      ];
  } else if (rankStr.includes('3')) {
      items = [
          { type: 'concept', title: `[개념 확인] 다음 개념 중 핵심 키워드 5가지를 골라 뜻을 서술하시오.\n내용: ${concept.substring(0, 50)}...` },
          { type: 'problem', title: '[기출 훈련] 수업 중 틀린 문제와 유사한 3점 기출 10문제를 다시 푸시오.' }
      ];
  } else {
      items = [
          { type: 'concept', title: `[개념 암기] 오늘 배운 핵심 원리 3가지를 공책에 3번씩 적고 제출하시오.\n내용: ${concept.substring(0, 50)}...` },
          { type: 'problem', title: '[기초 적용] 교과서 수준의 기본 예제 5문제를 오늘 배운 공식을 사용해 푸시오.' }
      ];
  }

  const homeworkId = `sci_hw_${Date.now()}_${Math.random().toString(36).substring(2,7)}`;

  const homework = {
    homeworkId: homeworkId,
    studentId: lessonResult.studentId,
    teacherId: lessonResult.teacherId,
    subject: lessonResult.subject,
    round: lessonResult.round,
    assignedAt: Date.now(),
    status: "assigned",
    items
  };

  lessonResult.homework = homework;
  
  const dbStr = localStorage.getItem('mentos_sci_homework_db') || '[]';
  const db = JSON.parse(dbStr);
  db.push(homework);
  localStorage.setItem('mentos_sci_homework_db', JSON.stringify(db));

  console.log('[generateScienceHomework] Homework assigned:', homework);

  return homework;
}
