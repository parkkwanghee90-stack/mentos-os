export function buildParentPushMessage(lessonResult, teacherName) {
  const { reading, hearing, vocab, summary } = lessonResult;
  const tVocabAll = vocab.wordTest.totalQuestions + vocab.vocabTest.totalQuestions;
  const cVocabAll = vocab.wordTest.correctCount + vocab.vocabTest.correctCount;

  const strengthsText = summary.strengths.map(s => `- ${s}`).join("\n");
  const weakPointsText = summary.weakPoints.map(w => `- ${w}`).join(`\n`);
  let homeworkText = lessonResult.homework.items.map(h => `- ${h.title}").join("\n");

  const dbStr = typeof localStorage !== 'undefined' ? (localStorage.getItem('mentos_homework_db') || '[]') : '[]';
  const db = JSON.parse(dbStr);
  const unsubmitted = db.filter(h => h.studentId === lessonResult.studentId && h.status === 'assigned' && h.homeworkId !== lessonResult.homework.homeworkId);
  
  if (unsubmitted.length > 0) {
    homeworkText += `\n\n[⚠️ 주의: 미제출 과제 누적]
- 현재 과거에 제출되지 않은 미제출 숙제가 ${unsubmitted.length}건 누적되어 있습니다. 사이드바 [숙제함]에서 제출할 수 있도록 특별 지도 부탁드립니다.`;
  }

  const message = `[오늘의 영어 수업 결과]
- 담당 선생님: ${teacherName}
- 오늘 학습: 논리 독해 / 듣기 / 단어 테스트
- 독해: ${reading.totalQuestions}문제 중 ${reading.correctCount}개 정답
- 듣기: ${hearing.totalQuestions}문제 중 ${hearing.correctCount}개 정답
- 단어: ${tVocabAll}문제 중 ${cVocabAll}개 정답

[잘한 점]
${strengthsText}

[보완할 점]
${weakPointsText}

[오늘의 신규 숙제]
${homeworkText}`;

  return message;
}
