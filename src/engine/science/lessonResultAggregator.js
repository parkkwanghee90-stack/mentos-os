export function aggregateScienceLessonResult(session, evalData = {}) {
  const conceptStats = evalData.concept || { totalQuestions: 3, correctCount: 3, wrongCount: 0 };
  const examStats = evalData.exam || { totalQuestions: 5, correctCount: 4, wrongCount: 1 };

  const summary = {
    coveredTopics: ['물리 / 화학 등 핵심 개념', '기출 연계 문제'],
    weakPoints: ['응용 문제에서 공식 혼동'],
    strengths: ['기초 개념 암기 상태 우수']
  };

  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const lessonResult = {
    studentId: session.userId,
    teacherId: session.teacherId,
    subject: session.subject || "science",
    rank: session.rank || [],
    round: session.round,
    date: dateStr,
    concept: conceptStats,
    exam: examStats,
    summary,
    lessonContent: session.curriculumData?.lessonContent || null
  };

  return lessonResult;
}

export function saveScienceLessonResult(lessonResult) {
  const key = `sci_lessonResult_${lessonResult.studentId}_${lessonResult.teacherId}_${lessonResult.round}`;
  localStorage.setItem(key, JSON.stringify(lessonResult));
  console.log(`[saveScienceLessonResult] Saved to ${key}:`, lessonResult);
  return true;
}
