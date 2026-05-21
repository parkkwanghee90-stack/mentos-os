export function aggregateMathLessonResult(session, evalData = {}, solvedProblems = []) {
  const coreStats = evalData.core || { totalQuestions: 2, correctCount: 2, wrongCount: 0 };
  const stepStats = evalData.step || { totalQuestions: 3, correctCount: 2, wrongCount: 1 };
  const mockStats = evalData.mock || { totalQuestions: 5, correctCount: 3, wrongCount: 2 };

  // 단원명 동적 추출
  let learnedTopic = session.unit || '수학 핵심 개념';
  if (session.curriculumData?.lessonContent?.core?.title) {
    learnedTopic = session.curriculumData.lessonContent.core.title;
  }

  const summary = {
    coveredTopics: [learnedTopic],
    weakPoints: [`${learnedTopic} 응용 부족`],
    strengths: [`${learnedTopic} 기본 연산 우수`]
  };

  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const lessonResult = {
    studentId: session.userId,
    teacherId: session.teacherId,
    subject: "math",
    rank: session.rank || [],
    round: session.round,
    date: dateStr,
    core: coreStats,
    step: stepStats,
    mock: mockStats,
    summary,
    lessonContent: session.curriculumData?.lessonContent || null,
    solvedProblems // 🎯 오늘 푼 실제 문제 결과 목록 추가
  };

  return lessonResult;
}

export function saveMathLessonResult(lessonResult) {
  const key = `math_lessonResult_${lessonResult.studentId}_${lessonResult.teacherId}_${lessonResult.round}`;
  localStorage.setItem(key, JSON.stringify(lessonResult));
  console.log(`[saveMathLessonResult] Saved to ${key}:`, lessonResult);
  return true;
}
