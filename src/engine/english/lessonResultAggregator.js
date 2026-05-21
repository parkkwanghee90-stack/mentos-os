export function aggregateEnglishLessonResult(session, evalData = {}) {
  const readingStats = evalData.reading || { totalQuestions: 5, correctCount: 4, wrongCount: 1 };
  const hearingStats = evalData.hearing || { totalQuestions: 4, correctCount: 3, wrongCount: 1 };
  const vocabStats = evalData.vocab || {
    wordTest: { totalQuestions: 5, correctCount: 4, wrongCount: 1 },
    vocabTest: { totalQuestions: 5, correctCount: 3, wrongCount: 2 }
  };

  const summary = {
    coveredTopics: ['however / therefore 논리 연결', '주제문 찾기', '빈칸 단어 의미 추론'],
    weakPoints: ['연결어 앞뒤 논리 변화 약함', '듣기 세부 정보 놓침'],
    strengths: ['중심 내용 파악 능력 좋음', '단어 회상 속도 양호']
  };

  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const lessonResult = {
    studentId: session.userId,
    teacherId: session.teacherId,
    subject: "english",
    rank: session.rank || [],
    round: session.round,
    date: dateStr,
    reading: readingStats,
    hearing: hearingStats,
    vocab: vocabStats,
    summary,
    lessonContent: session.curriculumData?.lessonContent || null
  };

  return lessonResult;
}

export function saveEnglishLessonResult(lessonResult) {
  const key = `eng_lessonResult_${lessonResult.studentId}_${lessonResult.teacherId}_${lessonResult.round}`;
  localStorage.setItem(key, JSON.stringify(lessonResult));
  console.log(`[saveEnglishLessonResult] Saved to ${key}:`, lessonResult);
  return true;
}
